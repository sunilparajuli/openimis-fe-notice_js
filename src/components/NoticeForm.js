import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { Badge } from "@material-ui/core";
import AttachIcon from "@material-ui/icons/AttachFile";
import ReplayIcon from "@material-ui/icons/Replay";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush, journalize,
    Form, ProgressOrError, formatMessage, coreAlert, coreConfirm
} from "@openimis/fe-core";
import NoticeMasterPanel from "../components/NoticeMasterPanel";
// TODO: Email/SMS notification panel to be developed in a future release
import NoticeAttachmentsDialog from "../components/NoticeAttachmentsDialog";
import { createNotice, updateNotice, getNotice } from "../actions";
import { RIGHT_NOTICE_ADD, RIGHT_NOTICE_EDIT } from "../constants";

const styles = theme => ({
    page: theme.page,
    paperHeaderAction: theme.paper.action,
});

const NOTICE_FORM_CONTRIBUTION_KEY = "notice.NoticeForm";

class NoticeForm extends Component {
    state = {
        lockNew: false,
        reset: 0,
        notice_uuid: null,
        notice: this._newNotice(),
        newNotice: true,
        isSaved: false,
        attachmentsNotice: null,
        readOnlyAfterSave: false // New flag to track readonly after save
    }

    _newNotice() {
        return {
            uuid: null,
            title: "",
            description: "",
            priority: "MEDIUM",
            healthFacility: null,
            createdAt: null,
            updatedAt: null,
            isActive: true,
            attachmentsCount: 0,
            schedulePublish: false,
            publishStartDate: null,
        };
    }

    componentDidMount() {
        document.title = formatMessageWithValues(
            this.props.intl, "notice", "notices", { label: "Notices" }
        );
        if (this.props.notice_uuid) {
            this.setState(
                { notice_uuid: this.props.notice_uuid },
                () => this.props.getNotice(
                    this.props.modulesManager,
                    this.props.notice_uuid
                )
            );
        }
    }

    back = () => {
        const { modulesManager, history } = this.props;
        historyPush(modulesManager, history, "notice.route.notices");
    }

    componentDidUpdate(prevProps) {
        if (prevProps.fetchedNotice !== this.props.fetchedNotice && this.props.fetchedNotice) {
            const notice = this.props.notice;
            this.setState({
                notice,
                notice_uuid: notice.uuid,
                lockNew: false,
                newNotice: false
            });
        } else if (prevProps.notice_uuid && !this.props.notice_uuid) {
            document.title = formatMessage(this.props.intl, "notice", "NoticeForm.title.new");
            this.setState({
                notice: this._newNotice(),
                newNotice: true,
                lockNew: false,
                isSaved: false,
                notice_uuid: null,
                readOnlyAfterSave: false
            });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            const wasNew = this.state.newNotice;
            this.setState({
                reset: this.state.reset + 1,
                isSaved: true,
                lockNew: false,
                readOnlyAfterSave: true,
                pendingUploadPrompt: wasNew,
            });
            historyPush(this.props.modulesManager, this.props.history, "notice.route.notices");
        } else if (prevProps.confirmed !== this.props.confirmed && this.props.confirmed && this.state.pendingUploadPrompt) {
            this.setState({ pendingUploadPrompt: false, attachmentsNotice: this.state.notice });
        }
    }

    showUploadDocumentsPrompt = () => {
        const { intl, coreConfirm } = this.props;
        coreConfirm(
            formatMessage(intl, "notice", "notice.created.title"),
            formatMessage(intl, "notice", "notice.uploadDocuments.prompt"),
        );
    }

    _add = () => {
        this.setState(
            (state) => ({
                notice: this._newNotice(),
                newNotice: true,
                lockNew: false,
                readOnlyAfterSave: false,
                reset: state.reset + 1,
            }),
            () => {
                this.props.add();
                this.forceUpdate();
            }
        );
    }

    reload = () => {
        this.setState({ readOnlyAfterSave: false }); // Reset readonly on reload
        this.props.getNotice(
            this.props.modulesManager,
            this.state.notice_uuid
        );
    }

    canSave = () => {
        const { notice } = this.state;
        if (!notice.title) return false;
        if (!notice.description) return false;
        if (!notice.priority) return false;
        if (!notice.healthFacility) return false;
        return true;
    }

    _save = (notice) => {
        if (!this.canSave()) {
            this.props.coreAlert(
                formatMessage(this.props.intl, "notice", "notice.missingAttachment"),
                formatMessage(this.props.intl, "notice", "notice.attachFile")
            );
            this.setState({ reset: this.state.reset + 1 });
            return;
        }
        this.setState(
            { lockNew: !notice.uuid },
            () => this.props.save(notice)
        );
    }

    onEditedChanged = notice => {
        this.setState({ notice, newNotice: false });
    }

    render() {
        const {
            intl, notice_uuid, fetchingNotice, fetchedNotice, errorNotice,
            add, save, rights, classes
        } = this.props;
        const { notice, lockNew, readOnlyAfterSave } = this.state;

        const readOnly = readOnlyAfterSave;

        const actions = [];
        if (notice_uuid) {
            actions.push({
                doIt: this.reload,
                icon: <ReplayIcon />,
                onlyIfDirty: !readOnly,
            });
        }


        if (!readOnly) {
            actions.push({
                doIt: () => this.setState({ attachmentsNotice: notice }),
                icon: (
                    <Badge badgeContent={notice.attachmentsCount || 0} color="primary">
                        <AttachIcon />
                    </Badge>
                ),
            });
        }

        return (
            <div>
                <ProgressOrError progress={fetchingNotice} error={errorNotice} />

                <Fragment>
                    <NoticeAttachmentsDialog
                        notice={this.state.attachmentsNotice}
                        close={() => this.setState({ attachmentsNotice: null })}
                        onUpdated={() => this.setState({ forcedDirty: true })}
                    />
                    {(fetchedNotice || !notice_uuid) && (
                        <Form
                            module="notice"
                            edited_id={notice_uuid}
                            edited={notice}
                            reset={this.state.reset}
                            title={notice_uuid ? "NoticeForm.title" : "NoticeForm.title.new"}
                            titleParams={{ code: notice_uuid || "" }}
                            back={this.back}
                            add={add && rights.includes(RIGHT_NOTICE_ADD) ? this._add : null}
                            save={
                                save && !readOnly && 
                                (notice_uuid ? rights.includes(RIGHT_NOTICE_EDIT) : rights.includes(RIGHT_NOTICE_ADD)) 
                                    ? this._save : null
                            }
                            canSave={this.canSave}
                            reload={notice_uuid && this.reload}
                            readOnly={readOnly}
                            HeadPanel={NoticeMasterPanel}
                            Panels={[]}
                            onEditedChanged={this.onEditedChanged}
                            actions={actions}
                        />)}
                </Fragment>

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    fetchingNotice: state.notice?.fetchingNotice,
    errorNotice: state.notice?.errorNotice,
    fetchedNotice: state.notice?.fetchedNotice,
    notice: state.notice?.notice,
    submittingMutation: state.notice?.submittingMutation,
    mutation: state.notice?.mutation,
    rights: state.core?.user?.i_user?.rights || [],
    confirmed: state.core?.confirmed,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createNotice, updateNotice, getNotice, journalize, coreAlert, coreConfirm }, dispatch);
};

export default withHistory(
    withModulesManager(
        connect(mapStateToProps, mapDispatchToProps)(
            injectIntl(withTheme(withStyles(styles)(NoticeForm)))
        )
    )
);
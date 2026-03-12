import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import NoticeForm from  "../components/NoticeForm"
import { createNotice, updateNotice } from "../actions";
import { RIGHT_NOTICE_ADD, RIGHT_NOTICE_EDIT } from "../constants";


const styles = theme => ({
    page: theme.page,
});

class NoticePage extends Component {
    add = () => {
        historyPush(this.props.modulesManager, this.props.history, "notice.route.noticeEdit");
    }
    save = (notice) => {
        if (!notice.uuid) {
            this.props.createNotice(
                this.props.modulesManager,
                notice,
                formatMessageWithValues(
                    this.props.intl,
                    "notice",
                    "CreateNotice.mutationLabel",
                    { label: notice.uuid || "" }
                )
            );
        } else {
            this.props.updateNotice(
                this.props.modulesManager,
                notice,
                formatMessageWithValues(
                    this.props.intl,
                    "notice",
                    "UpdateNotice.mutationLabel",
                    { label: notice.uuid || "" }
                )
            );
        }
    }

    render() {
        const { classes, modulesManager, history, rights, notice_uuid } = this.props;
            //if (!rights.includes(RIGHT_NOTICE_ADD)) return null;
        return (
            <div className={classes.page}>
                <NoticeForm
                    notice_uuid={notice_uuid}
                    back={() => historyPush(modulesManager, history, "notice.route.notices")}
                    add={rights.includes(RIGHT_NOTICE_ADD) ? this.add : null}
                    save={rights.includes(RIGHT_NOTICE_EDIT) ? this.save : null}
                />
            </div>
           
        );
    }
}

const mapStateToProps = (state, props) => ({
    rights: state.core?.user?.i_user?.rights || [],
    notice_uuid: props.match.params.notice_uuid,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createNotice, updateNotice }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(NoticePage)))
)));

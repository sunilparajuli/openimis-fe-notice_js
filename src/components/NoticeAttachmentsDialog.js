import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import {
  Dialog,
  DialogTitle,
  Divider,
  Button,
  DialogActions,
  DialogContent,
  Link,
  IconButton,
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import FileIcon from "@material-ui/icons/Add";
import LinkIcon from "@material-ui/icons/Link";
import VisibilityIcon from "@material-ui/icons/Visibility";
import SlideshowIcon from "@material-ui/icons/Slideshow";
import {
  FormattedMessage,
  withModulesManager,
  ProgressOrError,
  Table,
  TextInput,
  PublishedComponent,
  withTooltip,
  formatMessage,
  formatMessageWithValues,
  journalize,
  coreConfirm,
  coreAlert,
} from "@openimis/fe-core";
import {
  fetchNoticeAttachments,
  downloadAttachment,
  deleteAttachment,
  createAttachment,
  updateAttachment,
} from "../actions";
import { DEFAULT, RIGHT_NOTICE_ADD, URL_TYPE_STRING } from "../constants";
import AttachmentGeneralTypePicker from "../pickers/AttachmentGeneralTypePicker";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class NoticeAttachmentsDialog extends Component {
  constructor(props) {
    super(props);
    this.allowedDomainsAttachments = props.modulesManager.getConf(
      "fe-notice",
      "allowedDomainsAttachments",
      DEFAULT.ALLOWED_DOMAINS_ATTACHMENTS,
    );
    this.supportedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    this.state = {
      open: false,
      noticeUuid: null,
      noticeAttachments: [],
      attachmentToDelete: null,
      updatedAttachments: new Set(),
      reset: 0,
      carouselOpen: false,
      devMode: true, // Default to false; set to true for unrestricted uploads
    };
  }

  componentDidUpdate(prevProps) {
    const { readOnly = false } = this.props;
    if (prevProps.noticeAttachments !== this.props.noticeAttachments) {
      let noticeAttachments = [...(this.props.noticeAttachments || [])];
      // Ensure an empty row is added when editing, unless read-only
      if (this.state.devMode || (!readOnly && this.props.rights.includes(RIGHT_NOTICE_ADD) && _.last(noticeAttachments) !== {})) {
        noticeAttachments.push({ title: "", type: "" });
      }
      this.setState({ noticeAttachments, updatedAttachments: new Set() });
    } else if (prevProps.notice !== this.props.notice && this.props.notice && this.props.notice.uuid) {
      this.setState(
        (state, props) => ({
          open: true,
          noticeUuid: props.notice.uuid,
          noticeAttachments: (readOnly || this.state.devMode) ? [] : [{ title: "", type: "" }],
          updatedAttachments: new Set(),
        }),
        () => {
          if (this.props.notice && this.props.notice.uuid) {
            this.props.fetchNoticeAttachments(this.props.notice);
          }
        },
      );
    } else if (prevProps.notice !== this.props.notice && this.props.notice && !this.props.notice.uuid) {
      let noticeAttachments = [...(this.props.notice.attachments || [])];
      if (!readOnly) {
        noticeAttachments.push({ title: "", type: "" });
        this.props.onUpdated();
      }
      this.setState({ open: true, noticeUuid: null, noticeAttachments, updatedAttachments: new Set() });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      let noticeAttachments = [...this.state.noticeAttachments];
      if (this.state.attachmentToDelete) {
        noticeAttachments = noticeAttachments.filter((a) => a.uuid !== this.state.attachmentToDelete.uuid);
      }
      // Always ensure an empty row after mutation if not read-only
      if (!readOnly && !this.isEmptyAttachment(_.last(noticeAttachments))) {
        noticeAttachments.push({ title: "", type: "" });
      }
      this.setState((state) => ({
        noticeAttachments,
        updatedAttachments: new Set(),
        attachmentToDelete: null,
        reset: state.reset + 1,
      }));

      // Refetch attachments to get complete data including document content
      if (this.state.noticeUuid && this.props.notice && this.props.notice.uuid) {
        this.props.fetchNoticeAttachments(this.props.notice);
      }
    } else if (
      prevProps.confirmed !== this.props.confirmed &&
      this.props.confirmed &&
      this.state.attachmentToDelete
    ) {
      const title = this.state.attachmentToDelete.title || "";
      const filename = this.state.attachmentToDelete.filename ? `(${this.state.attachmentToDelete.filename})` : "";
      this.props.deleteAttachment(
        this.state.attachmentToDelete,
        formatMessageWithValues(this.props.intl, "notice", "noticeAttachment.delete.mutationLabel", {
          file: `${title} ${filename}`,
          title: this.props.notice.title,
        }),
      );
    }
  }

  isEmptyAttachment = (attachment) => {
    return (
      attachment &&
      (attachment.title === "" || attachment.title === undefined) &&
      (attachment.type === "" || attachment.type === undefined) &&
      Object.keys(attachment).length <= 2
    );
  };

  onClose = () => this.setState({ open: false, carouselOpen: false }, () => this.props.close && this.props.close());

  validateUrl(url, omitValidation = false) {
    if (omitValidation) return { isValid: true, error: null };
    try {
      const parsedUrl = new URL(url);
      if (this.allowedDomainsAttachments.length === 0) return { isValid: true, error: null };
      const enteredDomain = parsedUrl.hostname;
      const isDomainAllowed = this.allowedDomainsAttachments.some((allowedDomain) =>
        enteredDomain.endsWith(allowedDomain),
      );
      return { isValid: isDomainAllowed, error: isDomainAllowed ? null : "url.validation.notAllowed" };
    } catch (error) {
      return { isValid: false, error: "url.validation.invalidURL" };
    }
  }

  delete = (a, i) => {
    if (a.id) {
      const filename = a.filename ? `(${a.filename})` : "";
      this.setState({ attachmentToDelete: a }, () =>
        this.props.coreConfirm(
          formatMessage(this.props.intl, "notice", "deleteNoticeAttachment.confirm.title"),
          formatMessageWithValues(this.props.intl, "notice", "deleteNoticeAttachment.confirm.message", {
            file: `${a.title} ${filename}`,
          }),
        ),
      );
    } else {
      const noticeAttachments = [...this.state.noticeAttachments];
      noticeAttachments.splice(i, 1);
      noticeAttachments.pop();
      this.props.notice.attachments = [...noticeAttachments];
      this.props.notice.attachmentsCount =
        this.props.notice.attachments.length > 0 ? this.props.notice.attachments.length : 0;
      noticeAttachments.push({ title: "", type: "" });
      this.setState((state) => ({ noticeAttachments, reset: state.reset + 1 }));
    }
  };

  addAttachment = (document) => {
    let attachment = { ..._.last(this.state.noticeAttachments), document };
    if (this.state.noticeUuid) {
      const filename = attachment.filename ? `(${attachment.filename})` : "";
      this.props.createAttachment(
        { ...attachment, noticeUuid: this.state.noticeUuid },
        formatMessageWithValues(this.props.intl, "notice", "noticeAttachment.create.mutationLabel", {
          file: `${attachment.title || ""} ${filename}`,
          title: this.props.notice.title,
        }),
      );
    } else {
      if (!this.props.notice.attachments) this.props.notice.attachments = [];
      this.props.notice.attachments.push(attachment);
      var noticeAttachments = [...this.props.notice.attachments];

      this.props.notice.attachmentsCount = this.props.notice.attachments.length;
      noticeAttachments.push({ title: "", type: "" });
      this.setState({ noticeAttachments });
    }
  };

  update = (i) => {
    let attachment = { noticeUuid: this.state.noticeUuid, ...this.state.noticeAttachments[i] };
    const filename = attachment.filename ? `(${attachment.filename})` : "";
    this.props.updateAttachment(
      attachment,
      formatMessageWithValues(this.props.intl, "notice", "noticeAttachment.update.mutationLabel", {
        file: `${attachment.title || ""} ${filename}`,
        title: this.props.notice.title,
      }),
    );
  };

  download = (a) => this.props.downloadAttachment(a);

  previewPDF = (attachment) => {
    if (attachment.doc && attachment.mime === "application/pdf") {
      const byteCharacters = atob(attachment.doc);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    }
  };

  fileSelected = (f, i) => {
    if (f.target.files) {
      const file = f.target.files[0];
      let noticeAttachments = [...this.state.noticeAttachments];

      // Only restrict MIME types if devMode is false
      if (!this.state.devMode && !this.supportedMimeTypes.includes(file.type)) {
        this.props.coreAlert(
          formatMessage(this.props.intl, "notice", "fileUpload.restrictedType.title"),
          formatMessageWithValues(this.props.intl, "notice", "fileUpload.restrictedType.message", {
            supportedTypes: this.supportedMimeTypes.join(", "),
            fileType: file.type,
          })
        );
        return;
      }

      noticeAttachments[i].filename = file.name;
      noticeAttachments[i].mime = file.type;
      this.setState({ noticeAttachments }, () => {
        const reader = new FileReader();
        reader.onloadend = (loaded) => this.addAttachment(btoa(loaded.target.result));
        reader.readAsBinaryString(file);
      });
    }
  };

  formatFileName(a, i) {
    if (a.uuid) {
      return <Link onClick={() => this.download(a)} reset={this.state.reset}>{a.filename || ""}</Link>;
    }
    if (a.filename) return <i>{a.filename}</i>;
    return (
      <IconButton variant="contained" component="label">
        <FileIcon />
        <input type="file" style={{ display: "none" }} onChange={(f) => this.fileSelected(f, i)} />
      </IconButton>
    );
  }

  urlSelected = (f, i) => {
    const { coreAlert, intl } = this.props;
    const url = this.validateUrl(f);
    if (!url.isValid) {
      coreAlert(
        formatMessage(intl, "notice", "url.validation.error"),
        url.error ? formatMessage(intl, "notice", url.error) : formatMessage(intl, "notice", "url.validation.generalError"),
      );
      return;
    }
    if (f) {
      let noticeAttachments = [...this.state.noticeAttachments];
      noticeAttachments[i].url = f;
      noticeAttachments[i].mime = "text/x-uri";
      this.setState({ noticeAttachments }, () => this.addAttachment(f));
    }
  };

  formatUrl(a, i) {
    const { noticeAttachments, reset } = this.state;
    if (a.mime) {
      return <Link onClick={() => window.open(a.url)} reset={reset}>{withTooltip(<LinkIcon />, a.url)}</Link>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <TextInput
          reset={reset}
          value={noticeAttachments[i].url}
          onChange={(v) => this.updateAttachment(i, "url", v)}
        />
        <IconButton variant="contained" component="label" onClick={() => this.urlSelected(noticeAttachments[i].url, i)}>
          <FileIcon />
        </IconButton>
      </div>
    );
  }

  updateAttachment = (i, key, value) => {
    const state = { ...this.state };
    state.noticeAttachments[i][key] = value;
    state.updatedAttachments.add(i);
    state.reset = state.reset + 1;
    this.setState(state);
  };

  cannotUpdate = (a, i) => i < this.state.noticeAttachments.length - 1 && this.state.noticeUuid && !a.uuid && !a.id;

  toggleCarousel = () => {
    this.setState((prevState) => ({
      carouselOpen: !prevState.carouselOpen,
    }));
  };

  getFilteredAttachments = () => {
    // If devMode is true, return all FILE attachments regardless of MIME type
    if (this.state.devMode) {
      return this.state.noticeAttachments.filter(
        (attachment) => attachment.generalType === "FILE" && attachment.doc
      );
    }
    // Otherwise, apply MIME type restrictions
    return this.state.noticeAttachments.filter(
      (attachment) =>
        attachment.generalType === "FILE" &&
        attachment.doc &&
        this.supportedMimeTypes.includes(attachment.mime)
    );
  };

  render() {
    const { classes, notice, readOnly = false, fetchingNoticeAttachments, errorNoticeAttachments } = this.props;
    const { noticeAttachments, reset, updatedAttachments, carouselOpen } = this.state;
    const open = Boolean(this.props.notice);

    if (!notice) return null;

    const headers = [
      "noticeAttachment.generalType",
      "noticeAttachment.type",
      "noticeAttachment.title",
      "noticeAttachment.date",
      "noticeAttachment.fileName",
    ];

    const itemFormatters = [
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          noticeAttachments[index].generalType
        ) : (
          <AttachmentGeneralTypePicker
            readOnly={noticeAttachments[index].uuid}
            reset={reset}
            withNull={false}
            value={noticeAttachments[index].generalType}
            onChange={(v) => this.updateAttachment(index, "generalType", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          noticeAttachments[index].type
        ) : (
          <TextInput
            reset={reset}
            readOnly={readOnly}
            value={noticeAttachments[index].type}
            onChange={(v) => this.updateAttachment(index, "type", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          noticeAttachments[index].title
        ) : (
          <TextInput
            reset={reset}
            readOnly={readOnly}
            value={noticeAttachments[index].title}
            onChange={(v) => this.updateAttachment(index, "title", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          noticeAttachments[index].date
        ) : (
          <PublishedComponent
            pubRef="core.DatePicker"
            readOnly={readOnly}
            onChange={(v) => this.updateAttachment(index, "date", v)}
            value={noticeAttachments[index].date || null}
            reset={reset}
          />
        ),
      (attachment, index) =>
        noticeAttachments[index].url || noticeAttachments[index].generalType === URL_TYPE_STRING
          ? this.formatUrl(attachment, index)
          : this.formatFileName(attachment, index),
    ];

    if (!readOnly) {
      headers.push("noticeAttachment.action");
      itemFormatters.push((attachment, index) => {
        const actions = [];
        if (attachment.uuid && updatedAttachments.has(index)) {
          actions.push(
            <IconButton onClick={() => this.update(index)} key="save">
              <SaveIcon />
            </IconButton>
          );
        }
        if (index < noticeAttachments.length - 1) {
          actions.push(
            <IconButton onClick={() => this.delete(attachment, index)} key="delete">
              <DeleteIcon />
            </IconButton>
          );
        }
        if (attachment.generalType === "FILE" && attachment.mime === "application/pdf" && attachment.doc) {
          actions.push(
            <IconButton onClick={() => this.previewPDF(attachment)} key="preview">
              <VisibilityIcon />
            </IconButton>
          );
        }
        return actions.length ? <div>{actions}</div> : null;
      });
    } else {
      headers.push("noticeAttachment.preview");
      itemFormatters.push((attachment) =>
        attachment.generalType === "FILE" && attachment.mime === "application/pdf" && attachment.doc ? (
          <IconButton onClick={() => this.previewPDF(attachment)}>
            <VisibilityIcon />
          </IconButton>
        ) : null
      );
    }

    const filteredAttachments = this.getFilteredAttachments();

    return (
      <Dialog
        open={open}
        fullWidth={true}
        PaperProps={{ style: { width: "800px", maxWidth: "none" } }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage module="notice" id="attachments.title" values={{ title: notice.title }} />
        </DialogTitle>
        <Divider />
        <DialogContent className={classes.dialogContent}>
          <ProgressOrError progress={fetchingNoticeAttachments} error={errorNoticeAttachments} />
          {!fetchingNoticeAttachments && !errorNoticeAttachments && !carouselOpen && (
            <Table module="notice" items={noticeAttachments} headers={headers} itemFormatters={itemFormatters} />
          )}
          {carouselOpen && (
            <PublishedComponent
              pubRef="notice.Carousel"
              attachments={noticeAttachments}
              claim={this.state.attachmentsClaim}
              onClose={this.toggleCarousel}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.toggleCarousel}
            variant="outlined"
            color="primary"
            disabled={filteredAttachments.length === 0}
          >
            <SlideshowIcon />
            <FormattedMessage module="notice" id="carousel.preview" />
          </Button>
          <Button onClick={this.onClose} variant="contained" color="primary">
            <FormattedMessage module="notice" id="close" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
  confirmed: state.core.confirmed,
  submittingMutation: state.notice.submittingMutation,
  mutation: state.notice.mutation,
  fetchingNoticeAttachments: state.notice.fetchingNoticeAttachments,
  fetchedNoticeAttachments: state.notice.fetchedNoticeAttachments,
  errorNoticeAttachments: state.notice.errorNoticeAttachments,
  noticeAttachments: state.notice.noticeAttachments,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeAttachments,
      downloadAttachment,
      deleteAttachment,
      createAttachment,
      updateAttachment,
      coreConfirm,
      journalize,
      coreAlert,
    },
    dispatch
  );

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(NoticeAttachmentsDialog))))
);
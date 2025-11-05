// src/pages/AllNotices.js
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  withHistory,
  formatMessageWithValues,
  historyPush,
  PublishedComponent,
  coreAlert,
} from "@openimis/fe-core";
import { fetchNotices, toggleNoticeStatus, fetchNoticeAttachments } from "../actions";
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import SlideshowIcon from "@material-ui/icons/Slideshow";
import Shimmer from "../components/Shimmer";
import Pagination from "../components/Pagination";
import NoticeCalendar from "../components/NoticeCalendar";
import NoticeCardContent from "../components/NoticeCardContent";
import AccessibilityControls from "../components/AccessibilityControls";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
  list: {
    width: "100%",
    padding: theme.spacing(2),
  },
  listItem: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      cursor: "pointer",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    fontWeight: 500,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  contentContainer: {
    flexGrow: 1,
    width: "100%",
    minWidth: 0,
    marginLeft: theme.spacing(2),
  },
  secondaryAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: "15%",
  },
  previewButton: {
    marginLeft: theme.spacing(1),
  },
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class AllNotices extends Component {
  state = {
    currentPage: 1,
    carouselOpen: false,
    selectedNotice: null,
    textSize: 50, // Default to middle of range (0-100)
    textColor: "#000000", // Default color (black)
  };

  componentDidMount() {
    
    this.fetchNoticesForPage();
  }

  fetchNoticesForPage = () => {
    const { currentPage } = this.state;
    const { noticesPageInfo } = this.props;
    const itemsPerPage = 10;
    
    if (currentPage === 1) {
      this.props.fetchNotices(this.props.modulesManager, [`first: ${itemsPerPage}`, `isActive : ${true}`]);
    } else {
      const after = noticesPageInfo?.endCursor;
      this.props.fetchNotices(this.props.modulesManager, [
        `first: ${itemsPerPage}`,
        `after: "${after}"`,
        `isActive : ${true}`
      ]);
    }
  };

  toggleStatus = (notice) => {
    const newStatus = !notice.isActive;
    this.props.toggleNoticeStatus(this.props.modulesManager, notice.uuid, newStatus);
  };

  editNotice = (uuid) => {
    historyPush(this.props.modulesManager, this.props.history, "notice.route.noticeEdit", [uuid]);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "notice.route.noticeEdit");
  };

  canAdd() {
    return this.props.userRights.includes("NOTICE_ADD");
  }

  toggleCarousel = (notice) => {
    if (!this.state.carouselOpen) {
      this.props.fetchNoticeAttachments(notice).then(() => {
        this.setState({
          carouselOpen: true,
          selectedNotice: notice,
        });
      }).catch((error) => {
        this.props.coreAlert(
          formatMessageWithValues(this.props.intl, "notice", "fetchAttachmentsError"),
          error.message
        );
      });
    } else {
      this.setState({
        carouselOpen: false,
        selectedNotice: null,
      });
    }
  };

  handlePageChange = (newPage) => {
    this.setState({ currentPage: newPage }, this.fetchNoticesForPage);
  };

  handleTextSizeChange = (event, newValue) => {
    this.setState({ textSize: newValue });
  };

  handleTextColorChange = (event) => {
    this.setState({ textColor: event.target.value });
  };

  render() {
    const {
      classes,
      intl,
      fetchingNotices,
      notices,
      noticesPageInfo,
      errorNotices,
      fetchingNoticeAttachments,
      noticeAttachments,
      errorNoticeAttachments,
    } = this.props;
    const { currentPage, carouselOpen, selectedNotice, textSize, textColor } = this.state;

    if (fetchingNotices) {
      return (
        <div className={classes.loading}>
          <Shimmer />
        </div>
      );
    }

    if (errorNotices) {
      return (
        <div className={classes.page}>
          <Typography variant="h6" color="error" align="center">
            {formatMessageWithValues(intl, "notice", "fetchError", {
              error: errorNotices.message,
            })}
          </Typography>
        </div>
      );
    }

    if (!notices || notices.length === 0) {
      return (
        <div className={classes.page}>
          <Typography variant="h6" align="center">
            {formatMessageWithValues(intl, "notice", "noNotices")}
          </Typography>
        </div>
      );
    }

    return (
      <div className={classes.page}>
        {/* Header with Title and Accessibility Controls */}
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            {formatMessageWithValues(intl, "notice", "allNoticesTitle")}
          </Typography>
          <AccessibilityControls
            textSize={textSize}
            textColor={textColor}
            onTextSizeChange={this.handleTextSizeChange}
            onTextColorChange={this.handleTextColorChange}
          />
        </div>
        <List className={classes.list}>
          {notices.map((notice, index) => (
            <Fragment key={notice.uuid}>
              <ListItem
                className={classes.listItem}
                style={{
                  backgroundColor: notice.isActive ? "#e1f5fe" : "#fff3e0",
                }}
              >
                <NoticeCalendar createdAt={notice.createdAt} />
                <div className={classes.contentContainer}>
                  <NoticeCardContent
                    notice={notice}
                    textSize={textSize}
                    textColor={textColor}
                  />
                </div>
                <ListItemSecondaryAction className={classes.secondaryAction}>
                  {notice.attachmentCount > 0 && (
                    <IconButton
                      className={classes.previewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.toggleCarousel(notice);
                      }}
                      disabled={fetchingNoticeAttachments && selectedNotice?.uuid === notice.uuid}
                    >
                      <SlideshowIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => this.editNotice(notice.uuid)}>
                    <EditIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < notices.length - 1 && <Divider />}
            </Fragment>
          ))}
        </List>
        {carouselOpen && selectedNotice && (
          <Dialog
            open={carouselOpen}
            onClose={() => this.toggleCarousel(selectedNotice)}
            fullWidth
            maxWidth="md"
            PaperProps={{ style: { minHeight: "500px" } }}
          >
            <DialogTitle className={classes.dialogTitle}>
              {formatMessageWithValues(intl, "notice", "attachmentPreviewTitle", {
                title: selectedNotice.title,
              })}
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              {fetchingNoticeAttachments ? (
                <Shimmer />
              ) : errorNoticeAttachments ? (
                <Typography color="error">
                  {formatMessageWithValues(intl, "notice", "fetchAttachmentsError", {
                    error: errorNoticeAttachments.message,
                  })}
                </Typography>
              ) : (
                <PublishedComponent
                  pubRef="notice.Carousel"
                  attachments={noticeAttachments}
                  onClose={() => this.toggleCarousel(selectedNotice)}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
        <Pagination
          currentPage={currentPage}
          hasNextPage={noticesPageInfo?.hasNextPage || false}
          hasPreviousPage={noticesPageInfo?.hasPreviousPage || false}
          onPageChange={this.handlePageChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userRights: state.core?.user?.i_user?.rights || [],
  fetchingNotices: state.notice?.fetchingNotices || false,
  fetchedNotices: state.notice?.fetchedNotices || false,
  notices: state.notice?.notices || [],
  noticesPageInfo: state.notice?.noticesPageInfo || {
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  errorNotices: state.notice?.errorNotices || null,
  submittingMutation: state.notice?.submittingMutation || false,
  mutation: state.notice?.mutation || {},
  fetchingNoticeAttachments: state.notice?.fetchingNoticeAttachments || false,
  fetchedNoticeAttachments: state.notice?.fetchedNoticeAttachments || false,
  noticeAttachments: state.notice?.noticeAttachments || [],
  errorNoticeAttachments: state.notice?.errorNoticeAttachments || null,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchNotices,
      toggleNoticeStatus,
      fetchNoticeAttachments,
      coreAlert,
    },
    dispatch
  );
};

export default withModulesManager(
  withHistory(
    withTheme(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(injectIntl(AllNotices))
      )
    )
  )
);
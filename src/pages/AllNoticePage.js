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
import Magnifier from "../components/Magnifier";

const styles = (theme) => ({
  page: {
    ...theme.page,
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },
  title: {
    fontWeight: 700,
    color: theme.palette.primary.main,
    letterSpacing: "-0.02em",
  },
  list: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: 0,
  },
  listItem: {
    padding: theme.spacing(1),
    borderRadius: theme.spacing(2),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      backgroundColor: "#ffffff",
    },
  },
  contentContainer: {
    flexGrow: 1,
    width: "100%",
    minWidth: 0,
  },
  secondaryAction: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    position: "relative",
    transform: "none",
    top: "auto",
    right: "auto",
  },
  fab: theme.fab,
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
});


class AllNotices extends Component {
  state = {
    currentPage: 1,
    carouselOpen: false,
    selectedNotice: null,
    textSize: 50,
    textColor: "#000000",
    lineHeight: 1.5,
    highContrast: false,
    dyslexicFont: false,
    magnifierActive: false,
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

  handleLineHeightChange = (event, newValue) => {
    this.setState({ lineHeight: newValue });
  };

  toggleHighContrast = () => {
    this.setState((prevState) => ({ highContrast: !prevState.highContrast }));
  };

  toggleDyslexicFont = () => {
    this.setState((prevState) => ({ dyslexicFont: !prevState.dyslexicFont }));
  };

  toggleMagnifier = () => {
    this.setState((prevState) => ({ magnifierActive: !prevState.magnifierActive }));
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
    const { 
      currentPage, 
      carouselOpen, 
      selectedNotice, 
      textSize, 
      textColor, 
      lineHeight, 
      highContrast, 
      dyslexicFont, 
      magnifierActive 
    } = this.state;

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
        <Magnifier active={magnifierActive} />
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            {formatMessageWithValues(intl, "notice", "allNoticesTitle")}
          </Typography>
          <AccessibilityControls
            textSize={textSize}
            textColor={textColor}
            lineHeight={lineHeight}
            highContrast={highContrast}
            dyslexicFont={dyslexicFont}
            magnifierActive={magnifierActive}
            onTextSizeChange={this.handleTextSizeChange}
            onTextColorChange={this.handleTextColorChange}
            onLineHeightChange={this.handleLineHeightChange}
            onToggleHighContrast={this.toggleHighContrast}
            onToggleDyslexicFont={this.toggleDyslexicFont}
            onToggleMagnifier={this.toggleMagnifier}
          />
        </div>
        <List className={classes.list}>
          {notices.map((notice, index) => (
            <Fragment key={notice.uuid}>
              <ListItem
                className={classes.listItem}
                style={{
                  backgroundColor: highContrast ? "#000000" : (notice.isActive ? "#e1f5fe" : "#fff3e0"),
                  border: highContrast ? "2px solid #ffffff" : "none",
                }}
              >
                <NoticeCalendar createdAt={notice.createdAt} />
                <div className={classes.contentContainer}>
                  <NoticeCardContent
                    notice={notice}
                    textSize={textSize}
                    textColor={highContrast ? "#ffffff" : textColor}
                    lineHeight={lineHeight}
                    highContrast={highContrast}
                    dyslexicFont={dyslexicFont}
                  />
                </div>
                <div className={classes.secondaryAction}>
                  {notice.attachmentCount > 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.toggleCarousel(notice);
                      }}
                      disabled={fetchingNoticeAttachments && selectedNotice?.uuid === notice.uuid}
                    >
                      <SlideshowIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => this.editNotice(notice.uuid)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </div>
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
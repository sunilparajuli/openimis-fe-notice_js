// src/components/RequestLogSearcher.js
import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import {
  withModulesManager,
  formatMessageWithValues,
  Searcher,
  withHistory,
} from "@openimis/fe-core";
import { fetchRequestLogs } from "../actions";
import { withStyles } from "@material-ui/core/styles";
import {
  IconButton,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";

const styles = (theme) => ({
  jsonContainer: {
    maxHeight: "400px",
    overflow: "auto",
    fontFamily: "monospace",
    fontSize: "12px",
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(1),
    borderRadius: "4px",
  },
  truncated: {
    maxWidth: "300px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  durationRed: {
    color: "red",
    fontWeight: "bold",
  },
  durationGreen: {
    color: "green",
    fontWeight: "bold",
  },
  durationGrey: {
    color: "grey",
    fontWeight: "bold",
  },
});

class RequestLogSearcher extends Component {
  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-requestLog",
      "requestLogFilter.rowsPerPageOptions",
      [10, 20, 50, 100]
    );
    this.defaultPageSize = props.modulesManager.getConf(
      "fe-requestLog",
      "requestLogFilter.defaultPageSize",
      10
    );
    this.state = {
      openRequestDialog: null,
      openResponseDialog: null,
    };
  }

  fetch = (prms) => {
    this.props.fetchRequestLogs(this.props.modulesManager, prms);
  };

  rowIdentifier = (r) => r.id;

  filtersToQueryParams = (state) => {
    let prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);

    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    return prms;
  };

  headers = () => [
    "requestLog.timestamp",
    "requestLog.appName",
    "requestLog.method",
    "requestLog.path",
    "requestLog.routeName",
    "requestLog.statusCode",
    "requestLog.durationSeconds",
    "requestLog.user",
    "requestLog.requestData",
    "requestLog.responseData",
  ];

  sorts = () => [
    ["timestamp", true],
    ["appName", true],
    ["method", true],
    ["path", true],
    ["routeName", true],
    ["statusCode", true],
    ["durationMs", true],
    ["user", true],
    null,
    null,
  ];

  openDialog = (rowId, type) => {
    const key = type === "request" ? "openRequestDialog" : "openResponseDialog";
    this.setState({ [key]: rowId });
  };

  closeDialog = (type) => {
    const key = type === "request" ? "openRequestDialog" : "openResponseDialog";
    this.setState({ [key]: null });
  };

  formatJsonData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return "Invalid JSON: " + jsonString.substring(0, 100) + "...";
    }
  };

  getDurationClass = (seconds) => {
    const { classes } = this.props;
    if (seconds > 10) return classes.durationRed;
    if (seconds < 5) return classes.durationGreen;
    return classes.durationGrey;
  };

  itemFormatters = () => {
    const { classes } = this.props;
    return [
      (r) => new Date(r.timestamp).toLocaleString(),
      (r) => r.appName,
      (r) => r.method,
      (r) => r.path,
      (r) => r.routeName,
      (r) => r.statusCode,
      (r) => {
        const seconds = (r.durationMs / 1000).toFixed(2);
        return <span className={this.getDurationClass(seconds)}>{seconds} s</span>;
      },
      (r) => r.user || "Anonymous",
      (r) => {
        const jsonData = this.formatJsonData(r.requestData);
        const rowId = r.id; // Explicitly use the base64 ID
        return (
          <TableCell>
            <div className={classes.truncated}>{jsonData.substring(0, 50) + "..."}</div>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                this.openDialog(rowId, "request");
              }}
            >
              <VisibilityIcon />
            </IconButton>
            <Dialog
              open={this.state.openRequestDialog === rowId}
              onClose={() => this.closeDialog("request")}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Request Data (ID: {rowId})</DialogTitle>
              <DialogContent>
                <pre className={classes.jsonContainer}>{jsonData}</pre>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.closeDialog("request")} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </TableCell>
        );
      },
      (r) => {
        const jsonData = this.formatJsonData(r.responseData);
        const rowId = r.id; // Explicitly use the base64 ID
        return (
          <TableCell>
            <div className={classes.truncated}>{jsonData.substring(0, 50) + "..."}</div>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                this.openDialog(rowId, "response");
              }}
            >
              <VisibilityIcon />
            </IconButton>
            <Dialog
              open={this.state.openResponseDialog === rowId}
              onClose={() => this.closeDialog("response")}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Response Data (ID: {rowId})</DialogTitle>
              <DialogContent>
                <pre className={classes.jsonContainer}>{jsonData}</pre>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.closeDialog("response")} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </TableCell>
        );
      },
    ];
  };

  render() {
    const {
      intl,
      requestLogs,
      requestLogsPageInfo,
      fetchingRequestLogs,
      fetchedRequestLogs,
      errorRequestLogs,
    } = this.props;
    let count = requestLogsPageInfo.totalCount ?? 0;

    return (
      <Fragment>
        <Searcher
          module="requestLog"
          cacheFiltersKey="requestLogCacheFilters"
          items={requestLogs}
          itemsPageInfo={requestLogsPageInfo}
          fetchingItems={fetchingRequestLogs}
          fetchedItems={fetchedRequestLogs}
          errorItems={errorRequestLogs}
          tableTitle={formatMessageWithValues(intl, "requestLog", "requestLogs_table.count", { count })}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-timestamp"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingRequestLogs: state.notice.fetchingRequestLogs,
  fetchedRequestLogs: state.notice.fetchedRequestLogs,
  requestLogs: state.notice.requestLogs,
  requestLogsPageInfo: state.notice.requestLogsPageInfo,
  errorRequestLogs: state.notice.errorRequestLogs,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchRequestLogs,
    },
    dispatch
  );
};

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(withStyles(styles)(RequestLogSearcher))
    )
  )
);
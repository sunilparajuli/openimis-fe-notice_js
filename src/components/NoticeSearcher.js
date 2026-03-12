import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import {
  withModulesManager, formatMessageWithValues, historyPush,
  withHistory, Searcher, PublishedComponent
} from "@openimis/fe-core";
import { fetchNotices, toggleNoticeStatus } from "../actions";
import NoticeFilter from "./NoticeFilter";
import { IconButton, Switch, Tooltip } from "@material-ui/core";
import PriorityChip from "./PriorityChip";
import EditIcon from "@material-ui/icons/Edit";
import { RIGHT_NOTICE_EDIT, RIGHT_NOTICE_TOGGLE_STATUS } from "../constants";

const NOTICE_SEARCHER_CONTRIBUTION_KEY = "notice.NoticeSearcher";

class NoticeSearcher extends Component {
  state = {
    reset: 0,
  }

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf("fe-notice", "noticeFilter.rowsPerPageOptions", [10, 20, 50, 100]);
    this.defaultPageSize = props.modulesManager.getConf("fe-notice", "noticeFilter.defaultPageSize", 10);
  }

  fetch = (prms) => {
    this.props.fetchNotices(this.props.modulesManager, prms);
  }

  toggleStatus = (notice) => {
    const newStatus = !notice.isActive;
    this.props.toggleNoticeStatus(this.props.modulesManager, notice.uuid, newStatus);
  }

  rowIdentifier = (r) => r.id

  filtersToQueryParams = (state) => {
    let prms = Object.keys(state.filters)
      .filter(f => !!state.filters[f]['filter'])
      .map(f => state.filters[f]['filter']);

    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    return prms;
  }

  canSelectAll = (selection) => this.props.notices.map(s => s.id).filter(s => !selection.map(s => s.id).includes(s)).length
  rowLocked = (selection, notice) => !!notice.clientMutationId

  headers = () => [
    "notice.uuid",
    "notice.title",
    "notice.description",
    "notice.priority",
    "notice.health_facility",
    "notice.created_at",
    "notice.updated_at",
    "notice.is_active",
    "notice.actions",
  ];

  sorts = () => [
    ['uuid', true],
    ['title', true],
    ['description', true],
    ['priority', true],
    ['health_facility', true],
    ['createdAt', true],
    ['updatedAt', true],
    ['is_active', true],
  ];

  itemFormatters = () => [
    e => e.uuid,
    e => e.title,
    e => e?.description ?? "",
    e => <PriorityChip priority={e.priority} />,
    e => e.healthFacility?.name || e.healthFacility?.id || "",
    e => e.createdAt,
    e => e.updatedAt,
    e => (
      this.props.rights.includes(RIGHT_NOTICE_TOGGLE_STATUS) ? (
        <Switch
          checked={e.isActive}
          onChange={() => this.toggleStatus(e)}
          color="primary"
        />
      ) : (e.isActive ? formatMessage(this.props.intl, "notice", "notice.statusActive") : formatMessage(this.props.intl, "notice", "notice.statusInactive"))
    ),
    e => (
      <div>
        {this.props.rights.includes(RIGHT_NOTICE_EDIT) && (
          <Tooltip title={formatMessageWithValues(this.props.intl, "notice", "editNotice")}>
            <IconButton onClick={() => historyPush(this.props.modulesManager, this.props.history, "notice.route.noticeEdit", [e.uuid])}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  editNotice = c => {
    if (this.props.rights.includes(RIGHT_NOTICE_EDIT)) {
      historyPush(this.props.modulesManager, this.props.history, "notice.route.noticeEdit", [c.uuid])
    }
  }

  render() {
    const { intl, notices, noticesPageInfo, fetchingNotices, fetchedNotices, errorNotices, filterPaneContributionsKey, cacheFiltersKey, FilterExt } = this.props;
    let count = noticesPageInfo.totalCount ?? 0;

    return (
      <Fragment>
        <PublishedComponent>
          <div id="notice.route.allNotices"> </div>
        </PublishedComponent>
        <Searcher
          module="notice"
          // canSelectAll={this.canSelectAll}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={NoticeFilter}
          FilterExt={FilterExt}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={notices}
          itemsPageInfo={noticesPageInfo}
          fetchingItems={fetchingNotices}
          fetchedItems={fetchedNotices}
          errorItems={errorNotices}
          tableTitle={formatMessageWithValues(intl, "notice", "notices_table.count", { count })}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-createdAt"
          rowLocked={this.rowLocked}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          onDoubleClick={this.editNotice}
          reset={this.state.reset}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  rights: state.core?.user?.i_user?.rights || [],
  fetchingNotices: state.notice.fetchingNotices,
  fetchedNotices: state.notice.fetchedNotices,
  notices: state.notice.notices,
  noticesPageInfo: state.notice.noticesPageInfo,
  errorNotices: state.notice.errorNotices,
});

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    fetchNotices,
    toggleNoticeStatus,
  }, dispatch);
};

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(NoticeSearcher)
    )
  )
);
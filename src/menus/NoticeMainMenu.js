import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { ScreenShare, ListAlt } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import { RIGHT_NOTICE_SEARCH, RIGHT_NOTICE_ADD } from "../constants";
const NOTICE_MAIN_MENU_CONTRIBUTION_KEY = "notice.MainMenu";

class NoticeMainMenu extends Component {
  render() {
    const { rights } = this.props;
    let entries = [];
    if (rights.includes(RIGHT_NOTICE_SEARCH)) {
      entries.push({
        text: formatMessage(this.props.intl, "notice", "mainMenu"),
        icon: <ListAlt />,
        route: "/notice/notices",
      });
    }
    if (rights.includes(RIGHT_NOTICE_SEARCH)) {
      entries.push({
        text: formatMessage(this.props.intl, "notice", "mainMenu.published"),
        icon: <ListAlt />,
        route: "/notice/allNotices",
      });
    }
    if (rights.includes(RIGHT_NOTICE_SEARCH)) {
      entries.push({
        text: formatMessage(this.props.intl, "notice", "Logs"),
        icon: <ListAlt />,
        route: "/notice/requestLogs",
      });
    }

    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "notice", "mainMenu")}
        icon={<ScreenShare />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});
export default withModulesManager(injectIntl(connect(mapStateToProps)(NoticeMainMenu)));

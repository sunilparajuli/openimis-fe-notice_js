import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Switch, FormControlLabel } from "@material-ui/core";
import {
  formatMessage,
  formatMessageWithValues,
  FormPanel,
  TextInput,
  Contributions,
  withModulesManager,
  ConstantBasedPicker,
  PublishedComponent,
  coreAlert,
} from "@openimis/fe-core";
import { NOTICE_PRIORITY_LEVELS } from "../constants";
import { DatePicker } from "@material-ui/pickers"; // MUI v4 date picker

const styles = (theme) => ({
  paper: theme.paper.paper,
  paperHeader: theme.paper.header,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

const NOTICE_MASTER_PANEL_CONTRIBUTION_KEY = "notice.MasterPanel";
const NOTICE_PANELS_CONTRIBUTION_KEY = "notice.panels";

class NoticeMasterPanel extends FormPanel {
  constructor(props) {
    super(props);
  }

  isPublishDatePassed = () => {
    const { edited } = this.props;
    if (!edited?.publishStartDate) return false;
    return new Date(edited.publishStartDate) < new Date();
  };

  handleSchedulePublishChange = (checked) => {
    const { intl, edited, coreAlert } = this.props;
    this.updateAttribute("schedulePublish", checked);

    if (checked) {
      const publishDate = edited.publishStartDate
        ? new Date(edited.publishStartDate).toLocaleDateString()
        : "the selected date";
      const message = formatMessageWithValues(intl, "notice", "schedulePublishAlert", {
        date: publishDate,
      });
      coreAlert(formatMessage(intl, "notice", "schedulePublishTitle"), message);
    }
  };

  render() {
    const {
      classes,
      edited,
      title = "Notice",
      titleParams = { label: "" },
      readOnly = false,
      intl,
      reset,
    } = this.props;

    if (!edited) return null;

    const isPublishDatePassed = this.isPublishDatePassed();

    return (
      <Grid container>
        <Grid container className={classes.paperHeader}>
          <Contributions
            {...this.props}
            updateAttribute={this.updateAttribute}
            contributionKey={NOTICE_MASTER_PANEL_CONTRIBUTION_KEY}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="notice"
            label="notice.title"
            value={edited.title}
            required={true}
            onChange={(v) => this.updateAttribute("title", v)}
            readOnly={readOnly}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            value={edited.createdAt || Date.now()}
            module="notice"
            label="notice.created_at"
            reset={reset}
            onChange={(d) => this.updateAttribute("dateFrom", d)}
            readOnly={readOnly}
            required={false}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <ConstantBasedPicker
            module="notice"
            label="notice.priority"
            constants={NOTICE_PRIORITY_LEVELS}
            value={edited.priority}
            onChange={(v) => this.updateAttribute("priority", v)}
            required={true}
            readOnly={readOnly}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="location.HealthFacilityPicker"
            module="notice"
            label="notice.health_facility"
            value={edited.healthFacility}
            onChange={(v) => this.updateAttribute("healthFacility", v)}
            required={true}
            readOnly={readOnly}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="notice"
            label="notice.description"
            value={edited.description}
            required={true}
            multiline
            rows={3}
            onChange={(v) => this.updateAttribute("description", v)}
            readOnly={readOnly}
          />
        </Grid>

        {/* Schedule Publish with MUI v4 Switch */}
        <Grid item xs={6} className={classes.item}>
          <FormControlLabel
            control={
              <Switch
                checked={edited.schedulePublish || false}
                onChange={(e) => this.handleSchedulePublishChange(e.target.checked)}
                color="primary"
                disabled={readOnly || isPublishDatePassed}
              />
            }
            label={formatMessage(intl, "notice", "notice.schedule_publish")}
          />
        </Grid>

        {/* Publish Start Date with MUI v4 DatePicker */}
        {edited.schedulePublish && (
          <Grid item xs={6} className={classes.item}>
            <DatePicker
              label={formatMessage(intl, "notice", "notice.publish_start_date")}
              value={edited.publishStartDate || null}
              onChange={(date) => this.updateAttribute("publishStartDate", date)}
              disabled={readOnly || isPublishDatePassed}
              minDate={new Date()} // Prevent past dates
              required={edited.schedulePublish}
              format="MM/DD/YYYY"
              clearable
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}

        <Contributions
          {...this.props}
          updateAttribute={this.updateAttribute}
          contributionKey={NOTICE_PANELS_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      coreAlert,
    },
    dispatch
  );
};

export default withModulesManager(
  withTheme(
    withStyles(styles)(
      connect(null, mapDispatchToProps)(NoticeMasterPanel)
    )
  )
);
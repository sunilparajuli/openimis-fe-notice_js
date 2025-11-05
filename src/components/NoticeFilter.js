import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { Grid } from "@material-ui/core";
import {
    withModulesManager,
    Contributions,
    ControlledField,
    TextInput,
    ConstantBasedPicker,
    PublishedComponent,
} from "@openimis/fe-core";
import { NOTICE_PRIORITY_LEVELS } from "../constants";

const styles = theme => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
});

const NOTICE_FILTER_CONTRIBUTION_KEY = "notice.Filter";

class NoticeFilter extends Component {
    state = {
        showHistory: false,
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevProps.filters['showHistory'] !== this.props.filters['showHistory'] &&
            !!this.props.filters['showHistory'] &&
            this.state.showHistory !== this.props.filters['showHistory']['value']
        ) {
            this.setState((state, props) => ({ showHistory: props.filters['showHistory']['value'] }));
        }
    }

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-notice", "debounceTime", 800)
    )

    _filterValue = k => {
        const { filters } = this.props;
        return filters && filters[k] ? filters[k].value : null;
    }

    _onChangeFilter = (id, value, filter) => {
        this.debouncedOnChangeFilter([{
            id,
            value,
            filter
        }]);
    }

    _onChangeShowHistory = () => {
        let filters = [{
            id: 'showHistory',
            value: !this.state.showHistory,
            filter: `showHistory: ${!this.state.showHistory}`
        }];
        this.props.onChangeFilters(filters);
        this.setState((state) => ({
            showHistory: !state.showHistory
        }));
    }

    render() {
        const { intl, classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <ControlledField module="notice" id="NoticeFilter.title" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="notice"
                            label="notice.title"
                            name="title"
                            value={this._filterValue('title')}
                            onChange={v => this._onChangeFilter('title', v, `title_Icontains: "${v}"`)}
                        />
                    </Grid>
                } />

                <ControlledField module="notice" id="NoticeFilter.createdAt" field={
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.DatePicker"
                            value={this._filterValue('createdAt')}
                            module="notice"
                            label="notice.created_at"
                            onChange={v => this._onChangeFilter('createdAt', v, `createdAt: "${v}"`)}
                        />
                    </Grid>
                } />

                <ControlledField module="notice" id="NoticeFilter.priority" field={
                    <Grid item xs={2} className={classes.item}>
                        <ConstantBasedPicker
                            module="notice"
                            label="notice.priority"
                            constants={NOTICE_PRIORITY_LEVELS}
                            value={this._filterValue('priority')}
                            onChange={v => this._onChangeFilter('priority', v, `priority: "${v}"`)}
                            withNull
                        />
                    </Grid>
                } />

                <ControlledField module="notice" id="NoticeFilter.health_facility" field={
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.HealthFacilityPicker"
                            module="notice"
                            value={this._filterValue('healthFacility')}
                            onChange={v => this._onChangeFilter('healthFacility', v, `healthFacility_Uuid: "${v?.uuid}"`)}
                            withNull
                        />
                    </Grid>
                } />

                <ControlledField module="notice" id="NoticeFilter.description" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="notice"
                            label="notice.description"
                            name="description"
                            value={this._filterValue('description')}
                            onChange={v => this._onChangeFilter('description', v, `description_Icontains: "${v}"`)}
                        />
                    </Grid>
                } />

                <ControlledField module="notice" id="NoticeFilter.isActive" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.BooleanField"
                            module="notice"
                            label="notice.is_active"
                            value={this._filterValue('isActive')}
                            onChange={v => this._onChangeFilter('isActive', v, `isActive: ${v}`)}
                            withNull
                        />
                    </Grid>
                } />

                <Contributions filters={filters} onChangeFilters={onChangeFilters} contributionKey={NOTICE_FILTER_CONTRIBUTION_KEY} />
            </Grid>
        );
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(NoticeFilter))));
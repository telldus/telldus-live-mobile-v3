/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';
import i18n from '../../Translations/common';

import { List, ListDataSource, Text, View } from 'BaseComponents';
import { JobRow } from 'TabViews_SubViews';
import { getJobs } from 'Actions';
import Theme from 'Theme';

import moment from 'moment-timezone';

import { parseJobsForListView } from 'Reducers_Jobs';

const messages = defineMessages({
	friday: {
		id: 'days.friday',
		defaultMessage: 'Friday',
	},
	monday: {
		id: 'days.monday',
		defaultMessage: 'Monday',
	},
	nextWeekday: {
		id: 'days.nextWeekday',
		defaultMessage: 'Next {weekday}',
		description: 'Used by the scheduler to display the day one week from now. Example "Next Wednesday"',
	},
	saturday: {
		id: 'days.saturday',
		defaultMessage: 'Saturday',
	},
	sunday: {
		id: 'days.sunday',
		defaultMessage: 'Sunday',
	},
	thursday: {
		id: 'days.thursday',
		defaultMessage: 'Thursday',
	},
	today: {
		id: 'days.today',
		defaultMessage: 'Today',
		description: 'Used by the scheduler to display a header with the schedules running today',
	},
	tomorrow: {
		id: 'days.tomorrow',
		defaultMessage: 'Tomorrow',
		description: 'Used by the scheduler to display a header with the schedules running tomorrow',
	},
	tuesday: {
		id: 'days.tuesday',
		defaultMessage: 'Tuesday',
	},
	wednesday: {
		id: 'days.wednesday',
		defaultMessage: 'Wednesday',
	},
});

type Props = {
	rowsAndSections: Object,
	devices: Object,
	dispatch: Function,
	screenProps: Object,
};

type State = {
	dataSource: Object,
};

import getTabBarIcon from '../../Lib/getTabBarIcon';

class SchedulerTab extends View {

	props: Props;
	state: State;

	renderRow: (Object) => Object;
	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	onRefresh: () => void;

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
		};

		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});
	}

	onRefresh() {
		this.props.dispatch(getJobs());
	}

	rowHasChanged(r1, r2) {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.effectiveHour !== r2.effectiveHour ||
			r1.effectiveMinute !== r2.effectiveMinute ||
			r1.method !== r2.method ||
			r1.deviceId !== r2.deviceId
		);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	renderSectionHeader(sectionData, sectionId) {
		// TODO: move to own Component
		const {formatMessage} = this.props.screenProps.intl;
		const todayInWeek = parseInt(moment().format('d'), 10);
		const absoluteDayInWeek = (todayInWeek + sectionId) % 7;
		const daysInWeek = [messages.sunday, messages.monday, messages.tuesday, messages.wednesday, messages.thursday, messages.friday, messages.saturday];

		let sectionName;
		if (sectionId === 0) {
			sectionName = formatMessage(messages.today);
		} else if (sectionId === 1) {
			sectionName = formatMessage(messages.tomorrow);
		} else if (sectionId === 7) {
			sectionName = formatMessage(messages.nextWeekday, {weekday: formatMessage(daysInWeek[todayInWeek])});
		} else {
			sectionName = formatMessage(daysInWeek[absoluteDayInWeek]);
		}

		return (
			<View style={Theme.Styles.sectionHeader}>
				<Text style={Theme.Styles.sectionHeaderText}>
					{sectionName}
				</Text>
			</View>
		);
	}

	renderRow(props) {
		return (
			<JobRow {...props} />
		);
	}
}

SchedulerTab.navigationOptions = ({navigation, screenProps}) => ({
	title: screenProps.intl.formatMessage(i18n.scheduler),
	tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'scheduler'),
});

SchedulerTab.propTypes = {
	rowsAndSections: React.PropTypes.object,
};

const getRowsAndSections = createSelector(
	[
		({ jobs }) => jobs,
		({ gateways }) => gateways,
		({ devices }) => devices,
	],
	(jobs, gateways, devices) => {
		const { sections, sectionIds } = parseJobsForListView(jobs, gateways, devices);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(store) {
	return {
		rowsAndSections: getRowsAndSections(store),
		devices: store.devices,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);

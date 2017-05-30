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

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { List, ListDataSource, View, Text } from 'BaseComponents';
import { JobRow } from 'TabViews/SubViews';
import { getJobs } from 'Actions';
import Theme from 'Theme';

import moment from 'moment-timezone';

import { parseJobsForListView } from 'Reducers/Jobs';

const daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class SchedulerTab extends View {
	constructor(props) {
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
			<List
				dataSource = {this.state.dataSource}
				renderRow = {this.renderRow}
				renderSectionHeader = {this.renderSectionHeader}
				onRefresh = {this.onRefresh}
			/>
		);
	}

	renderSectionHeader(sectionData, sectionId) {
		// TODO: move to own Component
		const todayInWeek = parseInt(moment().format('d'), 10);
		const absoluteDayInWeek = (todayInWeek + sectionId) % 7;

		let sectionName;
		if (sectionId === 0) {
			sectionName = 'Today';
		} else if (sectionId === 1) {
			sectionName = 'Tomorrow';
		} else if (sectionId === 7) {
			sectionName = `Next ${daysInWeek[todayInWeek]}`;
		} else {
			sectionName = daysInWeek[absoluteDayInWeek];
		}

		return (
			<View style = {Theme.Styles.sectionHeader}>
				<Text style = {Theme.Styles.sectionHeaderText}>
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

module.exports = connect(mapStateToProps)(SchedulerTab);

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

import { List, ListDataSource, View, Text } from 'BaseComponents';
import { JobRow } from 'TabViews/SubViews';
import { getJobs } from 'Actions';
import Theme from 'Theme';

import moment from 'moment-timezone';

import { parseJobsForListView } from 'Reducers/Jobs';

const daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class SchedulerTab extends View {
	render() {
		return (
			<List
				dataSource = {this.props.dataSource}
				renderRow = {props => (<JobRow {...{ ...props, ...this.props }} />)}
				renderSectionHeader = {this.renderSectionHeader.bind(this)}
				onRefresh = {() => this.props.dispatch(getJobs())}
			/>
		);
	}

	renderSectionHeader(sectionData, sectionId) {
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
}

SchedulerTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});

function select(store) {
	let { items, sectionIds } = parseJobsForListView(store.jobs, store.gateways, store.devices);
	return {
		dataSource: dataSource.cloneWithRowsAndSections(items, sectionIds),
		devices: store.devices,
	};
}

module.exports = connect(select)(SchedulerTab);

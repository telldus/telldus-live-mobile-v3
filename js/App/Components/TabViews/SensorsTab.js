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

import { List, ListDataSource, View } from 'BaseComponents';
import { DeviceHeader, SensorRow, SensorRowHidden } from 'TabViews_SubViews';

import { getSensors } from 'Actions';
import { toggleEditMode } from 'Actions';

import { parseSensorsForListView } from '../../Reducers/Sensors';

type Props = {
  rowsAndSections: Object,
  gatewaysById: Object,
  editMode: boolean,
  tab: string,
  dispatch: Function,
};

type State = {
  dataSource: Object,
};

class SensorsTab extends View {
	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object, sectionId:number) => Object;
	renderRow: Object => Object;
	onRefresh: Object => void;

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
		};

		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});

		if (nextProps.tab !== 'sensorsTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('sensorsTab'));
		}
	}

	onRefresh() {
		this.props.dispatch(getSensors());
	}

	rowHasChanged(r1, r2) {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.sensor !== r2.sensor ||
			r1.inDashboard !== r2.inDashboard ||
			r1.editMode !== r2.editMode
		);
	}

	render() {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this.renderRow}
				renderHiddenRow={this.renderHiddenRow}
				renderSectionHeader={this.renderSectionHeader}
				leftOpenValue={40}
				editMode={this.props.editMode}
				onRefresh={this.onRefresh}
			/>
		);
	}

	renderSectionHeader(sectionData, sectionId) {
		return (
			<DeviceHeader
				sectionData={sectionData}
				sectionId={sectionId}
				gateway={this.props.gatewaysById[sectionId]}
			/>
		);
	}

	renderRow(row) {
		return (
			<SensorRow {...row}/>
		);
	}

	renderHiddenRow(row) {
		return (
			<SensorRowHidden {...row}/>
		);
	}
}

SensorsTab.propTypes = {
	rowsAndSections: React.PropTypes.object,
};

const getRowsAndSections = createSelector(
	[
		({ sensors }) => sensors,
		({ gateways }) => gateways,
		({ tabs }) => tabs.editModeSensorsTab,
	],
	(sensors, gateways, editMode) => {
		const { sections, sectionIds } = parseSensorsForListView(sensors, gateways, editMode);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(store) {
	return {
		rowsAndSections: getRowsAndSections(store),
		gatewaysById: store.gateways.byId,
		editMode: store.tabs.editModeSensorsTab,
		tab: store.navigation.tab,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SensorsTab);

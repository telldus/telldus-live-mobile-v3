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

import { List, ListDataSource, View } from 'BaseComponents';
import { ListHeader, SensorRow, SensorRowHidden } from 'TabViews/SubViews';

import { getSensors, addToDashboard, removeFromDashboard } from 'Actions';

import { parseSensorsForListView } from '../../Reducers/Sensors';

class SensorsTab extends View {
	render() {
		return (
			<List
				dataSource = {this.props.dataSource}
				renderHiddenRow = {props => (<SensorRowHidden {...{ ...props, ...this.props }}/>)}
				renderRow = {props => (<SensorRow {...props}/>)}
				renderSectionHeader = {(sectionData, sectionId) => (<ListHeader sectionData={sectionData} sectionId={sectionId} gateways={this.props.gateways}/>)}
				leftOpenValue = {40}
				editMode = {this.props.editMode}
				onRefresh = {() =>
					this.props.dispatch(getSensors())
				}
			/>
		);
	}
}

SensorsTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});

function select(store) {
	const { sections, sectionIds } = parseSensorsForListView(store);
	return {
		dataSource: dataSource.cloneWithRowsAndSections(sections, sectionIds),
		gateways: store.gateways,
		editMode: store.tabs.editModeSensorsTab,
	};
}

function actions(dispatch) {
	return {
		addToDashboard: (id) => dispatch(addToDashboard('sensor', id)),
		removeFromDashboard: (id) => dispatch(removeFromDashboard('sensor', id)),
		dispatch,
	};
}

module.exports = connect(select, actions)(SensorsTab);

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

import { List, ListDataSource, View } from 'BaseComponents';
import { DeviceHeader, SensorRow, SensorRowHidden } from 'TabViews_SubViews';

import { getSensors } from 'Actions';
import { toggleEditMode } from 'Actions';

import { parseSensorsForListView } from '../../Reducers/Sensors';
import { getTabBarIcon } from 'Lib';
import type { Dispatch } from 'Actions_Types';

const messages = defineMessages({
	sensors: {
		id: 'pages.sensors',
		defaultMessage: 'Sensors',
		description: 'The sensors tab',
	},
});

type Props = {
	rowsAndSections: Object,
	gatewaysById: Object,
	editMode: boolean,
	tab: string,
	dispatch: Dispatch,
	stackNavigator: Object,
};

type State = {
	dataSource: Object,
};

class SensorsTab extends View {

	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	onRefresh: (Object) => void;
	toggleEditMode: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(messages.sensors),
		tabBarIcon: ({ focused, tintColor }: Object): React$Element<any> => getTabBarIcon(focused, tintColor, 'sensors'),
	});

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1: Object, s2: Object): boolean => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
		};

		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.toggleEditMode = this.toggleEditMode.bind(this);
	}

	componentDidMount() {
		let {setParams} = this.props.stackNavigator;
		setParams({
			toggleEditMode: this.toggleEditMode,
		});
	}

	toggleEditMode() {
		this.props.dispatch(toggleEditMode('sensorsTab'));
	}

	componentWillReceiveProps(nextProps: Object) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});

		if (nextProps.tab !== 'sensorsTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('sensorsTab'));
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.tab === 'sensorsTab';
	}

	onRefresh() {
		this.props.dispatch(getSensors());
	}

	rowHasChanged(r1: Object, r2: Object): boolean {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.sensor !== r2.sensor ||
			r1.inDashboard !== r2.inDashboard ||
			r1.editMode !== r2.editMode
		);
	}

	render(): React$Element<any> {
		return (
			<View>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					renderHiddenRow={this.renderHiddenRow}
					renderSectionHeader={this.renderSectionHeader}
					leftOpenValue={40}
					editMode={this.props.editMode}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	renderSectionHeader(sectionData: Object, sectionId: number): React$Element<any> {
		return (
			<DeviceHeader
				sectionData={sectionData}
				sectionId={sectionId}
				gateway={this.props.gatewaysById[sectionId]}
			/>
		);
	}

	renderRow(row: Object): React$Element<any> {
		return (
			<SensorRow {...row}/>
		);
	}

	renderHiddenRow(row: Object): React$Element<any> {
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
		({ sensors }: Object): Object => sensors,
		({ gateways }: Object): Object => gateways,
		({ tabs }: Object): Object => tabs.editModeSensorsTab,
	],
	(sensors: Object, gateways: Object, editMode: any): Object => {
		const { sections, sectionIds } = parseSensorsForListView(sensors, gateways, editMode);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(store),
		gatewaysById: store.gateways.byId,
		editMode: store.tabs.editModeSensorsTab,
		tab: store.navigation.tab,
	};
}

function mapDispatchToProps(dispatch: Dispatch): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SensorsTab);

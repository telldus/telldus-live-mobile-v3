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

import { List, ListDataSource, Text, View, I18n } from 'BaseComponents';
import { DeviceRow, DeviceRowHidden } from 'TabViews_SubViews';

import { getDevices } from 'Actions_Devices';
import { toggleEditMode } from 'Actions';

import getDeviceType from '../../Lib/getDeviceType';
import getTabBarIcon from '../../Lib/getTabBarIcon';

import { parseDevicesForListView } from 'Reducers_Devices';

import Theme from 'Theme';

// @flow

type Props = {
	rowsAndSections: Object,
	gatewaysById: Object,
	editMode: boolean,
	devices: Object,
	tab: string,
	dispatch: Function,
	stackNavigator: Object,
};

type State = {
	dataSource: Object,
	deviceId: number,
	dimmer: boolean,
};

class DevicesTab extends View {

	props: Props;
	state: State;

	onCloseSelected: () => void;
	openDeviceDetail: (number) => void;
	setScrollEnabled: (boolean) => void;
	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	renderHiddenRow: (Object) => Object;
	onRefresh: () => void;

	static navigationOptions = {
		title: I18n.t('pages.devices'),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'devices'),
	};

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
			deviceId: -1,
			dimmer: false,
		};
		this.onCloseSelected = this.onCloseSelected.bind(this);
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHiddenRow = this.renderHiddenRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});

		if (nextProps.tab !== 'devicesTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('devicesTab'));
		}
	}

	rowHasChanged(r1, r2) {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.device !== r2.device ||
			r1.inDashboard !== r2.inDashboard ||
			r1.editMode !== r2.editMode
		);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<List
					ref="list"
					dataSource={this.state.dataSource}
					renderHiddenRow={this.renderHiddenRow}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					leftOpenValue={40}
					editMode={this.props.editMode}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	renderRow(row) {
		return (
			<DeviceRow {...row}
			           onSettingsSelected={this.openDeviceDetail}
			           setScrollEnabled={this.setScrollEnabled}
			/>
		);
	}

	renderHiddenRow(row) {
		return (
			<DeviceRowHidden {...row}/>
		);
	}

	openDeviceDetail(device) {
		this.props.stackNavigator.navigate('DeviceDetails', { device: device, devices: this.props.devices });
	}

	onCloseSelected() {
		this.setState({ deviceId: -1 });
	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	renderSectionHeader(sectionData, sectionId) {
		const gateway = this.props.gatewaysById[sectionId];
		return (
			<View style={Theme.Styles.sectionHeader}>
				<Text style={Theme.Styles.sectionHeaderText}>
					{(gateway && gateway.name) ? gateway.name : ''}
				</Text>
			</View>
		);
	}

	onRefresh() {
		this.props.dispatch(getDevices());
	}

	getType(deviceId) {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}
}

DevicesTab.propTypes = {
	rowsAndSections: React.PropTypes.object,
};

const getRowsAndSections = createSelector(
	[
		({ devices }) => devices,
		({ gateways }) => gateways,
		({ tabs }) => tabs.editModeDevicesTab,
	],
	(devices, gateways, editMode) => {
		const { sections, sectionIds } = parseDevicesForListView(devices, gateways, editMode);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(state, ownprops) {
	return {
		stackNavigator: ownprops.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(state),
		gatewaysById: state.gateways.byId,
		editMode: state.tabs.editModeDevicesTab,
		devices: state.devices,
		tab: state.navigation.tab,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DevicesTab);

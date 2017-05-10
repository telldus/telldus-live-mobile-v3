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

import { List, ListDataSource, Text, View } from 'BaseComponents';
import { DeviceRow, DeviceRowHidden } from 'TabViews/SubViews';
import { DeviceDetailModal, ToggleDeviceDetailModal, BellDeviceDetailModal, DimmerDeviceDetailModal, NavigationalDeviceDetailModal } from 'DetailViews';

import { addToDashboard, removeFromDashboard } from 'Actions';
import { getDevices } from 'Actions/Devices';

import getDeviceType from '../../Lib/getDeviceType';

import { parseDevicesForListView } from 'Reducers/Devices';

import Theme from 'Theme';

class DevicesTab extends View {
    constructor(props) {
		super(props);
		this.state = {
			deviceId:-1,
			dimmer:false
		};
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
	}

	render() {

		let deviceDetail = null;

		if (this.state.deviceId && Number.isInteger(this.state.deviceId) && this.state.deviceId > 0) {
			const deviceType = this.getType(this.state.deviceId);

			if (deviceType === 'TOGGLE') {
				deviceDetail = <ToggleDeviceDetailModal isVisible={true} deviceId={this.state.deviceId} onCloseSelected={this.onCloseSelected.bind(this)}/>;
			} else if (deviceType === 'DIMMER') {
				deviceDetail = <DimmerDeviceDetailModal isVisible={true} deviceId={this.state.deviceId} onCloseSelected={this.onCloseSelected.bind(this)}/>;
			} else if (deviceType === 'BELL') {
				deviceDetail = <BellDeviceDetailModal isVisible={true} deviceId={this.state.deviceId} onCloseSelected={this.onCloseSelected.bind(this)}/>;
			} else if (deviceType === 'NAVIGATIONAL') {
				deviceDetail = <NavigationalDeviceDetailModal isVisible={true} deviceId={this.state.deviceId} onCloseSelected={this.onCloseSelected.bind(this)}/>;
			} else {
				deviceDetail = <DeviceDetailModal isVisible={true} deviceId={this.state.deviceId} onCloseSelected={this.onCloseSelected.bind(this)}/>;
			}
		}

		return (
			<View style={{flex:1}}>
				<List
					ref = "list"
					dataSource = {this.props.dataSource}
					renderHiddenRow = { props => (<DeviceRowHidden {...{ ...props, ...this.props }}/>)  }
					renderRow = { props => (
						<DeviceRow {...{ ...props, ...this.props }}
							onSettingsSelected={this.openDeviceDetail}
							setScrollEnabled={this.setScrollEnabled}
						/>
					)}
					renderSectionHeader = {this._renderSectionHeader.bind(this)}
					rightOpenValue = {-40}
					editMode = {this.props.editMode}
					onRefresh = {() =>
						this.props.dispatch(getDevices())
					}
				/>
				{deviceDetail}
			</View>
		);
	}

	openDeviceDetail(id) {
		this.setState({deviceId:id});
	}

	onCloseSelected() {
		this.setState({deviceId:-1});
	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	_renderSectionHeader(sectionData, sectionId) {
		const gateway = this.props.gateways.find((g) => g.id === sectionId);
		return (
			<View style = { Theme.Styles.sectionHeader }>
				<Text style = { Theme.Styles.sectionHeaderText }>
					{(gateway && gateway.name) ? gateway.name : ''}
				</Text>
			</View>
		);
	}

	getType(deviceId) {
		const filteredItem = this.props.devices.find(item => item.id === deviceId);
		if (!filteredItem) {
            return null;
        }

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}
}

DevicesTab.propTypes = {
    dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
    rowHasChanged: (r1, r2) => r1 !== r2,
    sectionHeaderHasChanged : (s1, s2) => s1 !== s2
});

function select(store) {
	const {items, sectionIds} = parseDevicesForListView(store.devices, store.gateways, store.dashboard);
	return {
		dataSource: dataSource.cloneWithRowsAndSections(items, sectionIds),
		gateways: store.gateways,
		editMode: store.tabs.editModeDevicesTab,
		devices: store.devices
	};
}

function actions(dispatch) {
	return {
		addToDashboard: (id) => dispatch(addToDashboard('device', id)),
		removeFromDashboard: (id) => dispatch(removeFromDashboard('device', id)),
		dispatch
	};
}

module.exports = connect(select, actions)(DevicesTab);

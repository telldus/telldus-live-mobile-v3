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

import { Button, Container, Icon, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { DeviceRow } from 'TabViews/SubViews';

import { getDevices, deviceSetState, addToDashboard, removeFromDashboard } from 'Actions';
import { TouchableOpacity } from 'react-native';
import DeviceDetailView from '../DetailViews/DeviceDetailView';
import Theme from 'Theme';

class DevicesTab extends View {
	render() {
		return (
			<List
				dataSource = {this.props.dataSource}
				renderHiddenRow = { this._renderHiddenRow.bind(this) }
				renderRow = { props => (<DeviceRow {...{ ...props, ...this.props }}/>) }
				renderSectionHeader = {this._renderSectionHeader.bind(this)}
				rightOpenValue = {-40}
				editMode = {this.props.editMode}
				onRefresh = {() =>
					this.props.dispatch(getDevices())
				}
			/>
		);
	}

	onStarSelected(item) {
		if (item.inDashboard) {
			this.props.removeFromDashboard(item.id);
		} else {
			this.props.addToDashboard(item.id);
		}
	}

	_renderHiddenRow(data) {
		let inDashboard = (data.inDashboard === true);

		return (
			<View style={Theme.Styles.rowBack}>
				<TouchableOpacity
					style={Theme.Styles.rowBackButton}
					onPress={this.onStarSelected.bind(this, data)} >
					<Icon name="star" size={26} color={inDashboard ? 'yellow' : 'white'}/>
				</TouchableOpacity>
			</View>
		);
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

	_renderRow(item) {
		try {
			return (
				<ListItem style = { Theme.Styles.rowFront }>
					<Container style = {{ marginLeft: 4, flexDirection: 'row'}}>
							<Button
								name = { 'toggle-on' }
								style = {{ padding: 6}}
								color = {'blue'}
								size = {30}
								backgroundColor = {'transparent'}
								onPress={ () => this.props.dispatch(deviceSetState(item.id, 1)) }
							/>
							<View style={{flex:10, justifyContent: 'center', }}>
								<Text style = {{
									marginLeft: 8,
									color: 'rgba(0,0,0,0.87)',
									fontSize: 16,
									opacity: item.name ? 1 : 0.5,
									textAlignVertical: 'center',
								}}>
									{item.name ? item.name : '(no name)'}
								</Text>
							</View>
							<View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
								<Icon
									name="arrow-right"
									onPress={ () => this.props.navigator.push({
										component: DeviceDetailView,
										title: item.name,
										passProps: { device: item }
									})}
								/>
							</View>
					</Container>
				</ListItem>
			);
		} catch(e) {
			console.log(e);
			return ( <View /> );
		}
	}
}

DevicesTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged : (s1, s2) => s1 !== s2
});

function parseDataIntoItemsAndSections(devices, gateways, dashboard) {
	const items = {};
	const sectionIds = [];

	if (devices) {
		devices.map((item) => {
			var sectionId = item.clientId ? item.clientId : '';
			if (sectionIds.indexOf(sectionId) === -1) {
				sectionIds.push(sectionId);
				items[sectionId] = [];
			}

			if (dashboard.devices.indexOf(item.id) >= 0) {
				item.inDashboard = true;
			} else {
				item.inDashboard = false;
			}

			items[sectionId].push(item);
		});
	}
	sectionIds.sort((a,b) => {
		try {
			const gatewayA = gateways.find((gateway) => gateway.id === a);
			const gatewayB = gateways.find((gateway) => gateway.id === b);
			if (gatewayA.name < gatewayB.name) {
				return -1;
			}
			if (gatewayA.name > gatewayB.name) {
				return 1;
			}
			return 0;
		} catch (e) {
			return 0;
		}
	});
	return {items, sectionIds};
}

function select(store) {
	var {items, sectionIds} = parseDataIntoItemsAndSections(store.devices || [], store.gateways || [], store.dashboard);
	return {
		dataSource: dataSource.cloneWithRowsAndSections(items, sectionIds),
		gateways: store.gateways,
		editMode: store.tabs.editModeDevicesTab,
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

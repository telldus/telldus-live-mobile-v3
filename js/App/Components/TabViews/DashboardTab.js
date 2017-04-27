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

import { DeviceDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';

class DashboardTab extends View {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: new ListDataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.props.dataArray),
		};
	}

	_onLayout = (event) => {
		const listWidth = event.nativeEvent.layout.width - 8;
		const isPortrait = true;
		let baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		if (listWidth > 0) {
			let numberOfTiles = Math.floor(listWidth / baseTileSize);
			let tileSize = listWidth / numberOfTiles;
			if (numberOfTiles === 0) {
				tileSize = baseTileSize;
			}
			const tileWidth = Math.floor(tileSize);
			let data = this.props.dataArray;
			data.map((item) => {
				item.tileWidth = tileWidth;
			});
			this.setState({
				dataSource: new ListDataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(data)
			});
		}
	}

	render() {
		return (
			<View onLayout={this._onLayout}>
				<List
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
					dataSource = {this.state.dataSource}
					renderRow = {this._renderRow}
					pageSize = {100}
				/>
			</View>
		);
	}

	_renderRow(item, secId, rowId, rowMap) {
		if (item.tileWidth > 75) {
			let tileMargin = 8;
			let tileStyle = {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				width: item.tileWidth - tileMargin,
				height: item.tileWidth - tileMargin,
				marginTop: tileMargin,
				marginLeft: tileMargin,
				borderRadius: 2
			};
			if (item.objectType === 'sensor') {
				return (
					<SensorDashboardTile style={tileStyle} item={item} />
				);
			}
			if (item.objectType === 'device') {
				return (
					<DeviceDashboardTile style={tileStyle} item={item} />
				);
			}
		}
		return <View />;
	}

}

function _parseDataIntoItems(devices, sensors, dashboard) {
	let items = [];
	// if (devices && devices.map) {
	// 	devices.map((item) => {
			// var dashboardItem = {
			// 	objectType: 'device',
			// 	childObject: item,
			// 	tileWidth: 0
			// }
			// items.push(dashboardItem);

	// 	});
	// }
	// if (sensors && sensors.map) {
	// 	sensors.map((item) => {
	// 		var dashboardItem = {
	// 			objectType: 'sensor',
	// 			childObject: item,
	// 			tileWidth: 0
	// 		}
	// 		items.push(dashboardItem);
	// 	});
	// }

	if (devices && devices.filter) {
		let devicesInDashboard = devices.filter(item => dashboard.devices.indexOf(item.id) >= 0);
		devicesInDashboard.map((item) => {
			let dashboardItem = {
				objectType: 'device',
				childObject: item,
				tileWidth: 0
			};
			items.push(dashboardItem);
		});
	}

	if (sensors && sensors.filter) {
		let sensorsInDashboard = sensors.filter(item => dashboard.sensors.indexOf(item.id) >= 0);
		sensorsInDashboard.map((item) => {
			let dashboardItem = {
				objectType: 'sensor',
				childObject: item,
				tileWidth: 0
			};
			items.push(dashboardItem);
		});
	}
	return items;
}

function select(store) {
	return {
		dataArray: _parseDataIntoItems( store.devices || [], store.sensors || [] , store.dashboard),
		gateways: store.gateways,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ''}
	};
}

module.exports = connect(select)(DashboardTab);

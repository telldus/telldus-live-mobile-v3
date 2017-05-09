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
import { changeSensorDisplayType } from 'Actions';

import { DimmerDashboardTile, NavigationalDashboardTile, BellDashboardTile, DeviceDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';

class DashboardTab extends View {
	constructor(props) {
		super(props);
		this.state = {
			listWidth: 0,
			dataSource: new ListDataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.props.dataArray),
		};

		this._onLayout = this._onLayout.bind(this);
		this._calculateItemDimensions = this._calculateItemDimensions.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	_onLayout = (event) => {
		const listWidth = event.nativeEvent.layout.width - 8;
		const data = this._calculateItemDimensions(listWidth);
		this.setState({
			listWidth,
			dataSource: new ListDataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(data)
		});
	}

	_calculateItemDimensions = (listWidth) => {
		const isPortrait = true;
		const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		if (listWidth > 0) {
			const numberOfTiles = Math.floor(listWidth / baseTileSize);
			const tileSize = listWidth / numberOfTiles;
			if (numberOfTiles === 0) {
				tileSize = baseTileSize;
			}
			const tileWidth = Math.floor(tileSize);
			const data = this.props.dataArray;
			data.map((item) => {
				item.tileWidth = tileWidth;
			});

			return data;
		}

		return null;
	}

	render() {
		let dataSource;
		const data = this._calculateItemDimensions(this.state.listWidth);
		if (data) {
			dataSource = new ListDataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(data);
		}
		dataSource = dataSource ? dataSource : this.state.dataSource;

		return (
			<View onLayout={this._onLayout}>
				<List
					ref="list"
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
					dataSource = {dataSource}
					renderRow = {this._renderRow.bind(this)}
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
					<SensorDashboardTile style={tileStyle} item={item} onSensorSelected={this.props.changeSensorDisplayType}/>
				);
			} else if (item.objectType === 'device') {
				return (
					// <DeviceDashboardTile style={tileStyle} item={item} />
					// <BellDashboardTile style={tileStyle} item={item} />
					// <NavigationalDashboardTile style={tileStyle} item={item} />
					<DimmerDashboardTile
						style={tileStyle}
						item={item}
						setScrollEnabled={this.setScrollEnabled}
						onSlidingStart={this.props.onSlidingStart}
						onSlidingComplete={this.props.onSlidingComplete}
						onValueChange={this.props.onValueChange} />
				);
			}
		}
		return <View />;
	}

}

function _parseDataIntoItems(devices, sensors, dashboard) {
	const items = [];

	if (devices && devices.filter) {
		let devicesInDashboard = devices.filter(item => dashboard.devices.indexOf(item.id) >= 0);
		devicesInDashboard.map((item) => {
			const dashboardItem = {
				objectType: 'device',
				childObject: item,
				tileWidth: 0
			};
			items.push(dashboardItem);
		});
	}

	if (sensors && sensors.filter) {
		let sensorsInDashboard = sensors.filter(item => {
			for (let i = 0; i < dashboard.sensors.length; ++i) {
				if (dashboard.sensors[i].id === item.id) {
					return true;
				}
			}
			return false;
		});

		sensorsInDashboard.map((item) => {
			let displayType = 'default';
			for (let i = 0; i < dashboard.sensors.length; ++i) {
				if (dashboard.sensors[i].id === item.id) {
					displayType = dashboard.sensors[i].displayType;
					break;
				}
			}
			const dashboardItem = {
				objectType: 'sensor',
				childObject: item,
				tileWidth: 0,
				displayType
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

function actions(dispatch) {
	return {
		changeSensorDisplayType: (item, displayType) => dispatch(changeSensorDisplayType(item.id, displayType)),
		dispatch
	};
}

module.exports = connect(select, actions)(DashboardTab);

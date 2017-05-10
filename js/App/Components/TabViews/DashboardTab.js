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
import { changeSensorDisplayType, showDimmerPopup, hideDimmerPopup, setDimmerValue } from 'Actions';

import { DimmerDashboardTile, NavigationalDashboardTile, BellDashboardTile, ToggleDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';

import getDeviceType from '../../Lib/getDeviceType';
import { parseDashboardForListView } from '../../Reducers/Dashboard';


// TODO: this view renders before the sensor and device data is retrieved
//       that might not be a problem, but we should know why
//       - store.devices and store.sensors are empty objects (not even arrays)
//       - store.dashboard is populated
//       better solution would be to render the old sensor/device data but
//       to indicate also it is old data

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
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);

	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	componentWillReceiveProps(nextProps) {
		// TODO: write a better comparison function
		if (nextProps.dataArray === this.props.dataArray) {
			return;
		}
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.dataArray),
		});
    }

	onSlidingStart(name:String, value:Number) {
		this.props.dispatch(showDimmerPopup(name, value));
	}

	onSlidingComplete() {
		console.log('onSlidingComplete');
		this.props.dispatch(hideDimmerPopup());
	}

	onValueChange(value) {
		this.props.dispatch(setDimmerValue(value));
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
		// add to List props: enableEmptySections={true}, to surpress warning

		return (
			<View onLayout={this._onLayout}>
				<List
					ref="list"
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
					dataSource = {this.state.dataSource}
					renderRow = {this._renderRow(this.state.tileWidth)}
					pageSize = {100}
				/>
			</View>
		);
	}

	_renderRow(item, secId, rowId, rowMap) {
		console.log('ITEM');
		console.log(item);
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
				const deviceId = item.childObject.id;
				let dashboardTile = <View />;
				// -- This code is for testing.
				// -- TODO: Determine the type of dashboardTile based on deviceId
				/*if (deviceId && Number.isInteger(deviceId) && deviceId > 0) {
					if (deviceId === 1594308 || deviceId === 1594539 || deviceId === 1594552 || deviceId === 1594307) {
						dashboardTile = <ToggleDashboardTile style={tileStyle} item={item} />;
					} else if (deviceId === 1644324) {
						dashboardTile = <DimmerDashboardTile
							style={tileStyle}
							item={item}
							value={4}
							setScrollEnabled={this.setScrollEnabled}
							onSlidingStart={this.onSlidingStart}
							onSlidingComplete={this.onSlidingComplete}
							onValueChange={this.onValueChange} />;
					} else if (deviceId === 1643432) {
						dashboardTile = <BellDashboardTile style={tileStyle} item={item} />;
					} else if (deviceId === 1643434 || deviceId === 1643435 || deviceId === 1643433) {
						dashboardTile = <NavigationalDashboardTile style={tileStyle} item={item} />;
					}
				}*/
				//
				const deviceType = this.getType(deviceId);

				if (deviceType === 'TOGGLE') {
					dashboardTile = <ToggleDashboardTile style={tileStyle} item={item} />;
				} else if (deviceType === 'DIMMER') {
					dashboardTile = <DimmerDashboardTile
						style={tileStyle}
						item={item}
						value={4}
						setScrollEnabled={this.setScrollEnabled}
						onSlidingStart={this.onSlidingStart}
						onSlidingComplete={this.onSlidingComplete}
						onValueChange={this.onValueChange} />;
				} else if (deviceType === 'BELL') {
					dashboardTile = <BellDashboardTile style={tileStyle} item={item} />;
				} else if (deviceType === 'NAVIGATIONAL') {
					dashboardTile = <NavigationalDashboardTile style={tileStyle} item={item} />;
				}

				return dashboardTile;
			}
		}
		return <View />;
	}

	getType(deviceId) {
		const filteredItem = this.props.devices.find(item => item.id === deviceId);
		if (!filteredItem) { return null; }

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}
}

function select(store, props) {
	return {
		dataArray: parseDashboardForListView(store),
		gateways: store.gateways,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ''},
		devices: store.devices
	};
}

function actions(dispatch) {
	return {
		changeSensorDisplayType: (item, displayType) => dispatch(changeSensorDisplayType(item.id, displayType)),
		dispatch
	};
}

module.exports = connect(select, actions)(DashboardTab);

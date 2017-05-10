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
import { turnOn, turnOff, bell, down, up, stop } from 'Actions/Devices';
import { showDimmerPopup, hideDimmerPopup, setDimmerValue, updateDimmerValue } from 'Actions/Dimmer';

import { parseDashboardForListView } from '../../Reducers/Dashboard';

import { DimmerDashboardTile, NavigationalDashboardTile, BellDashboardTile, ToggleDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';

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


	componentWillReceiveProps(nextProps) {
		// TODO: write a better comparison function
		if (nextProps.dataArray === this.props.dataArray) {
			return;
		}
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.dataArray),
		});
    }

	_onLayout = (event) => {
		const listWidth = event.nativeEvent.layout.width - 8;
		const isPortrait = true;
		if (listWidth <= 0) {
			return;
		}
		const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		const tilesPerRow = Math.floor(listWidth / baseTileSize);
		const tileWidth = tilesPerRow === 0 ? baseTileSize : Math.floor(listWidth / tilesPerRow);

		this.setState({
			tileWidth,
		});
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

	_renderRow(tileWidth) {
		return (item, secId, rowId, rowMap) => {
			item.tileWidth = tileWidth;
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
				if (deviceId && Number.isInteger(deviceId) && deviceId > 0) {
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
				}

				return (dashboardTile);
			}
		};
	}
}

function select(store, props) {
	return {
		dataArray: parseDashboardForListView(store),
		gateways: store.gateways,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ''},
	};
}

function actions(dispatch) {
	return {
		changeSensorDisplayType: (item, displayType) => dispatch(changeSensorDisplayType(item.id, displayType)),
		dispatch
	};
}

module.exports = connect(select, actions)(DashboardTab);

function actions(dispatch) {
	return {
		onTurnOn: id => () => dispatch(turnOn(id)),
		onTurnOff: id => () => dispatch(turnOff(id)),
		onBell: id => () => dispatch(bell(id)),
		onDown: id => () => dispatch(down(id)),
		onUp: id => () => dispatch(up(id)),
		onStop: id => () => dispatch(stop(id)),
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		onDim: id => value => dispatch(updateDimmerValue(id, value)),
		changeSensorDisplayType: (item, displayType) => dispatch(changeSensorDisplayType(item.id, displayType)),
		dispatch
	};
}

module.exports = connect(select, actions)(DashboardTab);

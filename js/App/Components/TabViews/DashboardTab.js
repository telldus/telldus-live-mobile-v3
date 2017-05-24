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
import { createSelector } from 'reselect';
import { Dimensions } from 'react-native';
import { connect } from 'react-redux';
import Subscribable from 'Subscribable';
import { Text, List, ListDataSource, View } from 'BaseComponents';
import Platform from 'Platform';
import { turnOn, turnOff, bell, down, up, stop, getDevices } from 'Actions/Devices';
import { showDimmerPopup, hideDimmerPopup, setDimmerValue, updateDimmerValue } from 'Actions/Dimmer';

import { parseDashboardForListView } from '../../Reducers/Dashboard';
import { getUserProfile } from '../../Reducers/User';

import { GenericDashboardTile, DimmerDashboardTile, NavigationalDashboardTile, BellDashboardTile, ToggleDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';
import { SettingsDetailModal } from 'DetailViews';

import getDeviceType from '../../Lib/getDeviceType';
import reactMixin from 'react-mixin';

// TODO: this view renders before the sensor and device data is retrieved
//       that might not be a problem, but we should know why
//       - store.devices and store.sensors are empty objects (not even arrays)
//       - store.dashboard is populated
//       better solution would be to render the old sensor/device data but
//       to indicate also it is old data

const tileMargin = 8;
const listMargin = 8;

class DashboardTab extends View {

	constructor(props) {
		super(props);
		const { width } = Dimensions.get('window');
		const tileWidth = this.calculateTileWidth(width);

		this.state = {
			tileWidth,
			listWidth: 0,
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
			}).cloneWithRows(this.props.rows),
			settings: false,
		};

		this._onLayout = this._onLayout.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.mixins = [Subscribable.Mixin];
	}

	rowHasChanged(r1, r2) {
		return r1.childObject !== r2.childObject;
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

	componentDidMount() {
		if (Platform.OS === 'ios') {
			this.addListenerOn(this.props.events, 'onSetting', this.onOpenSetting);
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.rows),
		});
	}

	_onLayout = (event) => {
		const tileWidth = this.calculateTileWidth(event.nativeEvent.layout.width);
		if (tileWidth !== this.state.tileWidth) {
			this.setState({
				tileWidth,
			});
		}
	}

	calculateTileWidth(listWidth) {
		listWidth -= listMargin;
		const isPortrait = true; // okay...
		if (listWidth <= 0) {
			return;
		}
		const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		const tilesPerRow = Math.floor(listWidth / baseTileSize);
		const tileWidth = tilesPerRow === 0 ? baseTileSize : Math.floor(listWidth / tilesPerRow);
		return tileWidth;
	}

	onOpenSetting() {
		this.setState({ settings: true });
	}

	onCloseSetting() {
		this.setState({ settings: false });
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
					onRefresh = {() =>
						this.props.dispatch(getDevices())
					}
				/>
				{
					this.state.settings ?
						<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting.bind(this)} /> :
						null
				}
			</View>
		);
	}

	_renderRow(tileWidth) {
		tileWidth -= tileMargin;
		return (row, secId, rowId, rowMap) => {
			if (row.objectType !== 'sensor' && row.objectType !== 'device') {
				return <Text>unknown device or sensor</Text>;
			}

			let tileStyle = {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				width: tileWidth - tileMargin,
				height: tileWidth - tileMargin,
				marginTop: tileMargin,
				marginLeft: tileMargin,
				borderRadius: 2,
			};

			const itemId = row.childObject.id;

			if (row.objectType === 'sensor') {
				return <SensorDashboardTile
					style={tileStyle}
					tileWidth={tileWidth}
					item={row.childObject}
				/>;
			}

			const deviceType = getDeviceType(row.childObject.supportedMethods);

			if (deviceType === 'TOGGLE') {
				return <ToggleDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					onTurnOn={this.props.onTurnOn(itemId)}
					onTurnOff={this.props.onTurnOff(itemId)}
				/>;
			}

			if (deviceType === 'DIMMER') {
				return <DimmerDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					onTurnOn={this.props.onTurnOn(itemId)}
					onTurnOff={this.props.onTurnOff(itemId)}
					setScrollEnabled={this.setScrollEnabled}
					onDim={this.props.onDim(itemId)}
					onDimmerSlide={this.props.onDimmerSlide(itemId)}
				/>;
			}

			if (deviceType === 'BELL') {
				return <BellDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					onBell={this.props.onBell(itemId)}
				/>;
			}

			if (deviceType === 'NAVIGATIONAL') {
				return <NavigationalDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					onUp={this.props.onUp(itemId)}
					onDown={this.props.onDown(itemId)}
					onStop={this.props.onStop(itemId)}
				/>;
			}

			return <GenericDashboardTile
				item={row.childObject}
				tileWidth={tileWidth}
				style={tileStyle}
			/>;
		};
	}
}


DashboardTab.propTypes = {
	rows: React.PropTypes.array,
};

const getRows = createSelector(
	[
		({ dashboard }) => dashboard,
		({ devices }) => devices,
		({ sensors }) => sensors,
	],
	(dashboard, devices, sensors) => parseDashboardForListView(dashboard, devices, sensors)
);

function mapStateToProps(state, props) {
	return {
		rows: getRows(state),
		gateways: state.gateways,
		userProfile: getUserProfile(state),
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onTurnOn: id => () => dispatch(turnOn(id)),
		onTurnOff: id => () => dispatch(turnOff(id)),
		onBell: id => () => dispatch(bell(id)),
		onDown: id => () => dispatch(down(id)),
		onUp: id => () => dispatch(up(id)),
		onStop: id => () => dispatch(stop(id)),
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		onDim: id => value => dispatch(updateDimmerValue(id, value)),
		dispatch,
	};
}

reactMixin(DashboardTab.prototype, Subscribable.Mixin);

module.exports = connect(mapStateToProps, mapDispatchToProps)(DashboardTab);

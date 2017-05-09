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
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(this.props.dataArray),
		};
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
					<SensorDashboardTile style={tileStyle} item={item} />
				);
			}
			if (item.objectType === 'device') {
				return (
					<DeviceDashboardTile style={tileStyle} item={item} />
				);
			}
			return <View />;
		};
	}
}

function select(store, props) {
	return {
		dataArray: parseDashboardForListView(store),
		gateways: store.gateways,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ''}
	};
}

module.exports = connect(select)(DashboardTab);

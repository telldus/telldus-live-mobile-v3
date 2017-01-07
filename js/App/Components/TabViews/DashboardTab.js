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

import { Container, Content, Dimensions, Button, List, ListItem, Text, View } from 'BaseComponents';
import { getDevices } from 'Actions';

import Theme from 'Theme';

import type { Tab } from '../reducers/navigation';

var flattenStyle = require('flattenStyle');

class DashboardTab extends View {

	constructor() {
		super();
	}

	render() {
		try {
			return (
				<List
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
					dataArray = {this.props.dataSource}
					renderRow = {this._renderRow}
				/>
			);
		} catch(e) {
			console.log(e);
			return ( <View /> )
		}
	}

	_renderRow(item, secId, rowId, rowMap, tileWidth) {
		const minutesAgo =  Math.round(((Date.now() / 1000) - item.lastUpdated) / 60);
		try {
			return (
				<ListItem style = {{
					backgroundColor: '#ff9090',
					flexDirection: 'row',
					justifyContent: 'flex-start',
					alignItems: 'center',
					width: tileWidth > 50 ? tileWidth : 100,
					height: tileWidth > 50 ? tileWidth : 100
				}}>
					<Container style = {{ marginLeft: 16, flexDirection: 'row'}}>
						<View>
							<Text style = {{
								color: 'rgba(0,0,0,0.87)',
								fontSize: 16,
								opacity: item.name ? 1 : 0.5,
								marginBottom: 2
							}}>
								({item.objectType ? item.objectType.charAt(0) : '?'}) ({tileWidth}) {item.name ? item.name : '(no name)'}
							</Text>
						</View>
					</Container>
				</ListItem>
			)
		} catch(e) {
			console.log(e);
			return ( <View /> )
		}
	}

}

function _parseDataIntoItems(devices, sensors) {
	var items = [];
	if (devices && devices.map) {
		devices.map((item) => {
			item.objectType = 'device';
			items.push(item);

		});
	}
	if (sensors && sensors.map) {
		sensors.map((item) => {
			item.objectType = 'sensor';
			items.push(item);
		});
	}
	return items;
}

function select(store) {
	return {
		dataSource: _parseDataIntoItems( store.devices || [], store.sensors || [] ),
		gateways: store.gateways,
		userProfile: store.user.userProfile || {firstname: '', lastname: '', email: ""}
	};
}

module.exports = connect(select)(DashboardTab);

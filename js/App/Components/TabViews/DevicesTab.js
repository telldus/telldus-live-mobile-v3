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

import { Button, Icon, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getDevices } from 'Actions';

import DeviceDetailView from '../DetailViews/DeviceDetailView'

import type { Tab } from '../reducers/navigation';

class DevicesTab extends View {
	render() {
		return (
			<List
				dataSource = { this.props.dataSource }
				onRefresh = { () =>
					this.props.dispatch(getDevices(this.props.accessToken))
				}
				renderRow = { (item) =>
					<ListItem iconRight>
						<Text>{item.name}</Text>
						<Icon
							name="arrow-right"
							onPress={ () => this.props.navigator.push({
								component: DeviceDetailView,
								title: item.name,
								passProps: { device: item }
							})}
						></Icon>
					</ListItem>
				}
			/>
		);
	}
}

DevicesTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
});

function select(store) {
	return {
		dataSource: dataSource.cloneWithRows(store.devices.devices),
		devices: store.devices.devices,
		accessToken: store.user.accessToken,
	};
}

module.exports = connect(select)(DevicesTab);

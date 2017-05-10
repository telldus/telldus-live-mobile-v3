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

import { Image, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getGateways } from 'Actions';

import Theme from 'Theme';

import GatewayIcons from 'GatewayIcons';

class GatewaysTab extends View {

	_renderRow(item) {
		try {
			return (
				<ListItem style = { Theme.Styles.rowFront }>
					<View style = { Theme.Styles.listItemAvatar }>
						<Image source = { GatewayIcons.get(item.type) } />
					</View>
					<Text style = {{
						color: 'rgba(0,0,0,0.87)',
						fontSize: 16,
						opacity: item.name ? 1 : 0.5,
						marginBottom: 2
					}}>
						{item.name ? item.name : '(no name)'} ({item.online})
					</Text>
				</ListItem>
			);
		} catch (e) {
			console.log(e);
			return ( <View /> );
		}
	}
	f
	render() {
		return (
			<List
				dataSource = {this.props.dataSource}
				renderRow = {this._renderRow.bind(this)}
				onRefresh = {() =>
					this.props.dispatch(getGateways())
				}
			/>
		);
	}
}

GatewaysTab.propTypes = {
	dataSource: React.PropTypes.object,
};

const dataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
});

function select(store) {
	return {
		dataSource: dataSource.cloneWithRows(store.gateways || []),
		gateways: store.gateways
	};
}

module.exports = connect(select)(GatewaysTab);

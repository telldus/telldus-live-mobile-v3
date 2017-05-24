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
import { createSelector } from 'reselect';

import { Image, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getGateways } from 'Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import Theme from 'Theme';

import GatewayIcons from 'GatewayIcons';

class GatewaysTab extends View {
	constructor(props) {
		super(props);

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(this.props.rows),
			settings: false,
		};

		this.renderRow.bind(this);
	}
	renderRow(item) {
		return (
			<ListItem style = {Theme.Styles.gatewayRowFront}>
				<View style = {Theme.Styles.listItemAvatar}>
					<Image source = {GatewayIcons.get(item.type)} />
				</View>
				<Text style = {{
					color: 'rgba(0,0,0,0.87)',
					fontSize: 16,
					opacity: item.name ? 1 : 0.5,
					marginBottom: 2,
				}}>
					{item.name ? item.name : '(no name)'} ({item.online})
				</Text>
			</ListItem>
		);
	}
	render() {
		return (
			<List
				dataSource = {this.state.dataSource}
				renderRow = {this.renderRow}
				onRefresh = {() =>
					this.props.dispatch(getGateways())
				}
			/>
		);
	}
}

const getRows = createSelector(
	[
		({ gateways }) => gateways,
	],
	(gateways) => parseGatewaysForListView(gateways)
);

function mapStateToProps(state, props) {
	return {
		rows: getRows(state),
	};
}

module.exports = connect(mapStateToProps)(GatewaysTab);

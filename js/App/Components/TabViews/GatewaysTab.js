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

import { Button, Icon, List, ListItem, Text, View } from 'BaseComponents';
import { getGateways } from 'Actions';

import GatewayDetailView from '../DetailViews/GatewayDetailView'

import type { Tab } from '../reducers/navigation';

class GatewaysTab extends View {
	render() {
		return (
			<List
				renderRow = { (item) =>
					<ListItem iconRight>
						<Text>{item.name}</Text>
						<Icon
							name="arrow-right"
							onPress={ () => this.props.navigator.push({
								component: GatewayDetailView,
								title: item.name,
								passProps: { gateway: item }
							})}
						></Icon>
					</ListItem>
				}
				onFetch = { (page = 1, callback, options) => {
					if (options.firstLoad || this.props.gateways.length === 0) {
						callback(this.props.gateways, { allLoaded: true });
					}
					this.props.dispatch(getGateways(this.props.accessToken))
					.then(() => {
							callback(store.getState().gateways.gateways, { allLoaded: true });
						}
					)
					.catch(function (e) {
						callback(this.props.gateways, { allLoaded: true });
					}.bind(this));
				}}
			/>
		);
	}
}

function select(store) {
	return {
		gateways: store.gateways.gateways,
		accessToken: store.user.accessToken,
	};
}

module.exports = connect(select)(GatewaysTab);

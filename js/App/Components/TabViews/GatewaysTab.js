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

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';

import { Image, List, ListDataSource, ListItem, Text, View } from 'BaseComponents';
import { getGateways } from 'Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';
import type { Dispatch } from 'Actions_Types';

import Theme from 'Theme';
import { getTabBarIcon } from 'Lib';

const messages = defineMessages({
	gateways: {
		id: 'pages.gateways',
		defaultMessage: 'Gateways',
		description: 'The gateways tab',
	},
});

type Props = {
	rows: Array<Object>,
	dispatch: Dispatch,
};

type State = {
	dataSource: Object,
	settings: false,
};

type renderRowProps = {
	name: string,
	online: boolean,
	websocketOnline: boolean,
};

class GatewaysTab extends View {

	props: Props;
	state: State;

	renderRow: (renderRowProps) => Object;
	onRefresh: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(messages.gateways),
		tabBarIcon: ({ focused, tintColor }: Object): React$Element<any> => getTabBarIcon(focused, tintColor, 'gateways'),
	});

	constructor(props: Props) {
		super(props);

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
			}).cloneWithRows(this.props.rows),
			settings: false,
		};

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps: Object) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.rows),
		});
	}

	rowHasChanged(r1: Object, r2: Object): boolean {
		return r1 !== r2;
	}

	onRefresh() {
		this.props.dispatch(getGateways());
	}

	renderRow({ name, online, websocketOnline }: Object): any {
		let locationSrc;
		if (!online) {
			locationSrc = require('./img/tabIcons/location-red.png');
		} else if (!websocketOnline) {
			locationSrc = require('./img/tabIcons/location-orange.png');
		} else {
			locationSrc = require('./img/tabIcons/location-green.png');
		}
		return (
			<ListItem style={Theme.Styles.gatewayRowFront}>
				<View style={Theme.Styles.listItemAvatar}>
					<Image source={locationSrc}/>
				</View>
				<Text style={{
					color: 'rgba(0,0,0,0.87)',
					fontSize: 16,
					opacity: name ? 1 : 0.5,
					marginBottom: 2,
				}}>
					{name ? name : '(no name)'}
				</Text>
			</ListItem>
		);
	}

	render(): React$Element<any> {
		return (
			<View>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}
}

const getRows = createSelector(
	[
		({ gateways }: Object): Object => gateways,
	],
	(gateways: Object): Array<Object> => parseGatewaysForListView(gateways)
);

function mapStateToProps(state: Object, props: Object): Object {
	return {
		rows: getRows(state),
	};
}

module.exports = connect(mapStateToProps)(GatewaysTab);

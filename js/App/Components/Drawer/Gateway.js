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
 *
 */

// @flow

'use strict';

import React, { PureComponent } from 'react';
import { TouchableOpacity, Image, Text } from 'react-native';
import { IconTelldus, View } from '../../../BaseComponents';

type Props = {
	gateway: Object,
	styles: Object,
	onPressGateway: (Object) => void,
};

export default class Gateway extends PureComponent<Props, null> {
	props: Props;

	offline: number;
	socketOffline: number;
	online: number;
	onPress: () => void;

	constructor(props: Props) {
		super();

		this.offline = require('../TabViews/img/tabIcons/location-red.png');
		this.socketOffline = require('../TabViews/img/tabIcons/location-orange.png');
		this.online = require('../TabViews/img/tabIcons/location-green.png');

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		let { onPressGateway, gateway } = this.props;
		onPressGateway(gateway);
	}

	render(): Object {
		let { styles, gateway } = this.props;
		let { name, online, websocketOnline } = gateway;
		let locationSrc;
		if (!online) {
			locationSrc = this.offline;
		} else if (!websocketOnline) {
			locationSrc = this.socketOffline;
		} else {
			locationSrc = this.online;
		}

		return (
			<TouchableOpacity style={styles.gatewayContainer} onPress={this.onPress}>
				<Image style={styles.gatewayIcon} source={locationSrc}/>
				<Text style={styles.gateway} ellipsizeMode="middle" numberOfLines={1}>{name}</Text>
				<View style={{flex: 1, alignItems: 'flex-end', paddingRight: 10, justifyContent: 'center'}}>
					<IconTelldus icon={'settings'} size={24} color={'#bdbdbd'}/>
				</View>
			</TouchableOpacity>
		);
	}
}

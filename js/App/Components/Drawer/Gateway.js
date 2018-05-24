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
import { TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import { IconTelldus, View } from '../../../BaseComponents';
import LocationDetails from '../TabViews/SubViews/Gateway/LocationDetails';
import Status from '../TabViews/SubViews/Gateway/Status';
import { getLocationImageUrl, getDrawerWidth } from '../../Lib';

type Props = {
	gateway: Object,
	onPressGateway: (Object) => void,
	intl: intlShape,
	appLayout: Object,
};

class Gateway extends PureComponent<Props, null> {
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

	getLocationStatus(online: boolean, websocketOnline: boolean, statusStyle: any, statusInfoStyle: any): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl}
				textStyle={statusStyle} statusInfoStyle={statusInfoStyle}/>
		);
	}

	render(): Object {
		const { gateway, appLayout } = this.props;
		const { name, online, websocketOnline, type } = gateway;
		const { width, height } = appLayout;
		const deviceWidth = height > width ? width : height;
		const drawerWidth = getDrawerWidth(deviceWidth);
		const {
			image,
			descriptionContainer,
			gatewayContainer,
			detailsContainer,
			h1Style,
			h2Style,
			iconSettingsContainer,
			statusStyle,
			iconSize,
			statusInfoStyle,
		} = this.getStyles(drawerWidth);

		const info = this.getLocationStatus(online, websocketOnline, statusStyle, statusInfoStyle);
		const locationImageUrl = getLocationImageUrl(type);
		const locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};

		return (
			<TouchableOpacity style={gatewayContainer} onPress={this.onPress}>
				<LocationDetails {...locationData}
					style={detailsContainer}
					imageStyle={image}
					descriptionContainerStyle={descriptionContainer}
					h1Style={h1Style}
					h2Style={h2Style}/>
				<View style={iconSettingsContainer}>
					<IconTelldus icon={'settings'} size={iconSize} color={'#bdbdbd'}/>
				</View>
			</TouchableOpacity>
		);
	}
	getStyles(drawerWidth: number): Object {

		const fontSizeH1 = Math.floor(drawerWidth * 0.048);
		const fontSizeH2 = Math.floor(drawerWidth * 0.042);
		const fontSizeH3 = Math.floor(drawerWidth * 0.038);
		const iconSize = Math.floor(drawerWidth * 0.088);

		return {
			iconSize,
			gatewayContainer: {
				alignItems: 'flex-end',
				justifyContent: 'center',
				flexDirection: 'row',
				marginTop: 5 + (fontSizeH1 * 0.6),
			},
			detailsContainer: {
				width: drawerWidth,
				height: undefined,
				justifyContent: 'flex-end',
				paddingHorizontal: 10,
				paddingVertical: 0,
				marginVertical: 0,
				elevation: 0,
				shadowColor: '#000',
				shadowRadius: 0,
				shadowOpacity: 0,
				shadowOffset: {
					width: 0,
					height: 0,
				},
			},
			image: {
				width: drawerWidth * 0.22,
				height: drawerWidth * 0.22,
				resizeMode: 'stretch',
				marginRight: 10,
			},
			descriptionContainer: {
				flex: 1,
				height: drawerWidth * 0.22,
				marginRight: 0,
			},
			h1Style: {
				fontSize: fontSizeH1,
			},
			h2Style: {
				fontSize: fontSizeH2,
			},
			statusStyle: {
				fontSize: fontSizeH3,
			},
			statusInfoStyle: {
				width: fontSizeH3,
				height: fontSizeH3,
				borderRadius: fontSizeH3 / 2,
			},
			iconSettingsContainer: {
				width: iconSize + 15,
				justifyContent: 'center',
				position: 'absolute',
				right: 5,
				bottom: drawerWidth * 0.04,
			},
		};
	}
}

export default injectIntl(Gateway);

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
import { injectIntl } from 'react-intl';

import {
	IconTelldus,
	View,
	RippleButton,
	EmptyView,
} from '../../../BaseComponents';
import LocationDetails from '../TabViews/SubViews/Gateway/LocationDetails';
import Status from '../TabViews/SubViews/Gateway/Status';
import { getLocationImageUrl, getDrawerWidth } from '../../Lib';
import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';
import Theme from '../../Theme';

type Props = PropsThemedComponent & {
	gateway: Object,
	onPressGateway: (Object) => void,
	intl: Object,
	appLayout: Object,
	dispatch: Function,
	showExchange: boolean,
};

class Gateway extends PureComponent<Props, null> {
	props: Props;

	onPress: () => void;

	constructor(props: Props) {
		super();

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		let { onPressGateway, gateway } = this.props;
		onPressGateway(gateway);
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, statusStyle: any, statusInfoStyle: any, localKey: Object): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl}
				textStyle={statusStyle} statusInfoStyle={statusInfoStyle} localKey={localKey}/>
		);
	}

	render(): Object {
		const { gateway, appLayout } = this.props;

		if (!gateway) {
			return <EmptyView/>;
		}


		const { name, online, websocketOnline, type, localKey = {} } = gateway;
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

		const info = this.getLocationStatus(online, websocketOnline, statusStyle, statusInfoStyle, localKey);
		const locationImageUrl = getLocationImageUrl(type);
		const locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};

		return (
			<RippleButton style={gatewayContainer} onPress={this.onPress}>
				<LocationDetails {...locationData}
					style={detailsContainer}
					imageStyle={image}
					descriptionContainerStyle={descriptionContainer}
					h1Style={h1Style}
					h2Style={h2Style}
					onPress={this.onPress}
					resizeMode={'stretch'}/>
				<View style={iconSettingsContainer} pointerEvents="none">
					<IconTelldus icon={'settings'} size={iconSize} level={25}/>
				</View>
			</RippleButton>
		);
	}
	getStyles(drawerWidth: number): Object {

		const {
			colors,
		} = this.props;

		const {
			textSix,
			inAppBrandSecondary,
			textSeven,
		} = colors;
		const {
			fontSizeFactorEleven,
			fontSizeFactorTwelve,
		} = Theme.Core;

		const fontSizeH1 = Math.floor(drawerWidth * 0.048);
		const fontSizeH2 = Math.floor(drawerWidth * fontSizeFactorTwelve);
		const fontSizeH3 = Math.floor(drawerWidth * fontSizeFactorEleven);
		const iconSize = Math.floor(drawerWidth * 0.088);

		const iconContainerWidth = iconSize + 15;

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
				justifyContent: 'center',
				paddingHorizontal: 10,
				paddingVertical: 0,
				marginVertical: 0,
				elevation: 0,
				shadowColor: '#000',
				shadowRadius: 0,
				shadowOpacity: 0,
				backgroundColor: undefined,
				shadowOffset: {
					width: 0,
					height: 0,
				},
			},
			image: {
				width: drawerWidth * 0.22,
				height: drawerWidth * 0.20,
				resizeMode: 'stretch',
				marginRight: 10,
			},
			descriptionContainer: {
				flex: 0,
				height: undefined,
				marginRight: 0,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			h1Style: {
				fontSize: fontSizeH1,
				marginRight: iconContainerWidth * 2,
				width: drawerWidth - (iconContainerWidth + (drawerWidth * 0.22)),
				flexWrap: 'wrap',
				color: inAppBrandSecondary,
			},
			h2Style: {
				fontSize: fontSizeH2,
				color: textSix,
			},
			statusStyle: {
				fontSize: fontSizeH3,
				color: textSeven,
			},
			statusInfoStyle: {
				fontSize: fontSizeH3 * 2,
			},
			iconSettingsContainer: {
				flex: 1,
				alignItems: 'flex-end',
				justifyContent: 'center',
				position: 'absolute',
				right: 0,
				left: 0,
				top: 0,
				bottom: 0,
				paddingRight: 10,
			},
			coverStyle: {
				paddingVertical: 5,
			},
			iconStyle: {
				fontSize: iconSize * 0.9,
			},
			textStyle: {
				fontSize: fontSizeH3,
			},
		};
	}
}

export default (injectIntl(withTheme(Gateway)): Object);

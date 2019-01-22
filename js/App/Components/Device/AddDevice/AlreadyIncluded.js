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

import React from 'react';
import {
	ScrollView,
} from 'react-native';

import {
	View,
	FloatingButton,
	Row,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';
import { DeviceInfoBlock } from './SubViews';

import Theme from '../../../Theme';

import { capitalize } from '../../../Lib';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

class AlreadyIncluded extends View<Props, null> {
props: Props;

onPressNext: () => void;
constructor(props: Props) {
	super(props);

	this.onPressNext = this.onPressNext.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(`${capitalize(formatMessage(i18n.defaultHeader))}!`, formatMessage(i18n.labelDeviceAlreadyIncluded));
}

onPressNext() {
	const { navigation } = this.props;
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
	});
}

render(): Object {
	const { intl, navigation, appLayout } = this.props;
	const { formatMessage } = intl;

	const {
		container,
		iconSize,
		iconStyle,
		containerStyle,
		infoContainer,
		infoTextStyle,
		statusIconStyle,
	} = this.getStyles();

	const {
		deviceImage,
		deviceModel,
		name,
		imageW,
		imageH,
	} = navigation.getParam('info', {});
	const {
		name: gName,
	} = navigation.getParam('gateway', {});


	return (
		<View style={container}>
			<ScrollView>
				<Row
					containerStyle={containerStyle}>
					<DeviceInfoBlock
						image={deviceImage}
						h1={deviceModel ? deviceModel : formatMessage(i18n.addDeviceDefaultModel)}
						h2={name ? name : formatMessage(i18n.unknown)}
						h3={gName ? gName : formatMessage(i18n.unknown)}
						imageW={imageW}
						imageH={imageH}
						appLayout={appLayout}
					/>
				</Row>
				<View style={infoContainer}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={infoTextStyle}>
						{formatMessage(i18n.messageDeviceAlreadyIncluded, {name: `"${name}"`})}
					</Text>
				</View>
			</ScrollView>
			<FloatingButton
				onPress={this.onPressNext}
				iconName={'checkmark'}
				iconSize={iconSize}
				iconStyle={iconStyle}
			/>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, eulaContentColor, brandSecondary, shadow } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * 0.04;

	return {
		container: {
			flex: 1,
			paddingVertical: padding,
			marginHorizontal: padding,
		},
		containerStyle: {
			height: undefined,
			padding: innerPadding,
		},
		iconSize: deviceWidth * 0.050666667,
		iconStyle: {
			fontSize: deviceWidth * 0.050666667,
			color: '#fff',
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			marginTop: padding / 2,
			padding: innerPadding,
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.16,
			color: brandSecondary,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			color: eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: innerPadding,
		},
	};
}
}

export default AlreadyIncluded;

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
	Text,
	TouchableButton,
	IconTelldus,
} from '../../../../BaseComponents';
import {
	DeviceTypeBlock,
} from '../../Device/AddDevice/SubViews';
import { getAvailableSensorsTypesAndInfo } from '../../../Lib/SensorUtils';
import {
	is433MHzTransport,
	goToWebShop,
} from '../../../Lib/DeviceUtils';
import capitalize from '../../../Lib/capitalize';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	currentScreen: string,
	enableWebshop: boolean,
	locale: string,
	route: Object,

	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
	intl: Object,
};

type State = {
};

class SelectSensorType extends View<Props, State> {
props: Props;
state: State;

onChooseType: (Object) => void;
constructor(props: Props) {
	super(props);

	this.onChooseType = this.onChooseType.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(capitalize(formatMessage(i18n.labelSensorType)), formatMessage(i18n.AddZSTypeHeaderTwo));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { currentScreen } = nextProps;
	return currentScreen === 'SelectSensorType';
}

onChooseType({module, action, secure}: Object) {
	const { navigation, route } = this.props;
	const { gateway = {}, ...others } = route.params || {};

	if (module === 'zwave') {
		navigation.navigate('IncludeDevice', {
			gateway,
			module,
			action,
			secure,
			parent: 'sensors_tab',
		});
	} else if (module === 'rf433') {
		navigation.navigate('SensorsListAddSensor', {
			...others,
			gateway,
		});
	}
}

getDeviceTypes(): Object {
	const { route, intl } = this.props;
	const { formatMessage, formatNumber } = intl;
	const { gateway = {}} = route.params || {};
	const { transports = '' } = gateway;
	const transportsAsArray = transports.split(',');

	let support433 = false, types = {};
	const availableSensorsTypesAndInfo = getAvailableSensorsTypesAndInfo(formatMessage, formatNumber, true);
	transportsAsArray.forEach((ts: string = '') => {
		const availableTypes = availableSensorsTypesAndInfo[ts.trim()];
		if (availableTypes) {
			types = {
				...types,
				...availableTypes.reduce((acc: Object, item: Object): Object => {
					acc[item.id] = item;
					return acc;
				}, {}),
			};
		}
		if (!support433) {
			support433 = is433MHzTransport(ts.trim(), ['433', 'e433']);
		}
	});

	if (!support433) {
		types[availableSensorsTypesAndInfo['433'][0].id] = {
			...availableSensorsTypesAndInfo['433'][0],
			enabled: false,
			h2: formatMessage(i18n.notSupportedByTellstick),
		};
	}

	return {
		types,
		support433,
	};
}

getDeviceTypesToRender(types: Object, appLayout: Object): Array<Object> {
	return Object.keys(types).map((t: Object): Object => {
		const type = types[t];
		return (
			<DeviceTypeBlock
				key={type.id}
				{...type}
				appLayout={appLayout}
				onPress={this.onChooseType}
			/>
		);
	});
}

onPressWebshop = () => {
	const {
		locale,
	} = this.props;

	goToWebShop(locale);
}

render(): Object {
	const {
		appLayout,
		enableWebshop,
		intl,
	} = this.props;
	const {
		types,
		support433,
	 } = this.getDeviceTypes();
	const typesToRender = this.getDeviceTypesToRender(types, appLayout);

	const {
		formatMessage,
	} = intl;

	const {
		container,
		contentContainerStyle,
		no433Cover,
		no433Header,
		no433Body,
		buttonStyle,
		cartIconStyle,
	} = this.getStyles();

	const webShopIcon = <IconTelldus
		icon={'cart'}
		style={cartIconStyle}/>;

	return (
		<ScrollView style={container} contentContainerStyle={contentContainerStyle}>
			{typesToRender}
			{!support433 &&
			<>
				<View
					level={2}
					style={no433Cover}>
					<Text
						level={23}
						style={no433Header}>
						{formatMessage(i18n.gatewayNoSupport433Header)}
					</Text>
					<Text
						level={25}
						style={no433Body}>
						{enableWebshop ?
							formatMessage(i18n.gatewayNoSupport433InfoTwo)
							:
							formatMessage(i18n.gatewayNoSupport433InfoOne)
						}
					</Text>
				</View>
				{
					enableWebshop && (
						<TouchableButton
							onPress={this.onPressWebshop}
							preScript={webShopIcon}
							text={formatMessage(i18n.visitWebShop)}
							style={buttonStyle}/>
					)}
			</>
			}
		</ScrollView>
	);
}
getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		maxSizeTextButton,
		fontSizeFactorTen,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const h2FontSize = deviceWidth * fontSizeFactorTen;

	let fontSize = deviceWidth * 0.065;
	fontSize = fontSize > maxSizeTextButton ? maxSizeTextButton : fontSize;

	return {
		container: {
			flex: 1,
			paddingTop: padding,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingBottom: padding * 2,
		},
		no433Cover: {
			alignItems: 'center',
			...shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			padding: padding * 2,
		},
		no433Header: {
			fontSize: h2FontSize * 1.2,
			marginBottom: padding * 1.6,
			textAlign: 'center',
		},
		no433Body: {
			fontSize: h2FontSize,
			textAlign: 'center',
		},
		buttonStyle: {
			marginTop: padding / 2,
		},
		cartIconStyle: {
			color: '#fff',
			fontSize,
			marginRight: 8,
		},
	};
}
}

export default (SelectSensorType: Object);

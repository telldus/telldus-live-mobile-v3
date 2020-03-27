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
import { ScrollView } from 'react-native';

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
} from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	currentScreen: string,
	enableWebshop: boolean,

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
	onDidMount(formatMessage(i18n.labelSensorType), formatMessage(i18n.AddZSTypeHeaderTwo));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { currentScreen } = nextProps;
	return currentScreen === 'SelectSensorType';
}

onChooseType({module, action, secure}: Object) {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});

	if (module === 'zwave') {
		navigation.navigate('IncludeDevice', {
			gateway,
			module,
			action,
			secure,
			parent: 'sensors_tab',
		});
	} else if (module === 'rf433') {
		const prevParams = navigation.state.params || {};
		navigation.navigate('SensorsListAddSensor', {
			...prevParams,
			gateway,
		});
	}
}

getDeviceTypes(): Object {
	const { navigation, intl } = this.props, types = [];
	const { formatMessage, formatNumber } = intl;
	const gateway = navigation.getParam('gateway', {});
	const { transports = '' } = gateway;
	const transportsAsArray = transports.split(',');

	let support433 = false;
	const availableSensorsTypesAndInfo = getAvailableSensorsTypesAndInfo(formatMessage, formatNumber, true);
	transportsAsArray.forEach((ts: string) => {
		const availableTypes = availableSensorsTypesAndInfo[ts];
		if (availableTypes) {
			types.push(...availableTypes);
		}
		if (!support433) {
			support433 = is433MHzTransport(ts);
		}
	});

	return {
		types,
		support433,
	};
}

getDeviceTypesToRender(types: Array<any>, appLayout: Object): Array<Object> {
	return types.map((type: Object, i: number): Object => {
		return (
			<DeviceTypeBlock
				key={i}
				{...type}
				appLayout={appLayout}
				onPress={this.onChooseType}
			/>
		);
	});
}

render(): Object {
	const {
		appLayout,
		enableWebshop,
	} = this.props;
	const {
		types,
		support433,
	 } = this.getDeviceTypes();
	const typesToRender = this.getDeviceTypesToRender(types, appLayout);

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
				<View style={no433Cover}>
					<Text style={no433Header}>
					433 MHz sensors not supported
					</Text>
					<Text style={no433Body}>
					This gateway does not support 433 MHz sensors. If you would like to add that
					functionality, please have a look at our current TellStick range.
					</Text>
				</View>
				{
					enableWebshop && (
						<TouchableButton
							preScript={webShopIcon}
							text={'Visit webshop'}
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
		brandSecondary,
		paddingFactor,
		rowTextColor,
		shadow,
		maxSizeTextButton,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const h2FontSize = deviceWidth * 0.035;

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
			backgroundColor: '#fff',
			...shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			padding: padding * 2,
		},
		no433Header: {
			color: brandSecondary,
			fontSize: h2FontSize * 1.2,
			marginBottom: padding * 1.6,
			textAlign: 'center',
		},
		no433Body: {
			color: rowTextColor,
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

export default SelectSensorType;

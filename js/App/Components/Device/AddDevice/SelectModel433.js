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
	TouchableOpacity,
} from 'react-native';

import {
	View,
	Text,
	Image,
} from '../../../../BaseComponents';
import { ShortcutRow } from './SubViews';
import { utils } from 'live-shared-data';
const { addDevice433MHz: {getVendorDevices} } = utils;

import {
	prepare433ModelName,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	currentScreen: string,
	locale: string,
	route: Object,

    navigation: Object,
    appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
	actions: Object,
	intl: Object,
};

type State = {
    rows: Array<Object>,
};

class SelectModel433 extends View<Props, State> {
props: Props;
state: State;

onChooseLocation: (Object) => void;
constructor(props: Props) {
	super(props);

	const {
		shortcutToTelldus = false,
		deviceBrand = '',
		gateway = {},
	} = props.route.params || {};

	this.deviceBrand = shortcutToTelldus ? 'Telldus' : deviceBrand;
	const { transports = '' } = gateway;
	const transportsArr = transports.split(',');

	this.state = {
		rows: getVendorDevices(this.deviceBrand, transportsArr),
	};
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelModel), formatMessage(i18n.selectModelOfD));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'SelectModel433';
}

prepareName = (lang: Array<Object> = [], modelNameDef: string): string => {
	return prepare433ModelName(this.props.locale, lang, modelNameDef);
}

onPressShortcutRow = (deviceInfo: Object) => {
	const { navigation, actions, route } = this.props;

	actions.setWidgetParamId(deviceInfo.widget);

	const prevParams = route.params || {};
	navigation.navigate('SetDeviceName433', {
		...prevParams,
		shortcutToTelldus: false,
		deviceInfo,
		deviceBrand: this.deviceBrand,
	});
}

onPressOtherBrand = () => {
	const { navigation, route } = this.props;
	const prevParams = route.params || {};
	navigation.navigate('SelectBrand433', {
		...prevParams,
	});
}

renderRowShortcut = (data: Object, key: number): Object => {
	const {
		imageSource,
		modelName,
		lang,
	} = data;

	return (
		<ShortcutRow
			name={this.prepareName(lang, modelName)}
			img={imageSource}
			rowProps={{
				...data,
			}}
			onPress={this.onPressShortcutRow}
			key={key}/>
	);
}

render(): Object {
	const {
		padding,
		shortCutItemsCover,
		clickTextStyle,
		imageStyle,
		shortCutInfoCover,
		shortCutDevicesCover,
		labelTextStyle,
	} = this.getStyles();
	const { rows } = this.state;

	const { intl, route } = this.props;
	const { formatMessage } = intl;
	const {
		shortcutToTelldus = false,
	} = route.params || {};

	const telldusDevices = rows.map((data: Object, i: number): Object => {
		return this.renderRowShortcut(data, i);
	});

	return (
		<ScrollView
			style={{
				flex: 1,
			}}
			contentContainerStyle={{
				flexGrow: 1,
				paddingVertical: padding,
			}}>
			<View style={shortCutItemsCover}>
				{shortcutToTelldus && <TouchableOpacity onPress={this.onPressOtherBrand}>
					<View
						level={2}
						style={shortCutInfoCover}>
						<Text
							level={23}
							style={clickTextStyle}>
							{formatMessage(i18n.addDeviceAnotherBrand)}
						</Text>
						<Image source={{uri: 'right_arrow_key'}} style={imageStyle}/>
					</View>
				</TouchableOpacity>
				}
				<Text
					level={23}
					style={labelTextStyle}>
					{`${this.deviceBrand}:`}
				</Text>
				<View style={shortCutDevicesCover}>
					{telldusDevices}
				</View>
			</View>
		</ScrollView>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorFive,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = deviceWidth * 0.036;
	const imgW = deviceWidth * 0.035;
	const imgH = deviceWidth * fontSizeFactorFive;

	return {
		padding,
		shortCutItemsCover: {
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
		},
		clickTextStyle: {
			flex: 1,
			fontSize,
			textAlign: 'center',
			flexWrap: 'wrap',
			marginLeft: padding,
		},
		imageStyle: {
			height: imgH,
			width: imgW,
			tintColor: '#A59F9A90',
			marginHorizontal: padding,
		},
		shortCutDevicesCover: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
			marginLeft: padding / 2,
		},
		shortCutInfoCover: {
			marginLeft: padding,
			width: width - (padding * 2),
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			...shadow,
			paddingVertical: padding,
			borderRadius: 2,
		},
		labelTextStyle: {
			marginBottom: padding / 2,
			fontSize: fontSize * 1.4,
			marginTop: padding,
			marginLeft: padding,
		},
	};
}

}

export default (SelectModel433: Object);

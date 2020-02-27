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

import React, { useEffect, useState } from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	TextField,
} from 'react-native-material-textfield';
import { useSelector, useDispatch } from 'react-redux';

import {
	View,
	FloatingButton,
	IconTelldus,
} from '../../../../BaseComponents';
import {
	DeviceSettings,
} from '../Common';

import {
	setWidgetParamsValue,
} from '../../../Actions/AddDevice';

import {
	getDeviceSettings,
	prepare433MHzDeviceDefaultValueForParams,
} from '../../../Lib';
import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const SetDeviceName433 = (props: Object): Object => {

	const {
		onDidMount,
		intl,
		appLayout,
		navigation,
	} = props;
	const { formatMessage } = intl;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const [name, setName] = useState('');
	const [settings, setSettings] = useState(null);

	const { addDevice433 = {} } = useSelector((state: Object): Object => state.addDevice);
	const { widgetParams433Device = {} } = addDevice433;

	const deviceInfo = navigation.getParam('deviceInfo', {});
	const { widget, configuration, devicetype } = deviceInfo;

	const dispatch = useDispatch();

	useEffect(() => {
		onDidMount(formatMessage(i18n.name), formatMessage(i18n.AddZDNameHeaderTwo));

		if (widget) {
			const dSettings = getDeviceSettings(parseInt(widget, 10), formatMessage);
			if (configuration === 'true') {
				setSettings(dSettings);
			}

			// For devices that does not support configuration, params configuration options
			// are not shown, so simply set default/initial values for parameters in store.
			// It will be used while calling API addDevice.
			const paramsWithDefValues = prepare433MHzDeviceDefaultValueForParams(parseInt(widget, 10), dSettings);
			dispatch(setWidgetParamsValue({
				id: widget,
				...paramsWithDefValues,
			}));
		}
	}, [widget]);

	function onChangeName(value: string) {
		setName(value);
	}

	function submitName() {
		if (!name || !name.trim()) {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.errorNameFieldEmpty),
				showPositive: true,
			});
			return;
		}
		const prevParams = navigation.state.params || {};
		navigation.navigate({
			routeName: 'Include433',
			key: 'Include433',
			params: {
				...prevParams,
				deviceName: name,
				widgetParams433Device,
			},
		});
	}

	const {
		brandSecondary,
		coverStyle,
		textFieldStyle,
		textFieldCoverStyle,
		labelStyle,
		accessoryiconStyle,
	} = getStyles(appLayout);

	function renderLeftAccessory(): Object {
		return <IconTelldus icon={'device-alt'} style={accessoryiconStyle}/>;
	}

	return (
		<ScrollView
			style={{
				flex: 1,
			}}
			contentContainerStyle={{
				flexGrow: 1,
			}}
			keyboardShouldPersistTaps={'always'}>
			<View style={coverStyle}>
				<TextField
					value={name}
					label={formatMessage(i18n.name)}
					labelTextStyle={labelStyle}
					baseColor={brandSecondary}
					tintColor={brandSecondary}
					style={textFieldStyle}
					containerStyle={textFieldCoverStyle}
					onChangeText={onChangeName}
					onSubmitEditing={submitName}
					autoCorrect={false}
					autoFocus={true}
					returnKeyType={'done'}
					autoCapitalize={'sentences'}
					renderLeftAccessory={renderLeftAccessory}
				/>
				{!!settings && <DeviceSettings
					settings={settings}
					devicetype={devicetype}/>}
			</View>
			<FloatingButton
				onPress={submitName}
				imageSource={{uri: 'right_arrow_key'}}
			/>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);

	const blockWidth = Math.floor(width - (padding * 2));

	return {
		brandSecondary,
		coverStyle: {
			flex: 1,
		},
		textFieldCoverStyle: {
			width: blockWidth,
			marginTop: padding,
			backgroundColor: '#fff',
			...shadow,
			marginHorizontal: padding,
			padding,
		},
		textFieldStyle: {
			fontSize: fontSize * 1.3,
			color: '#A59F9A',
		},
		labelStyle: {
			fontSize: fontSize,
			color: brandSecondary,
		},
		iconStyle: {
			color: '#fff',
		},
		accessoryiconStyle: {
			marginRight: 5,
			marginBottom: 4,
			fontSize: fontSize * 1.2,
			color: brandSecondary,
		},
	};
};

export default React.memo<Object>(SetDeviceName433);

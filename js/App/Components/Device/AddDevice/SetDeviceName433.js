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

import React, { useEffect, useState, useCallback } from 'react';
import {
	ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
	View,
	FloatingButton,
	IconTelldus,
	MaterialTextInput,
} from '../../../../BaseComponents';
import {
	DeviceSettings,
} from '../Common';
import {
	withTheme,
} from '../../HOC/withTheme';

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
		route,
		colors,
	} = props;
	const { formatMessage } = intl;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const [name, setName] = useState('');
	const [settings, setSettings] = useState(null);

	const { addDevice433 = {} } = useSelector((state: Object): Object => state.addDevice);
	const { widgetParams433Device = {} } = addDevice433;

	const {
		deviceInfo = {},
	} = route.params || {};
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [widget, configuration]);

	const onChangeName = useCallback((text: string): Function => {
		setName(text);
	}, []);

	const submitName = useCallback((): Function => {
		(() => {
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
			const prevParams = route.params || {};
			navigation.navigate('Include433', {
				...prevParams,
				deviceName: name,
				widgetParams433Device,
			});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, widgetParams433Device]);

	const {
		baseColorFour,
		coverStyle,
		textFieldStyle,
		textFieldCoverStyle,
		labelStyle,
		accessoryiconStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	const renderLeftAccessory = useCallback((): Function => {
		return ((): Object => {
			return <IconTelldus icon={'device-alt'} style={accessoryiconStyle}/>;
		})();
	}, [accessoryiconStyle]);

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
				<MaterialTextInput
					value={name}
					label={formatMessage(i18n.name)}
					baseColor={baseColorFour}
					tintColor={baseColorFour}
					textColor={textFieldStyle.color}
					fontSize={textFieldStyle.fontSize}
					labelFontSize={labelStyle.fontSize}
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

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		card,
		baseColorFour,
	} = colors;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	const blockWidth = Math.floor(width - (padding * 2));

	return {
		baseColorFour,
		coverStyle: {
			flex: 1,
		},
		textFieldCoverStyle: {
			width: blockWidth,
			marginTop: padding,
			backgroundColor: card,
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
			color: baseColorFour,
		},
		iconStyle: {
			color: '#fff',
		},
		accessoryiconStyle: {
			marginRight: 5,
			marginBottom: 4,
			fontSize: fontSize * 1.2,
			color: baseColorFour,
		},
	};
};

export default (React.memo<Object>(withTheme(SetDeviceName433)): Object);

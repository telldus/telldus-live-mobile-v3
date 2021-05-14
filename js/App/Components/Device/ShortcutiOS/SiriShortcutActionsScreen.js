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
import React, {
	memo,
	useCallback,
	useEffect,
	useState,
	useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
	ScrollView,
	Image,
} from 'react-native';
let uuid = require('react-native-uuid');
import { useIntl } from 'react-intl';
import {
	NativeModules,
} from 'react-native';
const {
	WidgetModule,
} = NativeModules;
const colorsys = require('colorsys');

import {
	View,
	NavigationHeaderPoster,
	Text,
	TouchableOpacity,
	ThemedRefreshControl,
	TouchableButton,
} from '../../../../BaseComponents';
import DeviceActionDetails from '../DeviceDetails/SubViews/DeviceActionDetails';
import { getLastUpdated, getThermostatValue } from '../../../Lib/SensorUtils';

import Theme from '../../../Theme';
import {
	methods,
} from '../../../../Constants';

import i18n from '../../../Translations/common';


type Props = {
    navigation: Object,
	screenProps: Object,
	route: Object,
};

const preparePhrase = (method: string, name: string): string => {
	switch (method) {
		case '1':
			return i18n.turnOnDName;
		case '2':
			return i18n.turnOffDName;
		case '4':
			return i18n.ringDName;
		case '8':
			return i18n.toggleDName;
		case '16':
			return i18n.dimDName;
		case '64':
			return i18n.executeDName;
		case '128':
			return i18n.sendUpToDName;
		case '256':
			return i18n.sendDownToDName;
		case '512':
			return i18n.sendStopToDName;
		case '1024':
			return i18n.changeColorOnDName;
		case '2048':
			return i18n.controlThermostatOnDName;
		default:
			return i18n.controlDName;
	}
};

const SiriShortcutActionsScreen = memo<Object>((props: Props): Object => {
	const {
		navigation,
		screenProps,
		route = {},
	} = props;
	const {
		params = {},
	} = route;
	const {
		device,
	} = params;
	const {
		name,
		id,
		clientDeviceId,
		clientId,
	} = device || {};
	const [deviceInstate, setDeviceInstate] = useState(device);
	const [selections, setSelections] = useState({});
	const { layout } = useSelector((state: Object): Object => state.app);
	const { byId } = useSelector((state: Object): Object => state.sensors);
	const { byId: gById } = useSelector((state: Object): Object => state.gateways);
	const {
		container,
		contentContainerStyle,
		buttonStyle,
		rowCoverStyle,
		rowTextStyle,
		rowRightTextStyle,
		rowRightBlockStyle,
		actionDetailsStyle,
		subTitleStyle,
		siriIconStyle,
		coverStyle,
	} = getStyles({
		layout,
	});

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const [ shortcuts, setShortcuts ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(false);

	const _getShortcuts = useCallback(() => {
		setIsLoading(true);
		WidgetModule.getShortcuts((response: Object) => {
			const {
				shortcuts: _shortcuts,
			} = response;
			if (_shortcuts && _shortcuts.length > 0) {
				const _s = _shortcuts.filter((_shortcut: Object): Object => {
					const {
						userInfo = {},
					} = _shortcut;
					return parseInt(id, 10) === parseInt(userInfo.deviceId, 10);
				});
				setShortcuts(_s);
			}

			setIsLoading(false);
		});
	}, [id]);

	useEffect(() => {
		_getShortcuts();
	}, [_getShortcuts]);

	const onPressAddToSiri = useCallback(() => {
		const _uuid = uuid.v1();
		const {
			method = '',
			stateValues = {},
		} = selections;
		const _method = method.toString();
		const stateValue = stateValues[_method];
		WidgetModule.presentShortcut({
			phrase: formatMessage(preparePhrase(_method, name), {name}),
			deviceId: id.toString(),
			method: _method,
			dimValue: _method === '16' ? stateValue : null,
			rgbValue: _method === '1024' ? stateValues : null,
			thermostatValue: _method === '2048' ? stateValues : null,
			uuid: _uuid,
		},
		(callbackData: Object) => {
			_getShortcuts();
		}
		);
	}, [_getShortcuts, formatMessage, id, name, selections]);

	const onPressEdit = useCallback((data: Object) => {
		WidgetModule.presentShortcut(data,
			(callbackData: Object) => {
				_getShortcuts();
			}
		);
	}, [_getShortcuts]);

	const lastUpdated = getLastUpdated(byId, clientDeviceId, clientId);
	const currentTemp = getThermostatValue(byId, clientDeviceId, clientId);
	const gateway = gById[clientId];
	const {
		timezone: gatewayTimezone,
	} = gateway ? gateway : {};

	const deviceSetStateThermostat = useCallback((deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => {
		const sel: Object = {
			method: parseInt(requestedState, 10) === 2 ? requestedState : '2048',
			stateValues: {
				mode,
				temperature,
				scale,
				changeMode,
			},
		};
		setSelections(sel);
	}, []);

	const onPressOverride = useCallback(({
		method,
		stateValues = {},
	}: Object) => {
		const {
			stateValues: stateValuesP = {},
		} = deviceInstate;
		let newStateValues = {};
		Object.keys(stateValues).forEach((m: string): Object => {
			newStateValues = {
				...newStateValues,
				[methods[m]]: stateValues[m],
			};
		}
		);
		setDeviceInstate({
			...deviceInstate,
			isInState: methods[method],
			stateValues: {
				...stateValuesP,
				...newStateValues,
			},
		});
		setSelections({
			method,
			stateValues,
		});
	}, [deviceInstate]);
	const deviceSetStateRGBOverride = useCallback((deviceId: number, value: string) => {
		const rgb = colorsys.hexToRgb(value);
		const { r, g, b } = rgb;
		const sel: Object = {
			method: '1024',
			stateValues: {
				r, g, b,
			},
		};
		setSelections(sel);
	}, []);

	const Shortcuts = useMemo((): Object => {
		return shortcuts.map((s: Object): Object => {
			const {
				userInfo = {},
				invocationPhrase,
				identifier,
			} = s;
			return (
				<View
					style={rowCoverStyle}
					level={2}
					key={identifier}>
					<View>
						<Text
							style={rowTextStyle}
							level={3}
							numberOfLines={1}>
							{userInfo.phrase}
						</Text>
						<Text
							style={rowTextStyle}
							level={4}
							numberOfLines={1}>
							{invocationPhrase}
						</Text>
					</View>
					<TouchableOpacity
						style={rowRightBlockStyle}
						onPress={onPressEdit}
						onPressData={{
							invocationPhrase,
							identifier,
							...userInfo,
						}}>
						<Text
							style={rowRightTextStyle}
							level={23}>
							{formatMessage(i18n.edit)}
						</Text>
					</TouchableOpacity>
				</View>
			);
		});
	}, [formatMessage, onPressEdit, rowCoverStyle, rowRightBlockStyle, rowRightTextStyle, rowTextStyle, shortcuts]);

	const showAdd = !!selections.stateValues;

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={formatMessage(i18n.siriShortcuts)}
				h2={formatMessage(i18n.addDeleteShortcuts)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={contentContainerStyle}
				refreshControl={
					<ThemedRefreshControl
						enabled={isLoading}
						refreshing={isLoading}
						onRefresh={_getShortcuts}
					/>
				}>
				{(!!Shortcuts && Shortcuts.length > 0) && (
					<>
						<Text
							style={subTitleStyle}
							level={4}>
							{formatMessage(i18n.existingShortcuts)}
						</Text>
						{Shortcuts}
					</>
				)}
				<Text
					style={subTitleStyle}
					level={4}>
					{formatMessage(i18n.addNewShortcut)}
				</Text>
				<DeviceActionDetails
					device={deviceInstate}
					intl={intl}
					appLayout={layout}
					isGatewayActive={true}
					containerStyle={actionDetailsStyle}
					lastUpdated={lastUpdated}
					onPressOverride={onPressOverride}
					deviceSetStateThermostat={deviceSetStateThermostat}
					deviceSetStateRGBOverride={deviceSetStateRGBOverride}
					currentTemp={currentTemp}
					gatewayTimezone={gatewayTimezone}/>
				{showAdd && (
					<TouchableButton
						text={formatMessage(i18n.addToSiri)}
						onPress={onPressAddToSiri}
						style={buttonStyle}
						coverStyle={coverStyle}
						preformatted
						preScript={<Image
							source={{uri: 'siri_icon'}}
							style={siriIconStyle}
						/>}/>
				)}
			</ScrollView>
		</View>
	);
});


const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorEight,
		fontSizeFactorFour,
		maxSizeTextButton,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	let max = maxSizeTextButton + 5;
	let iconSize = (deviceWidth * fontSizeFactorFour * 1.5);
	iconSize = iconSize > max ? max : iconSize;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			padding,
		},
		buttonStyle: {
			flex: 0,
			marginTop: padding,
			alignSelf: 'center',
			width: undefined,
			maxWidth: deviceWidth - (padding * 3),
		},
		rowCoverStyle: {
			...shadow,
			flexDirection: 'row',
			justifyContent: 'space-between',
			paddingHorizontal: padding * 2,
			paddingVertical: padding,
		},
		rowTextStyle: {
			fontSize,
			width: '75%',
		},
		rowRightBlockStyle: {
			width: '25%',
			alignSelf: 'center',
			justifyContent: 'center',
			alignItems: 'flex-end',
		},
		rowRightTextStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
		},
		actionDetailsStyle: {
			flex: 0,
			marginTop: 0,
		},
		subTitleStyle: {
			fontSize,
			marginVertical: padding,
		},
		siriIconStyle: {
			height: iconSize,
			width: iconSize,
			marginRight: 8,
		},
		coverStyle: {
			flex: 0,
		},
	};
};

export default (SiriShortcutActionsScreen: Object);

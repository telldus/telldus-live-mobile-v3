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
import AddToSiriButton, {
	SiriButtonStyles,
	supportsSiriButton,
} from 'react-native-siri-shortcut/AddToSiriButton';
import { useSelector } from 'react-redux';
import {
	ScrollView,
} from 'react-native';
let uuid = require('react-native-uuid');
import { useIntl } from 'react-intl';
import {
	NativeModules,
} from 'react-native';
const {
	WidgetModule,
} = NativeModules;

import {
	View,
	NavigationHeaderPoster,
	Text,
	TouchableOpacity,
	ThemedRefreshControl,
} from '../../../../BaseComponents';
import DeviceActionDetails from '../DeviceDetails/SubViews/DeviceActionDetails';
import {
	useAppTheme,
} from '../../../Hooks/Theme';
import { getLastUpdated, getThermostatValue } from '../../../Lib/SensorUtils';

import Theme from '../../../Theme';
import {
	methods,
} from '../../../../Constants';

type Props = {
    navigation: Object,
	screenProps: Object,
	route: Object,
};

const preparePhrase = (method: string, name: string): string => {
	switch (method) {
		case '1':
			return `Turn on ${name}`;
		case '2':
			return `Turn off ${name}`;
		case '4':
			return `Ring ${name}`;
		case '8':
			return `Toggle ${name}`;
		case '16':
			return `Dim ${name}`;
		case '32':
			return `Learn ${name}`;
		case '64':
			return `Execute ${name}`;
		case '128':
			return `Turn up ${name}`;
		case '256':
			return `Turn down ${name}`;
		case '512':
			return `Stop ${name}`;
		case '1024':
			return `Set rgb value on ${name}`;
		case '2048':
			return `Control thermostat ${name}`;
		default:
			return `Control ${name}`;
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
	const [selectionsRGB, setSelectionsSelectionsRGB] = useState({});
	const [selectionsThermostat, setSelectionsSelectionsThermostat] = useState({});
	const {
		dark,
	} = useAppTheme();
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
	} = getStyles({
		layout,
	});

	const intl = useIntl();

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
		const {
			value,
		} = selectionsRGB;
		const {
			mode,
			temperature,
			scale,
			changeMode,
			requestedState,
		} = selectionsThermostat;
		const _method = method.toString();
		const dimValue = stateValues[methods[16]];
		const rgbValue = value;
		WidgetModule.presentShortcut({
			phrase: preparePhrase(_method, name),
			deviceId: id.toString(),
			method: _method,
			dimValue: (dimValue && _method === '16') ? dimValue : null,
			rgbValue,
			thermostatValue: {
				mode,
				temperature,
				scale,
				changeMode,
				requestedState,
			},
			uuid: _uuid,
		},
		(callbackData: Object) => {
			_getShortcuts();
		}
		);
	}, [_getShortcuts, id, name, selections, selectionsRGB, selectionsThermostat]);

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
		setSelectionsSelectionsThermostat({
			deviceId,
			mode,
			temperature,
			scale,
			changeMode,
			requestedState,
		});
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
		setSelectionsSelectionsRGB({
			deviceId,
			value,
		});
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
						edit
						</Text>
					</TouchableOpacity>
				</View>
			);
		});
	}, [onPressEdit, rowCoverStyle, rowRightBlockStyle, rowRightTextStyle, rowTextStyle, shortcuts]);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeaderPoster
				h1={'Siri shortcuts'} // TODO: Translate
				h2={'Add or delete shortcuts'}
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
					Existing shortcuts
						</Text>
						{Shortcuts}
					</>
				)}
				{supportsSiriButton && (
					<>
						<Text
							style={subTitleStyle}
							level={4}>
							Add new shortcut
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
						<AddToSiriButton
							style={buttonStyle}
							buttonStyle={dark ? SiriButtonStyles.white : SiriButtonStyles.black}
							onPress={onPressAddToSiri}/>
					</>
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
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			padding,
		},
		buttonStyle: {
			marginTop: padding,
			alignSelf: 'center',
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
			width: '85%',
		},
		rowRightBlockStyle: {
			width: '15%',
			alignSelf: 'center',
			justifyContent: 'center',
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
	};
};

export default SiriShortcutActionsScreen;

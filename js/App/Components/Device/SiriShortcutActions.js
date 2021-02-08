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
import {
	getShortcuts,
	presentShortcut,
} from 'react-native-siri-shortcut';
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
	View,
	NavigationHeaderPoster,
	Text,
	TouchableOpacity,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import DeviceActionDetails from './DeviceDetails/SubViews/DeviceActionDetails';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import {
	IOS_SHORTCUT_DEVICE_ACTION_ACTIVITY_TYPE,
} from '../../../Constants';
import { getLastUpdated, getThermostatValue } from '../../Lib/SensorUtils';

import Theme from '../../Theme';

type Props = {
    navigation: Object,
	screenProps: Object,
	route: Object,
};

const SiriShortcutActions = memo<Object>((props: Props): Object => {
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
		getShortcuts()
			.then((_shortcuts: Array<Object>) => {
				const _s = _shortcuts.filter((_shortcut: Object): Object => {
					const {
						userInfo = {},
					} = _shortcut.options;
					return id === userInfo.deviceId;
				});
				setIsLoading(false);
				setShortcuts(_s);
			});
	}, [id]);

	useEffect(() => {
		_getShortcuts();
	}, [_getShortcuts]);

	const onPressAddToSiri = useCallback(() => {
		const _uuid = uuid.v1();
		presentShortcut(
			({
				activityType: `${IOS_SHORTCUT_DEVICE_ACTION_ACTIVITY_TYPE}-${id}-${_uuid}`,
				title: `Peform action on ${name}`,
				userInfo: {
					deviceId: id,
					uuid: _uuid,
				},
			}),
			(callbackData: Object) => {
				_getShortcuts();
			}
		);
	}, [_getShortcuts, id, name]);

	const onPressEdit = useCallback(({
		options,
	}: Object) => {
		const {
			activityType,
			title,
		} = options;
		presentShortcut(
			({
				activityType,
				title,
			}),
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
		console.log('TEST deviceSetStateThermostat deviceId, mode, temperature, scale, changeMode, requestedState', deviceId, mode, temperature, scale, changeMode, requestedState);
	}, []);


	const onPressOverride = useCallback(({
		method,
		stateValues,
	}: Object) => {
		console.log('TEST method, stateValues', method, stateValues);
	}, []);

	const deviceSetStateRGBOverride = useCallback((dId: number, value: string) => {
		console.log('TEST deviceSetStateRGBOverride', dId, value);
	}, []);

	const Shortcuts = useMemo((): Object => {
		return shortcuts.map((s: Object): Object => {
			const {
				options = {},
				phrase,
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
							{options.title}
						</Text>
						<Text
							style={rowTextStyle}
							level={4}
							numberOfLines={1}>
							{phrase}
						</Text>
					</View>
					<TouchableOpacity
						style={rowRightBlockStyle}
						onPress={onPressEdit}
						onPressData={{
							options,
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
							device={device}
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

export default SiriShortcutActions;

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
	useState,
	useMemo,
	useEffect,
	useRef,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	Platform,
} from 'react-native';
import {
	CommonActions,
} from '@react-navigation/native';

import {
	View,
	Text,
	DropDown,
	TouchableButton,
	ProgressBarLinear,
} from '../../../../BaseComponents';

import {
	capitalize,
} from '../../../Lib';
import {
	copyDevicesAndSchedules,
} from '../../../Actions/Gateways';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const CopyDevicesAndSchedules = memo<Object>((props: Object): Object => {

	const {
		intl,
		appLayout,
		navigation,
		route,
		onDidMount,
	} = props;
	const {
		formatMessage,
	} = intl;

	const clearTimersRef = useRef({});

	const clearAll = useCallback(() => {
		if (typeof clearTimersRef.current === 'function') {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			clearTimersRef.current();
		}
	}, []);

	useEffect((): Function => {
		onDidMount('Copy Devices And Schedules', 'Select gateway');
		return () => {
			clearAll();
		};
	}, [onDidMount, clearAll]);

	const [ copyConfig, setCopyConfig ] = useState({
		isCopying: false,
		progress: 0,
	});
	const {
		isCopying,
		progress,
	} = copyConfig;

	const { clientInfo } = route.params || {};

	const { byId } = useSelector((state: Object): Object => state.gateways);

	const keys = Object.keys(byId) || [''];
	const item = byId[keys[0]] || {};
	const initalValue = {
		key: item.id,
		value: item.name,
	};
	const [ keyValueDD, setKeyValueDD ] = useState(initalValue);
	const {
		value: valueDD,
		key: keyDD,
	} = keyValueDD;

	const dispatch = useDispatch();

	const LIST = useMemo((): Array<Object> => {
		return Object.keys(byId).map((gId: string): Object => {
			const { id, name } = byId[gId];
			return {
				key: id,
				value: name,
			};
		});
	}, [byId]);

	const onChoosegateway = useCallback((val: string, itemIndex: number, data: Array<any>) => {
		const {
			key,
			value,
		} = data[itemIndex];
		setKeyValueDD({
			key,
			value,
		});
	}, []);

	const navigateCommon = useCallback(() => {
		clearAll();
		let routes = [{ name: 'Tabs' }];
		if (Platform.OS === 'ios') {
			routes = [
				{
					name: 'Tabs',
					state: {
						index: 4,
						routes: [
							{
								name: 'MoreOptionsTab',
							},
						],
					},
				},
				{
					name: 'Gateways',
				},
			];
		}
		routes = [
			...routes,
			{
				name: 'InfoScreen',
				params: {
					info: 'add_device',
					clientId: clientInfo.clientId,
				},
			},
		];
		const resetAction = CommonActions.reset({
			index: 1,
			routes,
		});
		navigation.dispatch(resetAction);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [route.params]);

	const onPressCancel = useCallback(() => {
		navigateCommon();
	}, [navigateCommon]);

	const callback = useCallback((stage: string, data: Object) => {
		const {
			devicesToCopy,
			groupsToCopy,
			schedulesToCopy,
			devicesCopiedCount = 0,
			groupsCopiedCount = 0,
			schedulesCopiedCount = 0,
		} = data;
		const total = devicesToCopy.length + groupsToCopy.length + schedulesToCopy.length;
		const totalCopied = devicesCopiedCount + groupsCopiedCount + schedulesCopiedCount;

		const _progress = (totalCopied / total) * 100;
		const _isCopying = totalCopied === total ? false : true;

		setCopyConfig({
			...copyConfig,
			progress: _progress,
			isCopying: _isCopying,
		});

		if (totalCopied === total) {
			navigateCommon();
		}

	}, [copyConfig, navigateCommon]);

	const onPressCopy = useCallback(() => {
		setCopyConfig({
			...copyConfig,
			isCopying: true,
		});
		clearTimersRef.current = dispatch(copyDevicesAndSchedules(keyDD, clientInfo.clientId, callback));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callback, clientInfo.clientId, keyDD, copyConfig]);

	const {
		label,
		dropDownContainerStyle,
		pickerContainerStyle,
		rowTextColor,
		fontSizeText,
		pickerBaseCoverStyle,
		button,
		blockCover,
		dropDownInfoCover,
		pickerBaseTextStyle,
		progressWidth,
		progressBarStyle,
		progressText,
	} = getStyles({
		appLayout,
	});

	return (
		<View style={{flex: 1}}>
			<View
				level={2}
				style={blockCover}>
				<View
					style={dropDownInfoCover}>
					<Text
						level={3}
						style={label}>
						{`${capitalize(formatMessage(i18n.gateway))}`}
					</Text>
					<DropDown
						items={LIST}
						value={valueDD}
						onValueChange={onChoosegateway}
						appLayout={appLayout}
						intl={intl}
						dropDownContainerStyle={dropDownContainerStyle}
						pickerContainerStyle={pickerContainerStyle}
						baseColor={rowTextColor}
						fontSize={fontSizeText}
						accessibilityLabelPrefix={formatMessage(i18n.gateway)}
						textColor={rowTextColor}
						pickerBaseTextStyle={pickerBaseTextStyle}
						pickerBaseCoverStyle={pickerBaseCoverStyle}
						disabled={isCopying}/>
				</View>
				{isCopying && (
					<>
						<Text
							level={15}
							style={progressText}>
							{`Copying... (${progress}% ${formatMessage(i18n.done).toLowerCase()})`}
						</Text>
						<ProgressBarLinear
							progress={Math.max(progress / 100, 0)}
							height={4}
							width={progressWidth}
							borderWidth={0}
							borderColor="transparent"
							unfilledColor={Theme.Core.inactiveSwitchBackground}
							style={progressBarStyle}/>
					</>
				)
				}
			</View>
			<TouchableButton
				text={isCopying ? 'COPYING...' : 'COPY'}
				onPress={onPressCopy}
				disabled={isCopying}
				showThrobber={isCopying}
			/>
			<TouchableButton
				text={formatMessage(i18n.defaultNegativeText)}
				onPress={onPressCancel}
				style={button}
				disabled={isCopying}
			/>
		</View>
	);
});

const getStyles = ({
	appLayout,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary, rowTextColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.045;
	const fontSizeLabel = deviceWidth * 0.038;

	return {
		brandSecondary,
		rowTextColor,
		progressWidth: width - (padding * 4),
		blockCover: {
			...shadow,
			marginTop: padding,
			marginBottom: padding * 2,
			flex: 0,
			justifyContent: 'center',
			padding,
		},
		dropDownInfoCover: {
			flex: 0,
			flexDirection: 'row',
			alignItems: 'center',
		},
		progressBarStyle: {
			marginBottom: padding,
		},
		progressText: {
			fontSize: fontSizeLabel * 0.9,
			marginTop: padding,
			marginBottom: padding,
		},
		label: {
			fontSize: fontSizeLabel,
		},
		button: {
			marginVertical: padding * 1.5,
		},
		dropDownContainerStyle: {
			flex: 1,
			marginTop: 8,
			marginBottom: fontSizeText / 2,
		},
		pickerBaseCoverStyle: {
			padding: 0,
		},
		pickerBaseTextStyle: {
			textAlign: 'right',
		},
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
			backgroundColor: 'transparent',
		},
		fontSizeText,
	};
};

export default CopyDevicesAndSchedules;

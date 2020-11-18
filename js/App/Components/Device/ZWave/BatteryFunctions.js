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

import React, {
	memo,
	useMemo,
	useState,
	useCallback,
	useRef,
	useEffect,
} from 'react';
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import Slider from 'react-native-slider';
const isEqual = require('react-fast-compare');

import {
	View,
	Text,
	EmptyView,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';
import BatteryInfoItem from './BatteryInfoItem';

import {
	useRelativeIntl,
} from '../../../Hooks/App';
import {
	useAppTheme,
} from '../../../Hooks/Theme';
import {
	getDeviceManufacturerInfo,
	sendSocketMessage,
} from '../../../Actions';
import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import * as LayoutAnimations from '../../../Lib/LayoutAnimations';

import Theme from '../../../Theme';

type Props = {
	id: string,
	gatewayTimezone: string,
	clientId: string,
};

function usePreviousNodeInfo(value: Object): Object {
	const ref = useRef();

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}

function usePreviousBatteryInfo(value: Object): Object {
	const ref = useRef();

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}

const BatteryFunctions = (props: Props): Object => {
	const {
		id,
		gatewayTimezone,
		clientId,
	} = props;

	const {
		formatDate,
		formatTime,
	} = useRelativeIntl(gatewayTimezone);

	const [ expand, setExpand ] = useState(true);

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		nodeInfo,
	} = useSelector((state: Object): Object => state.devices.byId[id]) || {};

	const {
		colors,
	} = useAppTheme();

	const dispatch = useDispatch();

	const {
		titleCoverStyle,
		coverStyle,
		textStyle,
		titleStyle,
		iconStyle,
		iconSize,
		slider,
		minimumTrackTintColor,
	} = getStyles({
		layout,
		colors,
	});

	const [ zWaveFunctions, setZWaveFunctions ] = useState();

	const manufacturerAttributes = nodeInfo ? nodeInfo.cmdClasses[ZWaveFunctions.COMMAND_CLASS_MANUFACTURER_SPECIFIC] : {};
	const prevNodeInfo = usePreviousNodeInfo(nodeInfo);
	const isNodeInfoEqual = isEqual(prevNodeInfo, nodeInfo);
	const ManufacturerInfo = useCallback(async (): Object => {
		const {
			manufacturerId,
			productId,
			productTypeId,
		} = manufacturerAttributes;
		let _manufacturerInfo = {};
		if (typeof manufacturerAttributes.manufacturerId !== 'undefined') {
			try {
				_manufacturerInfo = await dispatch(getDeviceManufacturerInfo(manufacturerId, productTypeId, productId));
			} catch (e) {
				_manufacturerInfo = {};
			}
		}
		return _manufacturerInfo;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNodeInfoEqual]);

	useEffect(() => {
		const getManufacturerInfo = async () => {
			const manufacturerInfo = await ManufacturerInfo();
			setZWaveFunctions(new ZWaveFunctions(nodeInfo, {
				manufacturerInfo,
			}));
		};
		if (!isNodeInfoEqual) {
			getManufacturerInfo();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNodeInfoEqual]);

	const supportsWakeup = zWaveFunctions ? zWaveFunctions.supportsCommandClass(ZWaveFunctions.COMMAND_CLASS_WAKEUP) : false;
	const showBatteryInfo = zWaveFunctions ? (zWaveFunctions.supportsCommandClass(ZWaveFunctions.COMMAND_CLASS_BATTERY) ||
    supportsWakeup) : false;

	const {
		wakeupNote,
		lastWakeup,
		wakeupInterval,
		batteryType,
		batteryCount,
		level,
		maximumWakeupInterval,
		minimumWakeupInterval,
		wakeupIntervalStep,
		queue,
	} = zWaveFunctions ? zWaveFunctions.batteryInfo() : {};

	let storedWakeupInterval = wakeupInterval;
	if (typeof queue === 'number') {
		storedWakeupInterval = queue;
	}

	const getWakeUpIntervalValue = useCallback((value: number): Object => {
		value = value < 0 ? 0 : value;
		let _wakeupInterval = (value * wakeupIntervalStep) + minimumWakeupInterval;
		let seconds = _wakeupInterval;
		let time = [];
		if (seconds >= 86400) {
			time.push(`${Math.floor(seconds / 86400)} days`);
			seconds %= 86400;
		}
		if (seconds >= 3600) {
			time.push(`${Math.floor(seconds / 3600)} h`);
			seconds %= 3600;
		}
		if (seconds >= 60) {
			time.push(`${Math.floor(seconds / 60)} min`);
			seconds %= 60;
		}
		if (seconds > 0) {
			time.push(`${seconds} s`);
		}
		return {
			timeValue: _wakeupInterval,
			timeString: time.join(', '),
		};
	}, [minimumWakeupInterval, wakeupIntervalStep]);

	let maximumValue = (maximumWakeupInterval - minimumWakeupInterval) / wakeupIntervalStep;
	let sliderValueInitial = (storedWakeupInterval - minimumWakeupInterval) / wakeupIntervalStep;
	const initialWakeUpIntervalValue = getWakeUpIntervalValue(sliderValueInitial);
	const [ wakeUpIntervalValue, setWakeUpIntervalValue ] = useState(initialWakeUpIntervalValue);
	const [ sliderValue, setSliderValue ] = useState(sliderValueInitial);

	const onValueChange = useCallback((value: number) => {
		setWakeUpIntervalValue(getWakeUpIntervalValue(value));
	}, [getWakeUpIntervalValue]);

	const nodeId = nodeInfo ? nodeInfo.nodeId : '';
	const onSlidingComplete = useCallback((value: number) => {
		dispatch(sendSocketMessage(clientId, 'client', 'forward', {
			'module': 'zwave',
			'action': 'cmdClass',
			'nodeId': nodeId,
			'class': ZWaveFunctions.COMMAND_CLASS_WAKEUP,
			'cmd': 'setWakeupInterval',
			'data': wakeUpIntervalValue.timeValue,
		}));
	}, [clientId, dispatch, nodeId, wakeUpIntervalValue.timeValue]);

	const bInfoToListenFor = {
		wakeupInterval,
		queue,
		minimumWakeupInterval,
		wakeupIntervalStep,
	};
	const prevBatteryInfo = usePreviousBatteryInfo(bInfoToListenFor);
	const isBatteryInfoEqual = isEqual(prevBatteryInfo, bInfoToListenFor);
	useEffect(() => {
		if (!isBatteryInfoEqual) {
			setWakeUpIntervalValue(initialWakeUpIntervalValue);
			setSliderValue(sliderValueInitial);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isBatteryInfoEqual]);

	const lastWakeupDateTime = new Date(lastWakeup * 1000);
	const nextWakeupDateTime = new Date((lastWakeup + wakeupInterval) * 1000);

	const body = useMemo((): ?Object => {

		if (!id) {
			return;
		}

		// TODO: Translate
		return (
			<View
				level={2}
				style={coverStyle}>
				{supportsWakeup && (
					<Text
						level={4}
						style={textStyle}>
This device is running on battery. To save as much power as possible this device sleeps and will not accept commands. Changes in its settings will only be set the next time it wakes up.
					</Text>
				)}
				{!!wakeupNote && (
					<BatteryInfoItem
						label={'Waking this device is done by: '}
						value={wakeupNote}/>
				)}
				{(lastWakeup > 0 && supportsWakeup) && (
					<BatteryInfoItem
						label={'This device was previously awake: '}
						value={`${formatDate(lastWakeupDateTime)} ${formatTime(lastWakeupDateTime)}`}/>
				)}
				{(wakeupInterval > 0 && lastWakeup > 0) && (
					<BatteryInfoItem
						label={'Next time this device will wake up will probably be: '}
						value={`${formatDate(nextWakeupDateTime)} ${formatTime(nextWakeupDateTime)}`}/>
				)}
				<BatteryInfoItem
					label={'Battery level: '}
					value={`${level}%`}/>
				{(!!batteryType && !!batteryCount) && (
					<BatteryInfoItem
						label={'Battery type: '}
						value={`${batteryCount} pcs of ${batteryType}`}/>
				)}
				{(!!batteryType && !batteryCount) && (
					<BatteryInfoItem
						label={'Battery type: '}
						value={batteryType}/>
				)}
				{supportsWakeup && (
					<>
						<BatteryInfoItem
							label={'Wakeup interval: '}
							value={wakeUpIntervalValue.timeString}/>
						<Slider
							minimumValue= {0}
							maximumValue={maximumValue}
							value={sliderValue}
							step={10}
							onValueChange={onValueChange}
							onSlidingComplete={onSlidingComplete}
							minimumTrackTintColor={minimumTrackTintColor}
							trackStyle={slider.track}
							thumbStyle={slider.thumb}/>
					</>
				)}
			</View>
		);
	}, [id, coverStyle, supportsWakeup, textStyle, wakeupNote, lastWakeup, formatDate, lastWakeupDateTime, formatTime, wakeupInterval, nextWakeupDateTime, level, batteryType, batteryCount, wakeUpIntervalValue, maximumValue, sliderValue, onValueChange, onSlidingComplete, minimumTrackTintColor, slider.track, slider.thumb]);

	const onPressToggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	if (!id || !nodeInfo || !showBatteryInfo) {
		return <EmptyView/>;
	}

	return (
		<>
			<TouchableOpacity
				style={titleCoverStyle}
				onPress={onPressToggle}>
				<ThemedMaterialIcon
					name={expand ? 'expand-more' : 'expand-less'}
					size={iconSize}
					style={iconStyle}
					level={23}/>
				<Text
					level={2}
					style={titleStyle}>
					Battery
				</Text>
			</TouchableOpacity>
			{!expand && body}
		</>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		paddingFactor,
		shadow,
	} = Theme.Core;
	const {
		inAppBrandSecondary,
	} = colors;

	const padding = deviceWidth * paddingFactor;
	const thumbSize = fontSize;

	return {
		padding,
		iconSize: deviceWidth * 0.06,
		titleCoverStyle: {
			flexDirection: 'row',
			marginLeft: padding,
			marginBottom: padding / 2,
			alignItems: 'center',
		},
		titleStyle: {
			marginLeft: 8,
			fontSize: deviceWidth * 0.04,
		},
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			...shadow,
		},
		textStyle: {
			fontSize,
			textAlign: 'center',
		},
		slider: {
			track: {
				borderRadius: 0,
				height: deviceWidth * 0.010666667,
			},
			thumb: {
				backgroundColor: inAppBrandSecondary,
				borderRadius: thumbSize / 2,
				height: thumbSize,
				width: thumbSize,
			},
		},
		minimumTrackTintColor: inAppBrandSecondary,
	};
};

export default memo<Object>(BatteryFunctions);

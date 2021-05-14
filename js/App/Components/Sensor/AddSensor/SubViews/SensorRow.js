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
	useMemo,
} from 'react';
import {
	TouchableOpacity,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	IconTelldus,
} from '../../../../../BaseComponents';
import LastUpdatedInfo from '../../../TabViews/SubViews/Sensor/LastUpdatedInfo';
import TypeBlockList from '../../../TabViews/SubViews/Sensor/TypeBlockList';
import GenericSensor from '../../../TabViews/SubViews/Sensor/GenericSensor';

import {
	checkIfLarge,
	getSensorInfo,
	getWindDirection,
} from '../../../../Lib';
import Theme from '../../../../Theme';

import i18n from '../../../../Translations/common';

const SensorRow = (props: Object): Object => {
	const {
		onSelectSensor,
		appLayout,
		item,
	} = props;

	const {
		sensorId,
		protocol,
		lastUpdated,
		data,
		id,
	} = item;

	const {
		formatMessage,
	} = useIntl();

	const {
		cover,
		blockOneStyle,
		textOneStyle,
		textTwoStyle,
		blockTwoStyle,
		dotCoverStyle,
		dotStyle,
		valueUnitCoverStyle,
		valueStyle,
		unitStyle,
		labelStyle,
		sensorValueCoverStyle,
		iconAndBlockStyle,
		iconStyle,
	} = getStyles(appLayout, data);

	function onPress() {
		onSelectSensor(item);
	}

	const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));
	const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

	const textOne = `${protocol}, ${formatMessage(i18n.labelId)}: ${sensorId}`;

	const { sensors } = useMemo((): Object => {
		function getSensors(): Object {
			let _sensors = {}, sensorAccessibilityInfo = '';

			for (let key in data) {
				const values = data[key];
				const { value, scale, name } = values;
				const isLarge = checkIfLarge(value.toString());

				const { label, unit, icon, sensorInfo, formatOptions } = getSensorInfo(name, scale, value, isLarge, formatMessage);

				let sharedProps = {
					key,
					name,
					value,
					unit,
					label,
					icon,
					isLarge,
					valueUnitCoverStyle,
					valueStyle,
					unitStyle,
					labelStyle,
					sensorValueCoverStyle,
					formatOptions,
				};
				sensorAccessibilityInfo = `${sensorAccessibilityInfo}, ${sensorInfo}`;

				if (name === 'wdir') {
					sharedProps = { ...sharedProps, value: getWindDirection(value, formatMessage) };
				}
				_sensors[key] = <GenericSensor {...sharedProps} />;
			}
			return { sensors: _sensors, sensorAccessibilityInfo };
		}
		return getSensors();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		data,
		appLayout,
	]);

	return (
		<TouchableOpacity onPress={onPress}>
			<View
				level={2}
				style={cover}>
				<View style={iconAndBlockStyle}>
					<IconTelldus
						level={26}
						icon={'sensor'}
						style={iconStyle}/>
					<View style={[blockOneStyle, {
						alignItems: 'flex-start',
					}]}>
						<Text
							level={25}
							style={textOneStyle}>
							{textOne.toUpperCase()}
						</Text>
						<LastUpdatedInfo
							value={-seconds}
							numeric="auto"
							updateIntervalInSeconds={60}
							timestamp={lastUpdated}
							level={minutesAgo < 1440 ? 25 : 8}
							textStyle={[
								textTwoStyle, {
									opacity: minutesAgo < 1440 ? 1 : 0.5,
								},
							]} />
					</View>
				</View>
				<TypeBlockList
					sensors={sensors}
					lastUpdated={lastUpdated}
					id={id}
					style={blockTwoStyle}
					valueCoverStyle={blockTwoStyle}
					dotCoverStyle={dotCoverStyle}
					dotStyle={dotStyle} />
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object, data: Object = {}): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		buttonWidth,
		rowHeight,
		maxSizeRowTextOne,
		fontSizeFactorTwelve,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const widthValueBlock = (buttonWidth * 2) + 6;

	const dotSize = rowHeight * 0.09;

	let nameFontSize = Math.floor(deviceWidth * fontSizeFactorTwelve);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	return {
		cover: {
			flexDirection: 'row',
			...shadow,
			marginHorizontal: padding,
			marginBottom: padding / 2,
			justifyContent: 'space-between',
			height: rowHeight,
		},
		iconAndBlockStyle: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			padding,
		},
		iconStyle: {
			fontSize: nameFontSize * 1.8,
		},
		blockOneStyle: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'flex-start',
			marginLeft: padding,
		},
		textOneStyle: {
			fontSize: nameFontSize,
		},
		textTwoStyle: {
			fontSize: nameFontSize * 0.9,
			marginTop: 4,
		},
		blockTwoStyle: {
			width: widthValueBlock,
			height: '100%',
			alignItems: 'flex-start',
			justifyContent: 'center',
		},
		dotCoverStyle: {
			position: 'absolute',
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			bottom: 5,
		},
		dotStyle: {
			width: dotSize,
			height: dotSize,
			borderRadius: dotSize / 2,
			marginLeft: 2 + (dotSize * 0.2),
		},
		valueUnitCoverStyle: {
			height: rowHeight * 0.39,
		},
		valueStyle: {
			fontSize: rowHeight * 0.33,
			height: rowHeight * 0.39,
		},
		unitStyle: {
			fontSize: rowHeight * 0.2,
		},
		labelStyle: {
			fontSize: rowHeight * 0.21,
			height: rowHeight * 0.3,
		},
		sensorValueCoverStyle: {
			marginBottom: Object.keys(data).length <= 1 ? 0 : rowHeight * 0.16,
		},
	};
};
export default (React.memo<Object>(SensorRow): Object);

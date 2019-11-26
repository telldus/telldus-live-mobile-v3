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
	TouchableOpacity,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
} from '../../../../../BaseComponents';
import LastUpdatedInfo from '../../../TabViews/SubViews/Sensor/LastUpdatedInfo';

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
	} = item;

	const {
		formatMessage,
	} = useIntl();

	const {
		cover,
		blockStyle,
		labelStyle,
		valueStyle,
	} = getStyles(appLayout);

	function onPress() {
		onSelectSensor(item);
	}

	const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));
	const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

	return (
		<TouchableOpacity onPress={onPress}>
			<View style={cover}>
				<View style={blockStyle}>
					<Text style={labelStyle}>
						{formatMessage(i18n.labelProtocol)}
					</Text>
					<Text style={valueStyle}>
						{protocol}
					</Text>
				</View>
				<View style={blockStyle}>
					<Text style={labelStyle}>
						{formatMessage(i18n.labelId)}
					</Text>
					<Text style={valueStyle}>
						{sensorId}
					</Text>
				</View>
				<View style={[blockStyle, {
					alignItems: 'flex-end',
				}]}>
					<Text style={labelStyle}>
						{formatMessage(i18n.labelLastUpdated)}
					</Text>
					<LastUpdatedInfo
						value={-seconds}
						numeric="auto"
						updateIntervalInSeconds={60}
						textStyle={[
							valueStyle, {
								color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
								opacity: minutesAgo < 1440 ? 1 : 0.5,
							},
						]} />
				</View>
			</View>
		</TouchableOpacity>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary, rowTextColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const blockWidth = Math.floor((width / 3) - (padding * 2));

	return {
		cover: {
			flexDirection: 'row',
			backgroundColor: '#fff',
			...shadow,
			marginHorizontal: padding,
			marginBottom: padding / 2,
			padding,
			justifyContent: 'space-between',
		},
		blockStyle: {
			width: blockWidth,
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		labelStyle: {
			color: brandSecondary,
			fontSize: Math.floor(deviceWidth * 0.045),
		},
		valueStyle: {
			color: rowTextColor,
			fontSize: Math.floor(deviceWidth * 0.045),
			marginTop: 5,
		},
	};
};
export default SensorRow;

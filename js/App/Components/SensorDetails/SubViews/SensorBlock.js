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

import React from 'react';
import {
	createIntl,
	createIntlCache,
} from 'react-intl';
import { useSelector } from 'react-redux';

import {
	View,
	Text,
	Icon,
	IconTelldus,
	FormattedNumber,
	FormattedDate,
	FormattedTime,
	FormattedMessage,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	name: string,
	icon: string,
	label: string,
	value: number,
	unit: string,
	max?: string,
	min?: string,
	maxTime?: number,
	minTime?: number,
	formatOptions: Object,
	lastUpdated: string,
	appLayout: Object,
	gatewayTimezone: string,
	gatewayTimezoneOffset: number,
};

const SensorBlock = (props: Props): Object => {

	const {
		name,
		icon,
		label,
		value,
		unit,
		formatOptions,
		lastUpdated,
		appLayout,
		max,
		min,
		maxTime,
		minTime,
		gatewayTimezone,
		// gatewayTimezoneOffset,
	} = props;

	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	let { language = {} } = defaultSettings;
	let locale = language.code;

	const cache = createIntlCache();
	const intl = createIntl({
		locale,
		timeZone: gatewayTimezone,
	}, cache);

	const {
		formatDate,
		formatTime,
	} = intl;

	const { brandSecondary } = Theme.Core;

	const {
		containerStyle,
		iconStyle,
		textContainer,
		labelStyle,
		valueStyle,
		updatedInfoStyle,
		iconSize: icSize,
	} = getStyles();

	console.log('TEST formatDate(lastUpdated)', formatDate(lastUpdated));
	console.log('TEST formatTime(lastUpdated)', formatTime(lastUpdated));

	return (
		<View style={containerStyle} accessible={true} importantForAccessibility={'yes'}>
			<IconTelldus icon={icon} style={iconStyle}/>
			<View style={textContainer}>
				<Text style={labelStyle}>
					{label}
				</Text>
				{name === 'wdir' ?
					<Text style={valueStyle}>
						{value}
					</Text>
					:
					<FormattedNumber
						value={value}
						{...formatOptions}
						style={valueStyle}
						suffix={unit}
						suffixStyle={valueStyle}/>
				}
				<Text style={updatedInfoStyle}>
					<Text value={lastUpdated} style={updatedInfoStyle}>
						{formatDate(lastUpdated)}
					</Text>
					<Text style={Theme.Styles.hiddenText}>
						{' '}
					</Text>
					<Text value={lastUpdated} style={updatedInfoStyle}>
						{formatTime(lastUpdated)}
					</Text>
				</Text>
				{!!max && (
					<Text style={updatedInfoStyle}>
						<Icon name={'angle-up'} color={brandSecondary} size={icSize}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedMessage {...i18n.labelMax} style={updatedInfoStyle}/>
						{`: ${max}${unit}, `}
						<FormattedDate value={maxTime} style={updatedInfoStyle}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedTime value={maxTime} style={updatedInfoStyle}/>
					</Text>
				)}
				{!!min && (
					<Text style={updatedInfoStyle}>
						<Icon name={'angle-down'} color={brandSecondary} size={icSize}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedMessage {...i18n.labelMin} style={updatedInfoStyle}/>
						{`: ${min}${unit}, `}
						<FormattedDate value={minTime} style={updatedInfoStyle}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedTime value={minTime} style={updatedInfoStyle}/>
					</Text>
				)}
			</View>
		</View>
	);

	function getStyles(): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor, shadow } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		const blockFullWidth = width - outerPadding;

		const iconSize = deviceWidth * 0.16;
		const labelFontSize = deviceWidth * 0.031;
		const valueFontSize = deviceWidth * 0.075;
		const updateInfoFontSize = deviceWidth * 0.027;

		return {
			containerStyle: {
				flexDirection: 'row',
				width: blockFullWidth,
				backgroundColor: '#fff',
				...shadow,
				marginBottom: padding / 2,
				marginHorizontal: padding / 4,
				alignItems: 'center',
				justifyContent: 'flex-start',
				borderRadius: 2,
				padding: 5 + (labelFontSize * 0.4),
			},
			iconStyle: {
				fontSize: iconSize,
				color: brandSecondary,
				marginRight: 5 + (labelFontSize * 0.4),
			},
			textContainer: {
				flexDirection: 'column',
			},
			labelStyle: {
				fontSize: labelFontSize,
				color: brandSecondary,
			},
			valueStyle: {
				fontSize: valueFontSize,
				color: brandSecondary,
				textShadowColor: 'rgba(0,0,0,0)',
				backgroundColor: 'rgba(0,0,0,0)',
			},
			updatedInfoStyle: {
				fontSize: updateInfoFontSize,
				color: '#000',
				backgroundColor: 'rgba(0,0,0,0)',
				textShadowColor: 'rgba(0,0,0,0)',
			},
			iconSize: updateInfoFontSize * 1.5,
		};
	}
};

export default SensorBlock;

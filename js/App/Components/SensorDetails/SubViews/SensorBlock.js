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
	View,
	Text,
	Icon,
	IconTelldus,
	FormattedNumber,
	FormattedMessage,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';
import {
	useRelativeIntl,
} from '../../../Hooks/App';

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

const SensorBlock = React.memo<Object>((props: Props): Object => {

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
	} = props;

	const {
		formatDate,
		formatTime,
	} = useRelativeIntl(gatewayTimezone);

	const {
		containerStyle,
		iconStyle,
		textContainer,
		labelStyle,
		valueStyle,
		updatedInfoStyle,
		iconSize: icSize,
	} = getStyles();

	return (
		<View
			level={2}
			style={containerStyle}
			accessible={true}
			importantForAccessibility={'yes'}>
			<IconTelldus
				icon={icon}
				style={iconStyle}
				level={23}/>
			<View style={textContainer}>
				<Text
					level={23}
					style={labelStyle}>
					{label}
				</Text>
				{name === 'wdir' ?
					<Text
						level={23}
						style={valueStyle}>
						{value}
					</Text>
					:
					<FormattedNumber
						value={value}
						{...formatOptions}
						level={23}
						style={valueStyle}
						suffix={unit}
						suffixStyle={valueStyle}/>
				}
				<Text
					level={3}
					style={updatedInfoStyle}>
					<Text style={updatedInfoStyle}>
						{formatDate(lastUpdated)}
					</Text>
					<Text style={Theme.Styles.hiddenText}>
						{' '}
					</Text>
					<Text style={updatedInfoStyle}>
						{formatTime(lastUpdated)}
					</Text>
				</Text>
				{!!max && (
					<Text
						level={3}
						style={updatedInfoStyle}>
						<Icon
							name={'angle-up'}
							level={23}
							size={icSize}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedMessage {...i18n.labelMax} style={updatedInfoStyle}/>
						{`: ${max}${unit}, `}
						<Text style={updatedInfoStyle}>
							{formatDate(maxTime)}
						</Text>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<Text style={updatedInfoStyle}>
							{formatTime(maxTime)}
						</Text>
					</Text>
				)}
				{!!min && (
					<Text
						level={3}
						style={updatedInfoStyle}>
						<Icon
							name={'angle-down'}
							level={23}
							size={icSize}/>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<FormattedMessage {...i18n.labelMin} style={updatedInfoStyle}/>
						{`: ${min}${unit}, `}
						<Text style={updatedInfoStyle}>
							{formatDate(minTime)}
						</Text>
						<Text style={Theme.Styles.hiddenText}>
							{' '}
						</Text>
						<Text style={updatedInfoStyle}>
							{formatTime(minTime)}
						</Text>
					</Text>
				)}
			</View>
		</View>
	);

	function getStyles(): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			paddingFactor,
			shadow,
			fontSizeFactorNine,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		const blockFullWidth = width - outerPadding;

		const iconSize = deviceWidth * fontSizeFactorNine;
		const labelFontSize = deviceWidth * 0.031;
		const valueFontSize = deviceWidth * 0.075;
		const updateInfoFontSize = deviceWidth * 0.027;

		return {
			containerStyle: {
				flexDirection: 'row',
				width: blockFullWidth,
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
				marginRight: 5 + (labelFontSize * 0.4),
			},
			textContainer: {
				flexDirection: 'column',
			},
			labelStyle: {
				fontSize: labelFontSize,
			},
			valueStyle: {
				fontSize: valueFontSize,
				textShadowColor: 'rgba(0,0,0,0)',
				backgroundColor: 'rgba(0,0,0,0)',
			},
			updatedInfoStyle: {
				fontSize: updateInfoFontSize,
				backgroundColor: 'rgba(0,0,0,0)',
				textShadowColor: 'rgba(0,0,0,0)',
			},
			iconSize: updateInfoFontSize * 1.5,
		};
	}
});

export default (SensorBlock: Object);

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
};

export default class SensorBlock extends View<Props, null> {
	props: Props;

	render(): Object {
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
		} = this.props;
		const {
			containerStyle,
			iconStyle,
			textContainer,
			labelStyle,
			valueStyle,
			updatedInfoStyle,
			iconSize,
		} = this.getStyles(appLayout);
		const { brandSecondary } = Theme.Core;

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
						<FormattedDate value={lastUpdated} style={updatedInfoStyle}/>
						<Text style={{
							color: 'transparent',
							fontSize: 14,
						}}>
						!
						</Text>
						<FormattedTime value={lastUpdated} style={updatedInfoStyle}/>
					</Text>
					{!!max && (
						<Text style={updatedInfoStyle}>
							<Icon name={'angle-up'} color={brandSecondary} size={iconSize}/>
							<Text style={{
								color: 'transparent',
								fontSize: 14,
							}}>
							!
							</Text>
							<FormattedMessage {...i18n.labelMax} style={updatedInfoStyle}/>
							{`: ${max}${unit}, `}
							<FormattedDate value={maxTime} style={updatedInfoStyle}/>
							<Text style={{
								color: 'transparent',
								fontSize: 14,
							}}>
							!
							</Text>
							<FormattedTime value={maxTime} style={updatedInfoStyle}/>
						</Text>
					)}
					{!!min && (
						<Text style={updatedInfoStyle}>
							<Icon name={'angle-down'} color={brandSecondary} size={iconSize}/>
							<Text style={{
								color: 'transparent',
								fontSize: 14,
							}}>
							!
							</Text>
							<FormattedMessage {...i18n.labelMin} style={updatedInfoStyle}/>
							{`: ${min}${unit}, `}
							<FormattedDate value={minTime} style={updatedInfoStyle}/>
							<Text style={{
								color: 'transparent',
								fontSize: 14,
							}}>
							!
							</Text>
							<FormattedTime value={minTime} style={updatedInfoStyle}/>
						</Text>
					)}
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor, shadow, brandSecondary } = Theme.Core;

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
			},
			updatedInfoStyle: {
				fontSize: updateInfoFontSize,
				color: '#000',
			},
			iconSize: updateInfoFontSize * 1.5,
		};
	}
}

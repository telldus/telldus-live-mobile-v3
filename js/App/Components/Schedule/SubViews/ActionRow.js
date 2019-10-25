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

import { BlockIcon, Row, Text, View } from '../../../../BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import { methods } from '../../../../Constants';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type ActionType = {
	name: string,
	description: string | Object,
	method: number,
	bgColor: string,
	textColor: string,
	icon: string,
	label: string | Object,
	actionLabel: Object,
	bgColorDark?: string,
};

export const ACTIONS: ActionType[] = [
	{
		name: 'On',
		description: i18n.onDescription,
		label: i18n.on,
		actionLabel: i18n.turnOn,
		method: 1,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'on',
	},
	{
		name: 'Off',
		description: i18n.offDescription,
		label: i18n.off,
		actionLabel: i18n.turnOff,
		method: 2,
		bgColor: Theme.Core.brandPrimary,
		textColor: '#999',
		icon: 'off',
	},
	{
		name: 'Bell',
		description: i18n.bellDescription,
		label: i18n.bell,
		actionLabel: i18n.bell,
		method: 4,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'bell',
	},
	{
		name: 'Dim',
		description: i18n.dimDescription,
		label: i18n.dim,
		actionLabel: i18n.dim,
		method: 16,
		bgColor: '#EEA567',
		bgColorDark: '#EA8F41',
		textColor: Theme.Core.brandSecondary,
		icon: 'dim',
	},
	{
		name: 'Up',
		description: i18n.upDescription,
		label: i18n.up,
		actionLabel: i18n.up,
		method: 128,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'up',
	},
	{
		name: 'Down',
		description: i18n.downDescription,
		label: i18n.down,
		actionLabel: i18n.down,
		method: 256,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'down',
	},
	{
		name: 'Stop',
		description: i18n.stopDescription,
		label: i18n.stop,
		actionLabel: i18n.stop,
		method: 512,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'stop',
	},
	{
		name: 'Rgb',
		description: i18n.rgbDescription,
		label: 'RGB',
		actionLabel: 'rgb',
		method: 1024,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'palette',
	},
	{
		name: 'Thermostat',
		description: i18n.thermostateDescription,
		label: i18n.thermostat,
		actionLabel: i18n.thermostat,
		method: 2048,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'temperature',
	},
];

type DefaultProps = {
	showValue: boolean,
	methodValue: number | string,
};

type Props = {
	method: number,
	actionIcons: Object,
	onPress?: Function,
	containerStyle?: Object,
	showValue?: boolean,
	methodValue?: number | string,
	appLayout: Object,
	intl: Object,
	labelPostScript?: string,
	iconContainerStyle?: Array<any> | Object | number,
};

export default class ActionRow extends View<DefaultProps, Props, null> {

	static defaultProps = {
		showValue: false,
		methodValue: 0,
	};

	render(): React$Element<any> | null {
		const { method, methodValue } = this.props;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);

		if (!action) {
			return null;
		}

		const { onPress, containerStyle, appLayout, intl } = this.props;
		const { row, description } = this._getStyle(appLayout);

		const accessibilityLabel = this._getAccessibilityLabel(method, methodValue, action.actionLabel);

		return (
			<Row onPress={onPress} row={action} layout="row" style={row} containerStyle={containerStyle}
				accessible={true}
				importantForAccessibility={'yes'}
				accessibilityLabel={accessibilityLabel}>
				{this._renderIcon(action)}
				<TextRowWrapper appLayout={appLayout}>
					<Title color={action.textColor} appLayout={appLayout}>{typeof action.label === 'string' ? action.label : intl.formatMessage(action.label)}</Title>
					<Description style={description} appLayout={appLayout}>{typeof action.description === 'string' ? action.description : intl.formatMessage(action.description)}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

	_renderIcon = (action: ActionType): Object => {
		const { showValue, methodValue, appLayout, iconContainerStyle, actionIcons, method } = this.props;
		const {
			dimContainer,
			dimValue,
			icon: iconStyle,
			iconContainer,
			thermostatContainer,
			thermostatMode,
			thermostatTemp,
		} = this._getStyle(appLayout);

		if (showValue && action.icon === 'dim') {
			const roundVal = Math.round(methodValue / 255 * 100);
			const value = `${roundVal}%`;
			let backgroundColor = action.bgColor;
			if (roundVal >= 50 && roundVal < 100) {
				backgroundColor = action.bgColorDark;
			}
			return (
				<View style={[dimContainer, { backgroundColor }, iconContainerStyle]}>
					<Text style={dimValue}>
						{value}
					</Text>
				</View>
			);
		}
		if (showValue && method === 2048) {
			let backgroundColor = action.bgColor;
			const {
				mode,
				temperature,
				scale,
			} = JSON.parse(methodValue);
			return (
				<View style={[thermostatContainer, { backgroundColor }, iconContainerStyle]}>
					{!!mode && <Text style={thermostatMode}>
						{mode.toUpperCase()}
					</Text>
					}
					{typeof temperature !== 'undefined' && <Text style={thermostatTemp}>
						{temperature}{scale ? '°F' : '°C'}
					</Text>
					}
				</View>
			);
		}

		const methodString = methods[action.method];
		let iconName = actionIcons[methodString];

		if (showValue && method === 1024) {
			const color = methodValue.toLowerCase() === '#ffffff' ? Theme.Core.brandSecondary : methodValue;
			return (
				<BlockIcon
					icon={iconName ? iconName : action.icon}
					bgColor={action.bgColor}
					style={iconStyle}
					containerStyle={[iconContainer, iconContainerStyle, {backgroundColor: color}]}
				/>
			);
		}

		return (
			<BlockIcon
				icon={iconName ? iconName : action.icon}
				bgColor={action.bgColor}
				style={iconStyle}
				containerStyle={[iconContainer, iconContainerStyle]}
			/>
		);
	};

	_getAccessibilityLabel(method: number, methodValue: number, label: Object): string {
		const { labelPostScript = '', intl } = this.props;
		const { formatMessage } = intl;
		const value = methodValue ? `${Math.round(methodValue / 255 * 100)}%` : '';
		const labelAction = `${typeof label === 'string' ? label : formatMessage(label)} ${value}`;
		return `${formatMessage(i18n.labelAction)}, ${labelAction}, ${labelPostScript}`;
	}

	_getStyle = (appLayout: Object): Object => {
		const { borderRadiusRow } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const iconContainerWidth = deviceWidth * 0.286666667;

		return {
			row: {
				alignItems: 'stretch',
			},
			icon: {
				fontSize: deviceWidth * 0.092,
			},
			iconContainer: {
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
				width: iconContainerWidth,
			},
			description: {
				color: '#707070',
				fontSize: deviceWidth * 0.032,
				opacity: 1,
			},
			dimContainer: {
				alignItems: 'center',
				justifyContent: 'center',
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
				width: iconContainerWidth,
			},
			thermostatContainer: {
				alignItems: 'center',
				justifyContent: 'center',
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
				width: iconContainerWidth,
			},
			dimValue: {
				color: '#fff',
				fontSize: deviceWidth * 0.053333333,
			},
			thermostatMode: {
				color: '#fff',
				fontSize: deviceWidth * 0.043333333,
			},
			thermostatTemp: {
				color: '#fff',
				fontSize: deviceWidth * 0.043333333,
			},
		};
	};

}

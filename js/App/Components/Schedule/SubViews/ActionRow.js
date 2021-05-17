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

import { BlockIcon, Row, Text, View, IconTelldus } from '../../../../BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import { methods } from '../../../../Constants';

import {
	getKnownModes,
} from '../../../Lib/thermostatUtils';
import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type ActionType = {
	name: string,
	description: string | Object,
	descriptionTwo?: string | Object,
	descriptionThree?: string | Object,
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
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'on',
	},
	{
		name: 'Off',
		description: i18n.offDescription,
		label: i18n.off,
		actionLabel: i18n.turnOff,
		method: 2,
		bgColor: 'colorOffActiveBg',
		textColor: 'colorOffActiveBg',
		icon: 'off',
	},
	{
		name: 'Bell',
		description: i18n.bellDescription,
		label: i18n.bell,
		actionLabel: i18n.bell,
		method: 4,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'bell',
	},
	{
		name: 'Dim',
		description: i18n.dimDescription,
		label: i18n.dim,
		actionLabel: i18n.dim,
		method: 16,
		bgColor: 'dimL1Color', // TODO: Check with Johannes, the color code in dark mode
		bgColorDark: 'dimL2Color', // TODO: Check with Johannes, the color code in dark mode
		textColor: 'colorOnActiveBg',
		icon: 'dim',
	},
	{
		name: 'Up',
		description: i18n.upDescription,
		label: i18n.up,
		actionLabel: i18n.up,
		method: 128,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'up',
	},
	{
		name: 'Down',
		description: i18n.downDescription,
		label: i18n.down,
		actionLabel: i18n.down,
		method: 256,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'down',
	},
	{
		name: 'Stop',
		description: i18n.stopDescription,
		label: i18n.stop,
		actionLabel: i18n.stop,
		method: 512,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'stop',
	},
	{
		name: 'Rgb',
		description: i18n.rgbDescription,
		label: 'RGB',
		actionLabel: 'rgb',
		method: 1024,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'palette',
	},
	{
		name: 'Thermostat',
		description: i18n.thermostateDescription,
		descriptionTwo: i18n.changeSettOnly,
		descriptionThree: i18n.changeModeOnly,
		label: i18n.thermostat,
		actionLabel: i18n.thermostat,
		method: 2048,
		bgColor: 'colorOnActiveBg',
		textColor: 'colorOnActiveBg',
		icon: 'temperature',
	},
];

type DefaultProps = {
	showValue: boolean,
	methodValue: number | string,
};

type Props = PropsThemedComponent & {
	method: number,
	actionIcons: Object,
	onPress?: Function,
	containerStyle?: Object,
	showValue?: boolean,
	methodValue?: number | string,
	appLayout: Object,
	intl: Object,
	labelPostScript?: string,
	iconContainerStyle?: Array<any> | Object,
};

class ActionRow extends View<DefaultProps, Props, null> {

	static defaultProps = {
		showValue: false,
		methodValue: 0,
	};

	render(): React$Element<any> | null {
		const { method, methodValue, showValue, colors } = this.props;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);

		if (!action) {
			return null;
		}

		const { onPress, containerStyle, appLayout, intl } = this.props;
		const { row, description } = this._getStyle(appLayout);

		const accessibilityLabel = this._getAccessibilityLabel(method, methodValue, action.actionLabel);

		let descriptionText = typeof action.description === 'string' ? action.description : intl.formatMessage(action.description);

		if (showValue && method === 2048) {
			const {
				changeMode,
				temperature,
			} = JSON.parse(methodValue);
			const changeTemp = typeof temperature !== 'undefined' && temperature !== null;

			if (changeMode) {
				// $FlowFixMe
				descriptionText = intl.formatMessage(action.descriptionThree);
			}
			if (changeTemp) {
				// $FlowFixMe
				descriptionText = intl.formatMessage(action.descriptionTwo);
			}
			if (changeTemp && changeMode) {
				descriptionText = intl.formatMessage(action.description);
			}
		}

		return (
			<Row onPress={onPress} row={action} layout="row" style={row} containerStyle={containerStyle}
				accessible={true}
				importantForAccessibility={'yes'}
				accessibilityLabel={accessibilityLabel}>
				{this._renderIcon(action)}
				<TextRowWrapper appLayout={appLayout}>
					<Title color={colors[action.textColor]} appLayout={appLayout}>{typeof action.label === 'string' ? action.label : intl.formatMessage(action.label)}</Title>
					<Description style={description} appLayout={appLayout}>{descriptionText}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

	_renderIcon = (action: ActionType): Object => {
		const {
			showValue,
			methodValue,
			appLayout,
			iconContainerStyle,
			actionIcons,
			method,
			intl,
			colors,
		} = this.props;
		const {
			dimContainer,
			dimValue,
			icon: iconStyle,
			iconContainer,
			thermostatContainer,
			thermostatMode,
			thermostatTemp,
			thermostateModeControlIcon,
		} = this._getStyle(appLayout);

		if (showValue && action.icon === 'dim') {
			const roundVal = Math.round(methodValue / 255 * 100);
			const value = `${roundVal}%`;
			let backgroundColor = colors[action.bgColor];
			if (roundVal >= 50 && roundVal < 100) {
				backgroundColor = colors[action.bgColorDark];
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
			let backgroundColor = colors[action.bgColor];
			const {
				mode = '',
				temperature,
				scale,
				changeMode,
			} = JSON.parse(methodValue);

			const modesInfo = getKnownModes(intl.formatMessage);
			// $FlowFixMe
			let Icon, label;
			modesInfo.map((info: Object) => {
				if (info.mode.trim() === mode.trim()) {
					Icon = info.IconActive;
					label = info.label;
				}
			});

			const {
				fontSize,
				...others
			} = thermostateModeControlIcon;

			const showModeIcon = !!Icon;

			return (
				<View style={[thermostatContainer, { backgroundColor }, iconContainerStyle]}>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
						{showModeIcon && (
							// $FlowFixMe
							<Icon
								height={fontSize}
								width={fontSize}
								style={{
									...others,
								}}/>
						)}
						{!!changeMode &&
								(
									<IconTelldus icon={'play'} style={thermostateModeControlIcon}/>
								)
						}
					</View>
					{!!label && <Text style={thermostatMode}>
						{label.toUpperCase()}
					</Text>
					}
					{(typeof temperature !== 'undefined' && temperature !== null && temperature !== '')
					&& <Text style={thermostatTemp}>
						{temperature}{scale ? '°F' : '°C'}
					</Text>
					}
				</View>
			);
		}

		const methodString = methods[action.method];
		let iconName = actionIcons[methodString];

		if (showValue && method === 1024) {
			const color = methodValue.toLowerCase() === '#ffffff' ? colors.colorOnActiveBg : methodValue;
			return (
				<BlockIcon
					icon={iconName ? iconName : action.icon}
					bgColor={colors[action.bgColor]}
					style={iconStyle}
					containerStyle={[iconContainer, iconContainerStyle, {backgroundColor: color}]}
				/>
			);
		}

		return (
			<BlockIcon
				icon={iconName ? iconName : action.icon}
				bgColor={colors[action.bgColor]}
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
			thermostateModeControlIcon: {
				color: '#fff',
				fontSize: deviceWidth * 0.043333333,
				marginBottom: 3,
			},
		};
	};

}

export default (withTheme(ActionRow): Object);

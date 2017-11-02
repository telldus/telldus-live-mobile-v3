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

import React, { PropTypes } from 'react';
import { BlockIcon, Row, Text, View } from 'BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import Theme from 'Theme';
import { getDeviceWidth } from 'Lib';

type ActionType = {
	name: string,
	description: string,
	method: number,
	bgColor: string,
	textColor: string,
	icon: string,
};

export const ACTIONS: ActionType[] = [
	{
		name: 'On',
		description: 'Turns the device on',
		method: 1,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'on',
	},
	{
		name: 'Off',
		description: 'Turns the device off',
		method: 2,
		bgColor: '#999',
		textColor: '#999',
		icon: 'off',
	},
	{
		name: 'Dim',
		description: 'Dims the device',
		method: 16,
		bgColor: '#e88631',
		textColor: Theme.Core.brandSecondary,
		icon: 'dim',
	},
	{
		name: 'Up',
		description: 'Turn the device up',
		method: 128,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'up',
	},
	{
		name: 'Down',
		description: 'Turn the device down',
		method: 256,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'down',
	},
	{
		name: 'Stop',
		description: 'Stop the device',
		method: 512,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'stop',
	},
];

type DefaultProps = {
	showValue: boolean,
	methodValue: number,
};

type Props = {
	method: number,
	onPress?: Function,
	containerStyle?: Object,
	showValue?: boolean,
	methodValue?: number,
};

export default class ActionRow extends View<DefaultProps, Props, null> {

	static propTypes = {
		method: PropTypes.number.isRequired,
		onPress: PropTypes.func,
		containerStyle: PropTypes.object,
		showValue: PropTypes.bool,
		methodValue: PropTypes.number,
	};

	static defaultProps = {
		showValue: false,
		methodValue: 0,
	};

	render(): React$Element<any> | null {
		const action = ACTIONS.find((a: Object): boolean => a.method === this.props.method);

		if (!action) {
			return null;
		}

		const { onPress, containerStyle } = this.props;
		const { row, description } = this._getStyle();

		return (
			<Row onPress={onPress} row={action} layout="row" style={row} containerStyle={containerStyle}>
				{this._renderIcon(action)}
				<TextRowWrapper>
					<Title color={action.textColor}>{action.name}</Title>
					<Description style={description}>{action.description}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

	_renderIcon = (action: ActionType): Object => {
		const { showValue, methodValue } = this.props;
		const { dimContainer, dimValue, icon, iconContainer } = this._getStyle();

		if (showValue && action.icon === 'dim') {
			return (
				<View style={[dimContainer, { backgroundColor: action.bgColor }]}>
					<Text style={dimValue}>
						{`${Math.round(methodValue / 255 * 100)}%`}
					</Text>
				</View>
			);
		}

		return (
			<BlockIcon
				icon={action.icon}
				bgColor={action.bgColor}
				style={icon}
				containerStyle={iconContainer}
			/>
		);
	};

	_getStyle = (): Object => {
		const { borderRadiusRow } = Theme.Core;
		const deviceWidth = getDeviceWidth();
		const iconContainerWidth = deviceWidth * 0.346666667;

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
			dimValue: {
				color: '#fff',
				fontSize: deviceWidth * 0.053333333,
			},
		};
	};

}

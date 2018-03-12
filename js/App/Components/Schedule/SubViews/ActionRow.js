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
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';

import { BlockIcon, Row, Text, View } from '../../../../BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const messages = defineMessages({
	onDescription: {
		id: 'actions.onDescription',
		defaultMessage: 'Turns the device on',
	},
	offDescription: {
		id: 'actions.offDescription',
		defaultMessage: 'Turns the device off',
	},
	bellDescription: {
		id: 'actions.bellDescription',
		defaultMessage: 'Ring the bell',
	},
	dimDescription: {
		id: 'actions.dimDescription',
		defaultMessage: 'Dims the device',
	},
	upDescription: {
		id: 'actions.upDescription',
		defaultMessage: 'Turn the device up',
	},
	downDescription: {
		id: 'actions.downDescription',
		defaultMessage: 'Turn the device down',
	},
	stopDescription: {
		id: 'actions.stopDescription',
		defaultMessage: 'Stop the device',
	},
});

type ActionType = {
	name: string,
	description: string | Object,
	method: number,
	bgColor: string,
	textColor: string,
	icon: string,
	label: string | Object,
};

export const ACTIONS: ActionType[] = [
	{
		name: 'On',
		description: messages.onDescription,
		label: i18n.on,
		method: 1,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'on',
	},
	{
		name: 'Off',
		description: messages.offDescription,
		label: i18n.off,
		method: 2,
		bgColor: '#999',
		textColor: '#999',
		icon: 'off',
	},
	{
		name: 'Bell',
		description: messages.bellDescription,
		label: i18n.bell,
		method: 4,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'bell',
	},
	{
		name: 'Dim',
		description: messages.dimDescription,
		label: i18n.dim,
		method: 16,
		bgColor: '#e88631',
		textColor: Theme.Core.brandSecondary,
		icon: 'dim',
	},
	{
		name: 'Up',
		description: messages.upDescription,
		label: i18n.up,
		method: 128,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'up',
	},
	{
		name: 'Down',
		description: messages.downDescription,
		label: i18n.down,
		method: 256,
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'down',
	},
	{
		name: 'Stop',
		description: messages.stopDescription,
		label: i18n.stop,
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
	appLayout: Object,
	intl: Object,
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

		const { onPress, containerStyle, appLayout, intl } = this.props;
		const { row, description } = this._getStyle(appLayout);

		return (
			<Row onPress={onPress} row={action} layout="row" style={row} containerStyle={containerStyle}>
				{this._renderIcon(action)}
				<TextRowWrapper appLayout={appLayout}>
					<Title color={action.textColor} appLayout={appLayout}>{intl.formatMessage(action.label)}</Title>
					<Description style={description} appLayout={appLayout}>{intl.formatMessage(action.description)}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

	_renderIcon = (action: ActionType): Object => {
		const { showValue, methodValue, appLayout } = this.props;
		const { dimContainer, dimValue, icon, iconContainer } = this._getStyle(appLayout);

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

	_getStyle = (appLayout: Object): Object => {
		const { borderRadiusRow } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
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

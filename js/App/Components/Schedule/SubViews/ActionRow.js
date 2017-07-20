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
import { View } from 'react-native';
import Row from './Row';
import BlockIcon from '../../../../BaseComponents/BlockIcon';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';
import Theme from 'Theme';
import getDeviceWidth from '../../../Lib/getDeviceWidth';

type ActionType = {
	name: string,
	description: string,
	method: number,
	bgColor: string,
	textColor: string,
	icon: string,
};

const ACTIONS: ActionType[] = [
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
		bgColor: 'rgba(226, 105, 1, 0.80)',
		textColor: Theme.Core.brandSecondary,
		icon: 'dim',
	},
];

type Props = {
	method: number,
	onPress?: Function,
	containerStyle?: Object,
};

export default class ActionRow extends View<null, Props, null> {

	static propTypes = {
		method: PropTypes.number.isRequired,
		onPress: PropTypes.func,
		containerStyle: View.propTypes.style,
	};

	render() {
		const action = ACTIONS.find((a: Object): boolean => a.method === this.props.method);

		if (!action) {
			return;
		}

		const { onPress, containerStyle } = this.props;

		return (
			<Row onPress={onPress} row={action} layout="row" containerStyle={containerStyle}>
				<BlockIcon
					icon={action.icon}
					size={getDeviceWidth() * 0.092}
					bgColor={action.bgColor}
					style={{ width: '30%' }}
				/>
				<TextRowWrapper>
					<Title color={action.textColor}>{action.name}</Title>
					<Description>{action.description}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

}

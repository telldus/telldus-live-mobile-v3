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
import BlockIcon from './BlockIcon';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';
import Description from './Description';

type Props = {
	row: Object,
	onPress?: Function,
};

export default class DeviceRow extends View<null, Props, null> {

	static propTypes = {
		row: PropTypes.object.isRequired,
		onPress: PropTypes.func,
	};

	render() {
		const { row, onPress } = this.props;

		return (
			<Row layout="row" row={row} onPress={onPress}>
				<BlockIcon icon="device-alt" size={56}/>
				<TextRowWrapper>
					<Title>{row.name}</Title>
					<Description>{row.description}</Description>
				</TextRowWrapper>
			</Row>
		);
	}

}

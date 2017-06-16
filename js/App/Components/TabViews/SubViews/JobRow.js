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

'use strict';

import React from 'react';
import { ListItem, Text } from 'BaseComponents';
import Theme from 'Theme';

export default props => {
	const methodName = {
		1: 'On',
		2: 'Off',
		4: 'Bell',
		16: 'Dim',
		32: 'Learn',
		128: 'Up',
		256: 'Down',
		512: 'Stop',
	};

	const { device, methodValue } = props;
	if (!device) {
		return null;
	}
	const method = methodName[props.method];
	const value = method === 'Dim' ? `${Math.round(methodValue / 255.0 * 100)}%` : method;
	return (
		<ListItem style={Theme.Styles.rowFront}>
			<Text style={{
				flex: 4,
				color: 'orange',
				fontSize: 16,
			}}>
				{`${props.effectiveHour}:${props.effectiveMinute}`}
			</Text>
			<Text style={{
				flex: 20,
				color: '#1a355c',
				fontSize: 16,
				paddingLeft: 6,
			}}>
				{device.name}
			</Text>
			<Text style={{
				flex: 4,
				color: '#1a355c',
				fontSize: 16,
			}}>
				{value}
			</Text>
		</ListItem>
	);
};

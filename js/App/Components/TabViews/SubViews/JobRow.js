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
import { FormattedMessage, ListItem, Text } from 'BaseComponents';
import Theme from 'Theme';
import i18n from '../../../Translations/common';

type Props = {
	device: Object,
	methodValue: number,
	method: string,
	effectiveHour: number,
	effectiveMinute: number,
};

export default (props: Props) => {
	const methodName = {
		[1]: 'On',
		[2]: 'Off',
		[4]: 'Bell',
		[16]: 'Dim',
		[32]: 'Learn',
		[128]: 'Up',
		[256]: 'Down',
		[512]: 'Stop',
	};

	const { device, methodValue } = props;
	if (!device) {
		return null;
	}
	const method = methodName[props.method];
	let value = '';
	switch (method) {
		case 'Dim':
			value = `${Math.round(methodValue / 255.0 * 100)}%`;
			break;
		case 'On':
			value = <FormattedMessage {...i18n.on} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Off':
			value = <FormattedMessage {...i18n.off} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Bell':
			value = <FormattedMessage {...i18n.bell} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Learn':
			value = <FormattedMessage {...i18n.learn} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Up':
			value = <FormattedMessage {...i18n.up} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Down':
			value = <FormattedMessage {...i18n.down} style={Theme.Styles.jobRowMethod}/>;
			break;
		case 'Stop':
			value = <FormattedMessage {...i18n.stop} style={Theme.Styles.jobRowMethod}/>;
			break;
		default:
			value = method;
	}
	return (
		<ListItem style={Theme.Styles.rowFront}>
			<Text style={{ flex: 5, color: 'orange', fontSize: 16 }}>
				{`${props.effectiveHour}:${props.effectiveMinute}`}
			</Text>
			<Text style={{ flex: 20, color: '#1a355c', fontSize: 16, paddingLeft: 6 }}>
				{device.name}
			</Text>
			<Text style={{ flex: 4, color: '#1a355c', fontSize: 16 }}>
				{value}
			</Text>
		</ListItem>
	);
};

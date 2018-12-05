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
import { View, Text, IconTelldus } from '../../../../BaseComponents';

import { getControlIconColor } from '../../../Lib/gatewayUtils';
import Theme from '../../../Theme';

type Props = {
	gateway: Object,
	appLayout: Object,
	supportLocalControl: boolean,
	isOnline: boolean,
	websocketOnline: boolean,
};

export default class DeviceHeader extends View<Props, null> {
	props: Props;
	constructor(props: Props) {
		super(props);
	}
	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { appLayout, supportLocalControl, isOnline, websocketOnline } = this.props;

		return appLayout.width !== nextProps.appLayout.width || supportLocalControl !== nextProps.supportLocalControl ||
		isOnline !== nextProps.isOnline || websocketOnline !== nextProps.websocketOnline;
	}

	render(): Object {
		const {
			appLayout,
			gateway,
			supportLocalControl,
			isOnline,
			websocketOnline,
		} = this.props;

		const icon = supportLocalControl ? 'localcontrol' : 'cloudcontrol';
		const {
			statusInfo,
			nameFontSize,
		} = this.getStyles(appLayout, supportLocalControl);
		const controlIconColor = getControlIconColor(isOnline, websocketOnline, supportLocalControl);

		return (
			<View style={Theme.Styles.sectionHeader}>
				<IconTelldus icon={icon} style={{...statusInfo, color: controlIconColor}}/>
				<Text style={[Theme.Styles.sectionHeaderText, { fontSize: nameFontSize }]}>
					{gateway}
				</Text>
			</View>
		);
	}

	getStyles(appLayout: Object, supportLocalControl: boolean): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			maxSizeRowTextOne,
		} = Theme.Core;

		let statusInfoSize = Math.floor(deviceWidth * 0.055);
		statusInfoSize = statusInfoSize > 28 ? 28 : statusInfoSize;

		let nameFontSize = Math.floor(deviceWidth * 0.047);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		return {
			statusInfo: {
				fontSize: statusInfoSize,
				marginRight: 5,
			},
			nameFontSize,
		};
	}
}

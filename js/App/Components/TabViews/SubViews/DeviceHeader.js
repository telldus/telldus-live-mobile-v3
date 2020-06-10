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

import { getControlIconColorLabel } from '../../../Lib/gatewayUtils';
import {
	shouldUpdate,
	getSectionHeaderFontSize,
	getSectionHeaderHeight,
} from '../../../Lib';
import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	gateway: Object,
	appLayout: Object,
	supportLocalControl: boolean,
	isOnline: boolean,
	websocketOnline: boolean,
	accessible: boolean,
	intl: Object,
};

export default class DeviceHeader extends View<Props, null> {
	props: Props;
	constructor(props: Props) {
		super(props);
	}
	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(nextProps, this.props, [
			'appLayout',
			'supportLocalControl',
			'isOnline',
			'websocketOnline',
			'accessible',
		]);
	}

	render(): Object {
		const {
			appLayout,
			gateway,
			supportLocalControl,
			isOnline,
			websocketOnline,
			accessible,
			intl,
		} = this.props;

		const icon = supportLocalControl ? 'localcontrol' : 'cloudcontrol';
		const {
			statusInfo,
			nameFontSize,
			sectionHeader,
		} = this.getStyles(appLayout, supportLocalControl);
		const {color: controlIconColor, label} = getControlIconColorLabel(isOnline, websocketOnline, supportLocalControl, intl.formatMessage);

		const control = supportLocalControl ? intl.formatMessage(i18n.labelLocal) : intl.formatMessage(i18n.labelCloud);
		const accessibilityLabel = intl.formatMessage(i18n.accessibilityLabelListHeader, {
			gatewayName: gateway,
			status: label,
			control,
		});

		return (
			<View
				level={2}
				style={sectionHeader}
				accessible={accessible}
				accessibilityLabel={accessibilityLabel}>
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
			shadow,
			paddingFactor,
		} = Theme.Core;

		let statusInfoSize = Math.floor(deviceWidth * 0.055);
		statusInfoSize = statusInfoSize > 28 ? 28 : statusInfoSize;

		let nameFontSize = getSectionHeaderFontSize(deviceWidth);

		const padding = deviceWidth * paddingFactor;

		return {
			statusInfo: {
				fontSize: statusInfoSize,
				marginRight: 5,
			},
			nameFontSize,
			sectionHeader: {
				flexDirection: 'row',
				height: getSectionHeaderHeight(nameFontSize),
				alignItems: 'center',
				paddingLeft: 5 + (nameFontSize * 0.2),
				justifyContent: 'flex-start',
				marginBottom: padding / 2,
				...shadow,
			},
		};
	}
}

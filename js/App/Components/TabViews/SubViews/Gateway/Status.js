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
import { connect } from 'react-redux';
import { View, Text, StyleSheet, IconTelldus } from '../../../../../BaseComponents';
import { hasTokenExpired, getControlIconColorLabel } from '../../../../Lib';

import i18n from '../../../../Translations/common';

import {
	withTheme,
	PropsThemedComponent,
} from '../../../HOC/withTheme';

type Props = PropsThemedComponent & {
    online: boolean,
    websocketOnline: boolean,
	intl: Object,
	textStyle?: Array<any> | Object,
	appLayout: Object,
	statusInfoStyle?: Object,
	localKey: Object,
};

class GatewayStatus extends View<Props, null> {
props: Props;

online: string;
offline: string;
noLiveUpdates: string;

constructor(props: Props) {
	super(props);

	let { formatMessage } = this.props.intl;

	this.online = formatMessage(i18n.online);
	this.offline = formatMessage(i18n.offline);
	this.noLiveUpdates = formatMessage(i18n.noLiveUpdates);
}

render(): Object {
	let {
		online,
		websocketOnline,
		textStyle,
		appLayout,
		statusInfoStyle,
		localKey = {},
		intl,
		colors,
	} = this.props;
	let { address, key, ttl, supportLocal } = localKey;
	let tokenExpired = hasTokenExpired(ttl);
	let supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
	let icon = supportLocalControl ? 'localcontrol' : 'cloudcontrol';
	let {
		statusText,
		statusInfo,
	} = this.getStyles(appLayout, supportLocalControl);
	const {color: controlIconColor} = getControlIconColorLabel(online, websocketOnline, supportLocalControl, intl.formatMessage, {
		colors,
	});

	if (!online) {
		return (
			<View style={styles.statusInfoCover}>
				<IconTelldus icon={icon} style={{...statusInfo, color: controlIconColor, ...statusInfoStyle}}/>
				<Text style={[statusText, textStyle]}>
					{this.offline}
				</Text>
			</View>
		);
	} else if (!websocketOnline) {
		return (
			<View style={styles.statusInfoCover}>
				<IconTelldus icon={icon} style={{...statusInfo, color: controlIconColor, ...statusInfoStyle}}/>
				<Text style={[statusText, textStyle]}>
					{this.noLiveUpdates}
				</Text>
			</View>
		);
	}
	return (
		<View style={styles.statusInfoCover}>
			<IconTelldus icon={icon} style={{...statusInfo, color: controlIconColor, ...statusInfoStyle}}/>
			<Text style={[statusText, textStyle]}>
				{this.online}
			</Text>
		</View>
	);
}

getStyles(appLayout: Object, supportLocal: boolean): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	let textLocationSize = Math.floor(deviceWidth * 0.042);
	textLocationSize = textLocationSize > 28 ? 28 : textLocationSize;

	let statusInfoSize = Math.floor(deviceWidth * 0.055);
	statusInfoSize = statusInfoSize > 28 ? 28 : statusInfoSize;

	let fontSize = textLocationSize;

	return {
		statusInfo: {
			fontSize: statusInfoSize,
			marginRight: 5,
		},
		statusText: {
			fontSize,
			color: '#A59F9A',
		},
	};
}
}

const styles = StyleSheet.create({
	statusInfoCover: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

export default connect(mapStateToProps, null)(withTheme(GatewayStatus));

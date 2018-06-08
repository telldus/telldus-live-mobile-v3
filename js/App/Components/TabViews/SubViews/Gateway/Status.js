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
import { View, Text, StyleSheet } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';
import { hasTokenExpired } from '../../../../Lib';

import i18n from '../../../../Translations/common';

type Props = {
    online: boolean,
    websocketOnline: boolean,
	intl: Object,
	textStyle?: number | Object | Array<any>,
	appLayout: Object,
	statusInfoStyle?: number | Object | Array<any>,
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
	let { locationOffline, locationOnline, locationNoLiveUpdates } = Theme.Core;
	let { online, websocketOnline, textStyle, appLayout, statusInfoStyle, localKey = {}} = this.props;
	let { address, key, ttl } = localKey;
	let tokenExpired = hasTokenExpired(ttl);
	let supportLocal = address && key && ttl && !tokenExpired;
	let {
		statusText,
		statusInfo,
	} = this.getStyles(appLayout);

	if (!online) {
		return (
			<View style={{flexDirection: 'column'}}>
				<View style={styles.statusInfoCover}>
					<View style={[statusInfo, { backgroundColor: locationOffline}, statusInfoStyle]}/>
					<Text style={[statusText, textStyle]}>
						{this.offline}
					</Text>
				</View>
				<Text style={[statusText, textStyle]}>
					{supportLocal ? 'local' : 'cloud'}
				</Text>
			</View>
		);
	} else if (!websocketOnline) {
		return (
			<View style={{flexDirection: 'column'}}>
				<View style={styles.statusInfoCover}>
					<View style={[statusInfo, { backgroundColor: locationNoLiveUpdates}, statusInfoStyle]}/>
					<Text style={[statusText, textStyle]}>
						{this.noLiveUpdates}
					</Text>
				</View>
				<Text style={[statusText, textStyle]}>
					{supportLocal ? 'local' : 'cloud'}
				</Text>
			</View>
		);
	}
	return (
		<View style={{flexDirection: 'column'}}>
			<View style={styles.statusInfoCover}>
				<View style={[statusInfo, { backgroundColor: locationOnline}, statusInfoStyle]}/>
				<Text style={[statusText, textStyle]}>
					{this.online}
				</Text>
			</View>
			<Text style={[statusText, textStyle]}>
				{supportLocal ? 'local' : 'cloud'}
			</Text>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	let textLocationSize = Math.floor(deviceWidth * 0.042);
	textLocationSize = textLocationSize > 28 ? 28 : textLocationSize;

	let statusInfoSize = Math.floor(deviceWidth * 0.038);
	statusInfoSize = statusInfoSize > 25 ? 25 : statusInfoSize;

	let fontSize = textLocationSize;

	return {
		statusInfo: {
			width: statusInfoSize,
			height: statusInfoSize,
			borderRadius: statusInfoSize / 2,
			marginTop: 3,
			marginRight: 5,
		},
		statusText: {
			fontSize,
			textAlignVertical: 'center',
			color: '#A59F9A',
			marginTop: 2,
		},
	};
}
}

const styles = StyleSheet.create({
	statusInfoCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(GatewayStatus);

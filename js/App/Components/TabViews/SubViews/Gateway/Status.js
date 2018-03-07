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
import { View, Text, StyleSheet } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

import i18n from '../../../../Translations/common';

type Props = {
    online: boolean,
    websocketOnline: boolean,
    intl: Object,
};

export default class GatewayStatus extends View<Props, null> {
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
	let { online, websocketOnline } = this.props;

	if (!online) {
		return (
			<View style={styles.statusInfoCover}>
				<View style={[styles.statusInfo, { backgroundColor: locationOffline}]}/>
				<Text style={styles.statusText}>
					{this.offline}
				</Text>
			</View>
		);
	} else if (!websocketOnline) {
		return (
			<View style={styles.statusInfoCover}>
				<View style={[styles.statusInfo, { backgroundColor: locationNoLiveUpdates}]}/>
				<Text style={styles.statusText}>
					{this.noLiveUpdates}
				</Text>
			</View>
		);
	}
	return (
		<View style={styles.statusInfoCover}>
			<View style={[styles.statusInfo, { backgroundColor: locationOnline}]}/>
			<Text style={styles.statusText}>
				{this.online}
			</Text>
		</View>
	);
}
}

const styles = StyleSheet.create({
	statusInfoCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	statusInfo: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginTop: 3,
		marginRight: 5,
	},
	statusText: {
		fontSize: 13,
		textAlignVertical: 'center',
		color: '#A59F9A',
		marginTop: 2,
	},
});

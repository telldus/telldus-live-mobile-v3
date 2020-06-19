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

import { Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { NativeModules } from 'react-native';
const {
	NativeUtilitiesModule = {},
} = NativeModules;

const PUSH_CHANNEL_ID = '1010101';

export interface LocalNotificationData {
    notificationId: string,
	title: string,
	body: string,
	data: Object,
}


const setChannel = () => {
	if (Platform.OS !== 'android') {
		return;
	}
	NativeUtilitiesModule.createNotificationChannel({
		channelId: PUSH_CHANNEL_ID,
		channelName: 'Tellus Local Notification',
		channelDescription: 'Telldus local notification when actions fail to execute on fence event.',
	});
};

const createLocationNotification = ({
	notificationId,
	title,
	body,
	data,
}: LocalNotificationData) => {

	if (Platform.OS === 'android') {
		setChannel();
		NativeUtilitiesModule.showLocalNotification({
			channelId: PUSH_CHANNEL_ID,
			smallIcon: 'icon_notif',
			title: title,
			text: body,
			notificationId: notificationId,
			color: '#e26901',
			userInfo: data,
			bigText: {
				text: body,
				contentTitle: title,
				summaryText: body,
			},
		});
	} else {
		PushNotificationIOS.presentLocalNotification({
			alertBody: body,
			alertTitle: title,
			isSilent: false,
			userInfo: data,
		});
	}
};

module.exports = {
	createLocationNotification,
};

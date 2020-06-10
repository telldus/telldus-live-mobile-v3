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
import firebase from 'react-native-firebase';

const PUSH_CHANNEL_ID = '1010101';

export interface LocalNotificationData {
    notificationId: string,
	title: string,
	body: string,
	data: Object,
}


const setChannel = () => {
	const channel = new firebase.notifications.Android.Channel(
		PUSH_CHANNEL_ID,
		'Tellus Local Notification',
		firebase.notifications.Android.Importance.Max)
		.setDescription('Telldus local notification when actions fail to execute on fence event.')
		.enableVibration(true)
		.setVibrationPattern([0.0, 1000.0, 500.0]);

	firebase.notifications().android.createChannel(channel);
};

const createLocationNotification = ({
	notificationId,
	title,
	body,
	data,
}: LocalNotificationData) => {

	if (Platform.OS === 'android') {
		setChannel();

		const localNotification = new firebase.notifications.Notification({
			sound: 'default',
			show_in_foreground: true,
		})
			.setNotificationId(notificationId)
			.setData(data)
			.android.setBigText(body, title, body)
			.android.setAutoCancel(true)
			.android.setCategory(firebase.notifications.Android.Category.Error)
			.android.setChannelId(PUSH_CHANNEL_ID)
			.android.setSmallIcon('icon_notif')
			.android.setColor('#e26901')
			.android.setDefaults(firebase.notifications.Android.Defaults.All)
			.android.setVibrate([0.0, 1000.0, 500.0])
			.android.setPriority(firebase.notifications.Android.Priority.High);
		firebase.notifications().displayNotification(localNotification);
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

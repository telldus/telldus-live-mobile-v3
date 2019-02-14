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

import { NativeModules } from 'react-native';

jest.mock('react-native-orientation-locker', () => {
	return {
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		lockToPortrait: jest.fn(),
		lockToLandscapeLeft: jest.fn(),
		lockToLandscapeRight: jest.fn(),
		unlockAllOrientations: jest.fn(),
	};
});

jest.mock('react-native-google-signin', () => {
	return {
		statusCodes: {
			SIGN_IN_CANCELLED: '',
			IN_PROGRESS: '',
			PLAY_SERVICES_NOT_AVAILABLE: '',
		},
	};
});

jest.mock('react-native-device-info', () => {
	return {
		getSystemVersion: jest.fn(),
	};
});

jest.mock('react-native-firebase', () => {
	return {
		crashlytics: jest.fn(),
		notifications: jest.fn(),
	};
});

global.window.addEventListener = () => null;

NativeModules.AndroidWidget = {
	configureWidgetAuthData: jest.fn(),
	configureWidgetSessionData: jest.fn(),
	disableAllWidgets: jest.fn(),
};

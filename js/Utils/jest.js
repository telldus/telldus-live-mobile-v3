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

global.window.addEventListener = (): null => null;
global.__DEV__ = true;

import { NativeModules } from 'react-native';

import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.mock('react-native-orientation-locker', (): Object => {
	return {
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		lockToPortrait: jest.fn(),
		lockToLandscapeLeft: jest.fn(),
		lockToLandscapeRight: jest.fn(),
		unlockAllOrientations: jest.fn(),
	};
});

jest.mock('@react-native-community/google-signin', (): Object => {
	return {
		statusCodes: {
			SIGN_IN_CANCELLED: '',
			IN_PROGRESS: '',
			PLAY_SERVICES_NOT_AVAILABLE: '',
		},
	};
});

jest.mock('react-native-device-info', (): Object => {
	return {
		getSystemVersion: jest.fn(),
		isTablet: jest.fn(),
		getUniqueId: jest.fn(),
	};
});

jest.mock('react-native-firebase', (): Object => {
	return {
		crashlytics: jest.fn(),
		notifications: jest.fn(),
	};
});

jest.mock('react-native-sensitive-info', (): Object => {
	return {
		setItem: jest.fn(),
		getItem: jest.fn(),
		deleteItem: jest.fn(),
		getAllItems: jest.fn(),
	};
});

jest.mock('reconnecting-websocket', (): Object => {
	class MockSocket {
		constructor(arg1: any, arg2: any, arg3: any) {
		}
	}
	return MockSocket;
});

NativeModules.AndroidWidget = {
	configureWidgetAuthData: jest.fn(),
	disableAllWidgets: jest.fn(),
};

jest.mock('@react-native-community/async-storage', (): Object => mockAsyncStorage);

jest.mock('@react-native-community/netinfo', (): Object => {
	return {};
});

jest.mock('axios', (): Object => {
	let mockAxios: Object = jest.fn((url: string, params?: Object): Promise<any> => Promise.resolve({ data: {} }));
	mockAxios.CancelToken = {
		source: jest.fn((): Object => {
			return {
				token: '',
				cancel: jest.fn(),
			};
		}),
	};
	mockAxios.isCancel = jest.fn((): boolean => {
		return false;
	});
	return mockAxios;
});

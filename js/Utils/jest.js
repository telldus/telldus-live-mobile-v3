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

import React from 'react';

global.window.addEventListener = (): null => null;
global.__DEV__ = true;

import { NativeModules } from 'react-native';

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

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

jest.mock('@react-native-google-signin/google-signin', (): Object => {
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
		getVersion: jest.fn(),
	};
});

jest.mock('@react-native-firebase/app', (): Object => {
	return {
	};
});

jest.mock('@react-native-firebase/analytics', (): Object => {
	return {
	};
});

jest.mock('@react-native-firebase/crashlytics', (): Object => {
	return {
	};
});

jest.mock('@react-native-firebase/messaging', (): Object => {
	return {
	};
});

jest.mock('@react-native-firebase/remote-config', (): Object => {
	return {
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

NativeModules.WidgetModule = {
	configureWidgetAuthData: jest.fn(),
	disableAllWidgets: jest.fn(),
};

NativeModules.RNFetchBlob = {
};

jest.mock('@react-native-async-storage/async-storage', (): Object => mockAsyncStorage);

jest.mock('@react-native-community/netinfo', (): Object => {
	return {};
});

jest.mock('react-native-background-geolocation', (): Object => {
	return {};
});

jest.mock('react-native-simple-toast', (): Object => {
	return {};
});

jest.mock('react-native-background-timer', (): Object => {
	return {};
});

jest.mock('@react-native-community/push-notification-ios', (): Object => {
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

jest.mock('sp-react-native-in-app-updates', (): Object => {
	return class InAppUpdates {
		constructor() {
		}
		addStatusUpdateListener() {
		}
		removeStatusUpdateListener() {
		}
		checkNeedsUpdate() {
		}
		startUpdate() {
		}
	};
});

jest.mock('react-native-snackbar', (): Object => {
	return {};
});
// NOTE: A work around for the issue -> https://github.com/rt2zz/redux-persist/issues/1243
import { combineReducers } from 'redux';
jest.mock('redux-persist', (): Object => {
	const real = jest.requireActual('redux-persist');
	return {
		...real,
		persistCombineReducers: jest
			.fn()
			.mockImplementation((config: Object, reducers: Function): Object => combineReducers(reducers)),
	};
});


jest.mock('react-native-safe-area-context', (): Object => {
	return {
		withSafeAreaInsets: (Elem: Object): Object => {
			return (props: Object): Object => {
				return <Elem
					{...props}
					insets={{
						left: 0,
					}}/>;
			};
		},
	};
});

jest.mock('react-native-localize', (): Object => {
	return {
		uses24HourClock: (): boolean => false,
		getLocales: (): Array<Object> => {
			return [
				{
					languageTag: 'en-En',
				},
			];
		},
	};
});


jest.mock('react-native-iap', (): Object => {
	return {
	};
});

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', (): Object => {
	return {
		...jest.requireActual('@react-navigation/native'),
		useNavigation: (): Object => ({
			navigate: mockedNavigate,
		}),
	};
});

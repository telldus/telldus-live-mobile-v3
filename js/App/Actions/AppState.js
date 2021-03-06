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
 *
 */

// @flow

'use strict';

import type { Action, ThunkAction } from './Types';

import { AppState } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { AccessibilityInfo } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { resetLocalControlSupport, autoDetectLocalTellStick, closeUDPSocket } from './Gateways';
import { initiateGatewayLocalTest } from './LocalTest';
import {
	setNetworkConnectionInfo,
} from './App';

module.exports = {
	appStart: (): Action => ({
		type: 'APP_START',
	}),
	appState: (): ThunkAction => {
		return (dispatch: Function): Function => {
			const initialAppState = AppState.currentState;
			if (initialAppState === 'active') {
				dispatch({
					type: 'APP_FOREGROUND',
				});
			}
			if (initialAppState === 'background') {
				dispatch({
					type: 'APP_BACKGROUND',
				});
			}

			function _handleAppStateChange(appState: string) {
				if (appState === 'active') {
					dispatch({
						type: 'APP_FOREGROUND',
					});
					dispatch(initiateGatewayLocalTest());
					dispatch(autoDetectLocalTellStick());
				}
				if (appState === 'background') {// background state is not persisted by redux-persist. Follow: https://github.com/rt2zz/redux-persist/issues/1097
					dispatch({
						type: 'APP_BACKGROUND',
					});
					dispatch(resetLocalControlSupport());
					closeUDPSocket();
				}
			}

			AppState.addEventListener('change', _handleAppStateChange);
			return (): Function => {
				AppState.removeEventListener('change', _handleAppStateChange);
			};
		};
	},

	appOrientation: (initialOrientation: string): ThunkAction => (dispatch: Function): Object => {
		Orientation.addOrientationListener((orientation: string): Object => {
			return dispatch({
				type: 'APP_ORIENTATION',
				value: orientation,
			});
		});
		return dispatch({
			type: 'APP_ORIENTATION',
			value: initialOrientation,
		});
	},
	setAppLayout: (layout: Object): ThunkAction => (dispatch: Function): Object => {
		return dispatch({
			type: 'APP_LAYOUT',
			payload: layout,
		});
	},
	setAccessibilityInfo: (status: boolean): ThunkAction => (dispatch: Function): Object => {
		return dispatch({
			type: 'ACCESSIBILITY_INFO',
			payload: status,
		});
	},
	setAccessibilityListener: (callback: Function): ?ThunkAction => (dispatch: Function): ?Object => {
		AccessibilityInfo.addEventListener(
			'change',
			(isEnabled: boolean): Object => {
				return dispatch(callback(isEnabled));
			}
		);
	},
	setChangeLogVersion: (changeLogVersion: string): ThunkAction => (dispatch: Function): Object => {
		return dispatch({
			type: 'SET_CHANGELOG_VERSION',
			payload: changeLogVersion,
		});
	},
	networkConnection: (): ThunkAction => (dispatch: Function): Function => {
		NetInfo.fetch().then((state: Object) => {
			dispatch(setNetworkConnectionInfo(state));
		});
		return NetInfo.addEventListener((state: Object) => {
			dispatch(setNetworkConnectionInfo(state));
		});
	},
};

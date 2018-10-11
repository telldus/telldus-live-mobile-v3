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

import { resetLocalControlSupport, autoDetectLocalTellStick, closeUDPSocket, initiateGatewayLocalTest } from './Gateways';

module.exports = {
	appStart: (): Action => ({
		type: 'APP_START',
	}),
	appState: (): ThunkAction => (dispatch: Function) => {
		AppState.addEventListener('change', (appState: string) => {
			if (appState === 'active') {
				dispatch({
					type: 'APP_FOREGROUND',
				});
				dispatch(initiateGatewayLocalTest());
				dispatch(autoDetectLocalTellStick());
			}
			if (appState === 'background') {
				dispatch({
					type: 'APP_BACKGROUND',
				});
				dispatch(resetLocalControlSupport());
				closeUDPSocket();
			}
		});
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
};

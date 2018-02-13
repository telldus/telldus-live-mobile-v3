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
 * @providesModule Actions_AppState
 */

// @flow

'use strict';

import type { Action, ThunkAction } from './Types';

import { AppState } from 'react-native';
import Orientation from 'react-native-orientation';
import { AccessibilityInfo } from 'react-native';

module.exports = {
	appStart: (): Action => ({
		type: 'APP_START',
	}),
	appState: (): ThunkAction => dispatch => {
		AppState.addEventListener('change', appState => {
			if (appState === 'active') {
				return dispatch({
					type: 'APP_FOREGROUND',
				});
			}
			if (appState === 'background') {
				return dispatch({
					type: 'APP_BACKGROUND',
				});
			}
		});
	},
	appOrientation: (initialOrientation: string): ThunkAction => dispatch => {
		Orientation.addOrientationListener((orientation: string) => {
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
	setAppLayout: (layout: Object): ThunkAction => dispatch => {
		return dispatch({
			type: 'APP_LAYOUT',
			payload: layout,
		});
	},
	setAccessibilityInfo: (status: boolean): ThunkAction => dispatch => {
		return dispatch({
			type: 'ACCESSIBILITY_INFO',
			payload: status,
		});
	},
	setAccessibilityListener: (callback: Function): ThunkAction => dispatch => {
		AccessibilityInfo.addEventListener(
			'change',
			(isEnabled: boolean) => {
				return dispatch(callback(isEnabled));
			}
		);
	},
	setChangeLogVersion: (changeLogVersion: string): ThunkAction => dispatch => {
		return dispatch({
			type: 'SET_CHANGELOG_VERSION',
			payload: changeLogVersion,
		});
	},
};

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

import firebase from 'react-native-firebase';

import type { ThunkAction, Action } from './Types';

import {
	deployStore,
} from '../../Config';

const remoteConfigs = [
	'geoFenceFeature',
	'premiumPurchase',
];

const fetchRemoteConfig = (): ThunkAction => {
	return async (dispatch: Function, getState: Function): Promise<any> => {
		if (deployStore === 'huawei') {
			return;
		}

		if (__DEV__) {
			firebase.config().enableDeveloperMode();
		}

		// Set default values
		firebase.config().setDefaults({
			geoFenceFeature: {
				enable: false,
			},
			premiumPurchase: {
				enable: false,
			},
		});

		return firebase.config().fetch(0)
			.then((): any => {
				return firebase.config().activateFetched();
			})
			.then((activated: boolean): any => {
				if (!activated) {
					// Fetched data not activated
				}
				return firebase.config().getValues(remoteConfigs);
			})
			.then((objects: Object) => {
				let data = {};
				Object.keys(objects).forEach((key: string) => {
					data[key] = objects[key].val();
				});
				dispatch(setRemoteConfigs(data));
				return;
			})
			.catch((): any => {
				return;
			});
	};
};

const setRemoteConfigs = (data: Object): Action => {
	return {
		type: 'SET_FIREBASE_REMOTE_CONFIG',
		payload: data,
	};
};

module.exports = {
	fetchRemoteConfig,
	setRemoteConfigs,
};

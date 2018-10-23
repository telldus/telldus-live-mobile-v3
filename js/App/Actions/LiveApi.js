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

import type { ThunkAction } from './Types';

import { getGateways } from './Gateways';
import { getJobs } from './Jobs';
import { getDevices } from './Devices';
import { getSensors } from './Sensors';

import { AppState } from 'react-native';

type Tab = 'Sensors' | 'Scheduler' | 'Gateways';

function syncLiveApiOnForeground(): ThunkAction {
	return (dispatch: Function) => {
		AppState.addEventListener('change', (appState: string) => {
			if (appState === 'active') {
				console.log('app active, fetching devices');
				dispatch(getDevices());
			}
		});
	};
}

// NOTE: Devices are retrieved upon syncLiveApiOnForeground and via socket messages
function syncWithServer(nextTab: Tab): ThunkAction {
	return (dispatch: Function, getState: Function) => {
		const { liveApi } = getState();
		if (nextTab === 'Sensors' && !liveApi.sensors) {
			dispatch({
				type: 'LIVEAPI_REFETCH',
				endpoint: 'sensors',
			});
			dispatch(getSensors());
		}
		if (nextTab === 'Scheduler' && !liveApi.jobs) {
			dispatch({
				type: 'LIVEAPI_REFETCH',
				endpoint: 'jobs',
			});
			dispatch(getJobs());
		}
		if (nextTab === 'Gateways' && !liveApi.gateways) {
			dispatch({
				type: 'LIVEAPI_REFETCH',
				endpoint: 'gateways',
			});
			dispatch(getGateways());
		}
	};
}

module.exports = {
	syncLiveApiOnForeground,
	syncWithServer,
};

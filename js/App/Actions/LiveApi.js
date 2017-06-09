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
 * @providesModule Actions_LiveApi
 */

// @flow

'use strict';

import type { ThunkAction } from './types';


import { getGateways } from './Gateways';
import { getJobs } from './Jobs';
import { getDevices } from 'Actions_Devices';
import { getSensors } from 'Actions_Sensors';

import { AppState } from 'react-native';

type Tab = 'sensorsTab' | 'schedulerTab' | 'gatewaysTab';

function syncLiveApiOnForeground(): ThunkAction {
  return dispatch => {
    AppState.addEventListener('change', appState => {
      if (appState === 'active') {
        console.log('app active, fetching devices');
        dispatch(getDevices());
      }
    });
  };
}

// NOTE: Devices are retrieved upon syncLiveApiOnForeground and via socket messages
function syncWithServer(nextTab: Tab): ThunkAction {
  return (dispatch, getState) => {
    const { liveApi } = getState();
    if (nextTab === 'sensorsTab' && !liveApi.sensors) {
      dispatch({
        type: 'LIVEAPI_REFETCH',
        endpoint: 'sensors',
      });
      return dispatch(getSensors());
    }
    if (nextTab === 'schedulerTab' && !liveApi.jobs) {
      dispatch({
        type: 'LIVEAPI_REFETCH',
        endpoint: 'jobs',
      });
      return dispatch(getJobs());
    }
    if (nextTab === 'gatewaysTab' && !liveApi.gateways) {
      dispatch({
        type: 'LIVEAPI_REFETCH',
        endpoint: 'gateways',
      });
      return dispatch(getGateways());
    }
  };
}

module.exports = {
  syncLiveApiOnForeground,
  syncWithServer,
};

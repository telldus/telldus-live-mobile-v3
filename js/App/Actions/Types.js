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
 * @providesModule Actions_Types
 */
// @flow
'use strict';

export type Action =
      { type: 'LOGGED_IN' }
    | { type: 'RECEIVED_ACCESS_TOKEN', accessToken: Object }
    | { type: 'RECEIVED_USER_PROFILE', payload: Object }
    | { type: 'RECEIVED_DEVICES', payload: Object }
    | { type: 'RECEIVED_GATEWAYS', payload: Object }
    | { type: 'RECEIVED_SENSORS', payload: Object }
    | { type: 'RECEIVED_JOBS', payload: Object }
    | { type: 'LOGGED_OUT' }
    | { type: 'SWITCH_TAB', tab: 'dashboardTab' | 'devicesTab' | 'sensorsTab' | 'schedulerTab' | 'locationsTab' }
    | { type: 'TOGGLE_EDIT_MODE', tab: 'sensorsTab' | 'devicesTab' }

    | { type: 'ADD_TO_DASHBOARD', kind: 'device' | 'sensor', id: number }
    | { type: 'REMOVE_FROM_DASHBOARD', kind: 'device' | 'sensor', id: number }

    | { type: 'CHANGE_SENSOR_DISPLAY_TYPE', id:number, displayType: string }
    | { type: 'SHOW_DIMMER_POPUP', name:string, value:number }
    | { type: 'HIDE_DIMMER_POPUP'}
    | { type: 'SET_DIMMER_VALUE', payload: Object }
    | { type: 'DEVICE_SET_STATE', payload: Object }
    | { type: 'DEVICE_WEBSOCKET_UNHANDLED', payload: Object }
    | { type: 'ERROR', message: Object }

    | { type: 'DEVICE_TURN_ON', payload: Object }
    | { type: 'DEVICE_TURN_OFF', payload: Object }
    | { type: 'DEVICE_BELL', payload: Object }
    | { type: 'DEVICE_UP', payload: Object }
    | { type: 'DEVICE_DOWN', payload: Object }
    | { type: 'DEVICE_STOP', payload: Object }
    | { type: 'DEVICE_LEARN', payload: Object }
    | { type: 'DEVICE_DIM', deviceId:number, payload: Object }

    | { type: 'LIVEAPI_REFETCH', endpoint: 'sensors' | 'jobs' | 'gateways' }

    | { type: 'SENSOR_UPDATE_VALUE', payload: Object }
    | { type: 'SENSOR_WEBSOCKET_UNHANDLED', payload: Object }
    | { type: 'SESSION_ID_AUTHENTICATED', payload: Object }
    | { type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS', gatewayId: number, payload: Object }
    | { type: 'GATEWAY_WEBSOCKET_OPEN', gatewayId: number }
    | { type: 'GATEWAY_WEBSOCKET_CLOSED', gatewayId: number }
    | { type: 'APP_START' }
    | { type: 'APP_FOREGROUND' }
    | { type: 'APP_BACKGROUND' }
    ;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;

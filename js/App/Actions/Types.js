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

export type Action =
	  { type: 'LOGGED_IN' }
	| { type: 'RECEIVED_ACCESS_TOKEN', accessToken: Object }
	| { type: 'RECEIVED_ACCESS_TOKEN_OTHER_ACCOUNT', accessToken: Object }
	| { type: 'RECEIVED_PUSH_TOKEN', pushToken: string }
	| { type: 'RECEIVED_USER_PROFILE', payload: Object }
	| { type: 'RECEIVED_USER_PROFILE_OTHER', payload: Object }
	| { type: 'RECEIVED_DEVICES', payload: Object }
	| { type: 'RECEIVED_GATEWAYS', payload: Object }
	| { type: 'RECEIVED_SENSORS', payload: Object }
	| { type: 'RECEIVED_JOBS', payload: Object }
	| { type: 'PUSH_TOKEN_REGISTERED', token: string, payload: Object }
	| { type: 'PUSH_TOKEN_UNREGISTERED', token: string, payload: Object }
	| { type: 'PUSH_TOKEN_DELETED', token: string, payload: Object }
	| { type: 'LOGGED_OUT' }
	| { type: 'LOGGED_OUT_SELECTED', payload: Object }
	| { type: 'LOCK_SESSION' }
	| { type: 'SET_NETWORK_CONNECTION_INFO', payload: Object }
	| { type: 'SWITCH_USER_ACCOUNT', payload: Object }
	| { type: 'TOGGLE_VISIBILITY_SWITCH_ACCOUNT_AS', payload: Object }

	| { type: 'GENERATE_PUSH_TOKEN_ERROR', generatePushError: string }
	| { type: 'PLAY_SERVICES_INFO', payload: Object }

	| { type: 'CHANGE_SCREEN', screen: string }
	| { type: 'TOGGLE_EDIT_MODE', tab: 'sensorsTab' | 'devicesTab' }

	| { type: 'HIDE_TAB', payload: {
		tab: string,
		userId: string,
	} }
	| { type: 'UNHIDE_TAB', payload: {
		tab: string,
		userId: string,
	} }
	| { type: 'CHANGE_DEFAULT_START_SCREEN', payload: {
		screenKey: string,
		userId: string,
	} }

	| { type: 'ADD_TO_DASHBOARD', payload: {
		kind: 'device' | 'sensor',
		id: number,
		userId: string,
		dashboardId: string,
	}}
	| { type: 'REMOVE_FROM_DASHBOARD', payload: {
		kind: 'device' | 'sensor',
		id: number,
		userId: string,
		dashboardId: string,
	}}

	| { type: 'CHANGE_SENSOR_DISPLAY_TYPE', id: number, displayType: string }
	| { type: 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE', id: number, displayType: string }
	| { type: 'CHANGE_SENSOR_DEFAULT_DISPLAY_TYPE_DB', id: number, displayTypeDB: string }

	| { type: 'CHANGE_SENSOR_DEFAULT_HISTORY_SETTINGS', id: number, historySettings: Object }
	| { type: 'SHOW_DIMMER_POPUP', name: string, value: number }
	| { type: 'HIDE_DIMMER_POPUP' }
	| { type: 'SET_DIMMER_VALUE', payload: Object }
	| { type: 'DEVICE_SET_STATE', payload: Object }
	| { type: 'DEVICE_WEBSOCKET_UNHANDLED', payload: Object }
	| { type: 'ERROR', message: Object }

	| { type: 'DEVICE_TURN_ON', payload: Object }
	| { type: 'DEVICE_TURN_OFF', payload: Object }
	| { type: 'DEVICE_UNREACHABLE', payload: Object }
	| { type: 'DEVICE_RESET_STATE', payload: Object }
	| { type: 'DEVICE_BELL', payload: Object }
	| { type: 'DEVICE_UP', payload: Object }
	| { type: 'DEVICE_DOWN', payload: Object }
	| { type: 'DEVICE_STOP', payload: Object }
	| { type: 'DEVICE_LEARN', payload: Object }
	| { type: 'DEVICE_DIM', deviceId: number, payload: Object }

	| {type: 'SAVE_DIMMER_INITIAL_STATE', payload: Object}

	| { type: 'DEVICE_HISTORY', payload: Object }

	| { type: 'LIVEAPI_REFETCH', endpoint: 'sensors' | 'jobs' | 'gateways' }

	| { type: 'SENSOR_UPDATE_VALUE', payload: Object }
	| { type: 'SENSOR_WEBSOCKET_UNHANDLED', payload: Object }
	| { type: 'SESSION_ID_AUTHENTICATED', payload: Object }
	| { type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS', gatewayId: string, payload: Object }
	| { type: 'GATEWAY_WEBSOCKET_OPEN', gatewayId: string }
	| { type: 'GATEWAY_WEBSOCKET_CLOSED', gatewayId: string }
	| { type: 'APP_START' }
	| { type: 'APP_FOREGROUND' }
	| { type: 'APP_BACKGROUND' }

	| { type: 'TOAST_SHOW', payload: Object }
	| { type: 'TOAST_HIDE' }
	| { type: 'APP_ORIENTATION', value: string }
	| { type: 'APP_LAYOUT', payload: Object }
	| { type: 'ACCESSIBILITY_INFO', payload: boolean }
	| { type: 'SET_CHANGELOG_VERSION', payload: string }

	| { type: 'TOAST_SHOW', payload: Object }
	| { type: 'TOAST_HIDE' }

	| { type: 'REQUEST_TURNON', payload: Object }
	| { type: 'REQUEST_TURNOFF', payload: Object }

	| { type: 'REQUEST_MODAL_OPEN', payload: Object }
	| { type: 'REQUEST_MODAL_CLOSE', payload?: Object }
	| { type: 'REQUEST_MODAL_CLEAR_DATA'}

	| { type: 'USER_REGISTER', accessToken: Object }
	| { type: 'SCHEDULE_SELECT_DEVICE', payload: Object }
	| { type: 'SCHEDULE_RESET' }
	| { type: 'SCHEDULE_EDIT', payload: Object }
	| { type: 'SCHEDULE_SELECT_ACTION', payload: Object }
	| { type: 'SCHEDULE_SELECT_TIME', payload: Object }
	| { type: 'SCHEDULE_SELECT_DAYS', payload: Object }
	| { type: 'SCHEDULE_SET_ACTIVE_STATE', payload: Object }

	| { type: 'ADD_GATEWAY_REQUEST', payload: Object }
	| { type: 'ADD_GATEWAY_DECLINE' }
	| { type: 'GATEWAY_API_LOCAL_CONTROL_TOKEN_SUCCESS', payload: Object }
	| { type: 'GATEWAY_API_LOCAL_CONTROL_TOKEN_ERROR', payload: Object }
	| { type: 'GATEWAY_AUTO_DETECT_LOCAL_SUCCESS', payload: Object }
	| { type: 'GATEWAY_RESET_LOCAL_CONTROL_SUPPORT' }
	| { type: 'VALIDATE_LOCAL_CONTROL_SUPPORT', payload: Object }
	| { type: 'RESET_LOCAL_CONTROL_ADDRESS', gatewayId: number, payload: Object }
	| { type: 'persist/REHYDRATE', payload: Object }
	| { type: 'TOGGLE_SUPPORT_LOCAL', gatewayId: number, payload: Object }

	| { type: 'ACCEPT_EULA_SUCCESS', version: number }
	| { type: 'ACCEPT_EULA_ERROR' }

	| { type: 'SHOW_CHANGE_LOG' }
	| { type: 'HIDE_CHANGE_LOG' }

	| { type: 'TOGGLE_INACTIVE_VISIBILITY', payload: Object }

	| { type: 'RECEIVED_PHONES_LIST', payload: Array<Object> }

	| { type: 'RECEIVED_USER_SUBSCRIPTIONS', payload: Object }
	| { type: 'RECEIVED_USER_SUBSCRIPTIONS_OTHER', payload: Object }
	| { type: 'SET_SOCIAL_AUTH_CONFIG', payload: Object }

	| { type: 'CAMPAIGN_VISITED', payload: boolean }

	| { type: 'TOGGLE_DIALOGUE_BOX_STATE', payload: Object }
	| { type: 'SET_FIREBASE_REMOTE_CONFIG', payload: Object }

	| { type: 'SET_FENCE_AREA', payload: Object }
	| { type: 'SET_FENCE_ARRIVING_ACTIONS', payload: Object }
	| { type: 'SET_FENCE_LEAVING_ACTIONS', payload: Object }
	| { type: 'SET_FENCE_ACTIVE_TIME', payload: Object }
	| { type: 'SET_FENCE_TITLE', payload: Object }
	| { type: 'SAVE_FENCE', payload: Object }
	| { type: 'SET_CURRENT_LOCATION', payload: Object }
	| { type: 'SET_EDIT_FENCE', payload: Object }
	| { type: 'DELETE_FENCE', payload: Object }
	| { type: 'UPDATE_FENCE', payload: Object }
	| { type: 'SET_FENCE_IDENTIFIER', payload: string }
	| { type: 'RESET_FENCE', payload: Object }
	| { type: 'CLEAR_FENCES', payload: Object }

	| { type: 'SET_FIREBASE_REMOTE_CONFIG', payload: Object }

	| { type: 'TOGGLE_VISIBILITY_EXCHANGE_OFFER', payload: 'show' | 'hide_temp' | 'hide_perm' | 'force_show' }
	| { type: 'TOGGLE_VISIBILITY_PRO_EXPIRE_HEADSUP', payload: 'show' | 'hide_temp' | 'hide_perm' | 'force_show' }
	| { type: 'TOGGLE_VISIBILITY_EULA', payload: boolean }

	| { type: 'SELECT_DASHBOARD', payload: Object }

	| { type: 'CLEAR_APP_DATA' }
	| { type: 'RECEIVED_IN_APP_PURCHASE_PRODUCTS', payload: Array<Object> }
	| { type: 'UPDATE_STATUS_IAP_TRANSACTION', payload: Object }
	| { type: 'RECEIVED_IN_APP_AVAILABLE_PURCHASES', payload: Array<Object> }

	| { type: 'DEBUG_GF_EVENT_ONGEOFENCE', payload: Object }
	| { type: 'DEBUG_GF_SET_CHECKPOINT', payload: Object }
	| { type: 'CLEAR_ON_GEOFENCE_LOG' }
	| { type: 'UPDATE_GEOFENCE_CONFIG', payload: Object }
	;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;

export type GrantType = 'password' | 'google' | 'refresh_token';

export type TicketData = {|
	email: string,
	message: string,
	failedTests: string,
	router: string,
	connectionType: string,
	connectionEffectiveType: string,
	testCount: number,
|};

export type Schedule = {
	id: number,
	deviceId: number,
	method: number,
	methodValue: number,
	type: string,
	hour: number,
	minute: number,
	offset: number,
	randomInterval: number,
	active: boolean,
	weekdays: number[],
	retries: number,
	retryInterval: number,
	reps: number,
	edit: boolean,
};

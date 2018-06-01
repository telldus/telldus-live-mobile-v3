import { deviceSetState, requestDeviceAction } from '../../Actions/Devices';
import { configureStore } from '../../Store/ConfigureStore';
import { supportedMethods } from '../../../Config';

import fetchMock from 'fetch-mock';
import moment from 'moment';

jest.useFakeTimers();

describe('Test device actions', ()=>{
	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};

	beforeEach(() => {
		store = configureStore();
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
		store.dispatch({type: 'RECEIVED_GATEWAYS', payload: {
			client: [{
				id: '1',
				uuid: null,
				name: null,
				websocketAddress: {
					address: null,
					instance: null,
					port: null,
				},
				websocketOnline: false,
				websocketConnected: false,
				localKey: {
					key: null,
					ttl: moment().add('days', 30),
					uuid: null,
					address: null,
					port: null,
					macAddress: null,
					supportLocal: false,
				},
			}],
		}});
		store.dispatch({type: 'RECEIVED_DEVICES', payload: {
			device: [{
				id: '1',
				methods: 3,
				state: 2,
				client: '1',
				clientDeviceId: '1',
			}],
		}});
		fetchMock.reset();
		fetchMock.mock('glob:*/oauth2/device/command?id=1&method=1&value=null', '{"status": "success"}', {
			name: 'deviceCommand',
			overwriteRoutes: true,
		});
		fetchMock.mock(`glob:*/oauth2/device/info?id=1&supportedMethods=${supportedMethods}`, {
			'state': 2,
		}, {
			name: 'deviceInfo',
			overwriteRoutes: true,
		});
	});

	it('check action with success from api and websocket returning new state', () => {
		return store.dispatch(deviceSetState(1, 1))
			.then(() => {
				// Send new status through websocket connection
				store.dispatch({type: 'DEVICE_SET_STATE', payload: {deviceId: 1, method: 1}});
			})
			.then(() => {
				expect(store.getState().devices.byId['1'].isInState).toBe('TURNON');
				expect(fetchMock.calls('deviceCommand').length).toBe(1);
				expect(fetchMock.calls('deviceInfo').length).toBe(0);
			});
	});
	it('check action with api when web socket does not update', () => {
		return store.dispatch(deviceSetState(1, 1))
			.then(() => {
				jest.runAllTimers();
				// SET new state after checking with API
				store.dispatch({type: 'DEVICE_SET_STATE', payload: {deviceId: 1, method: 1}});
			})
			.then(() => {
				expect(store.getState().devices.byId['1'].isInState).toBe('TURNON');
				expect(fetchMock.calls('deviceCommand').length).toBe(1);
				expect(fetchMock.calls('deviceInfo').length).toBe(1);
			});
	});
	it('check action with api when web socket does not update', () => {
		return store.dispatch(deviceSetState(1, 1))
			.then(() => {
				jest.runAllTimers();
				// RESET to previous state after checking with API.
				store.dispatch({type: 'DEVICE_RESET_STATE', payload: {deviceId: 1, state: 'TURNOFF'}});
			})
			.then(() => {
				expect(store.getState().devices.byId['1'].isInState).toBe('TURNOFF');
				expect(fetchMock.calls('deviceCommand').length).toBe(1);
				expect(fetchMock.calls('deviceInfo').length).toBe(1);
			});
	});


	it('check requestDeviceAction', () => {
		const DeviceId = 37;
		const Method = 10;
		const expectedAction = {
			type: 'REQUEST_DEVICE_ACTION',
			payload: {
				deviceId: DeviceId,
				method: Method,
			}};
		expect(requestDeviceAction( DeviceId, Method)).toEqual(expectedAction);

	});

});

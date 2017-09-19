import { deviceSetState } from 'Actions_Devices';
import { configureStore } from '../Store/ConfigureStore';

import fetchMock from 'fetch-mock';

describe('Test device actions', ()=>{
	let store;

	beforeEach(() => {
		store = configureStore();
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken: 'bajs'});
		store.dispatch({type: 'RECEIVED_DEVICES', payload: {
			device: [{
				id: '1',
				methods: 3,
				state: 2,
			}],
		}});
		fetchMock.reset();
		fetchMock.mock('glob:*/oauth2/device/command?id=1&method=1&value=null', '{"status": "success"}', {
			name: 'deviceCommand',
		});
		fetchMock.mock('glob:*/oauth2/device/info?id=1&supportedMethods=951', {
			'state': 2,
		}, {
			name: 'deviceInfo',
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
});

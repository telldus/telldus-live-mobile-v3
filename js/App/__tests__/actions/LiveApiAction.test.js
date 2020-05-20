import { syncLiveApiOnForeground, syncWithServer } from '../../Actions/LiveApi';
import { configureStore } from '../../Store/ConfigureStore';
import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('(LiveApi) syncWithServer', () => {

	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};

	beforeEach(() => {
		store = configureStore().store;
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
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
			overwriteRoutes: true,
		});
		fetchMock.mock('glob:*/oauth2/device/info?id=1&supportedMethods=951', {
			'state': 2,
		}, {
			name: 'deviceInfo',
			overwriteRoutes: true,
		});
	});


	it('check syncWithServer', () => {
		store = configureStore().store;
		// Send new status through websocket connection
		store.dispatch(syncWithServer('Sensors'));
		expect(store.getState().liveApi.sensors).toBe(true);
	});

	it('check syncLiveApiOnForeground', () => {
		store = configureStore().store;
		store.dispatch(syncLiveApiOnForeground());
		expect(store.getState().devices.byId['1'].isInState).toBe('TURNOFF');
		expect(store.getState().liveApi.sensors).toBe(true);
	});
});

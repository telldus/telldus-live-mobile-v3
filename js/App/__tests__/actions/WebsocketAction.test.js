import { connectToGateways, getWebsocketAddress, destroyAllConnections, authenticateSession } from '../../Actions/Websockets';
import { configureStore } from '../../Store/ConfigureStore';

import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test websocket actions', ()=>{
	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};

	beforeEach(() => {
		store = configureStore();
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
		});
		fetchMock.mock('glob:*/oauth2/device/info?id=1&supportedMethods=951', {
			'state': 2,
		}, {
			name: 'deviceInfo',
		});
	});

	it('check websocket action authenticateSession', () => {
  const   session = { sessionId: 333, ttl: 'ksr' }
		  store.dispatch(authenticateSession())
			// Send new status through websocket connection
     store.dispatch({type: 'SESSION_ID_AUTHENTICATED', payload:session});
    expect(store.getState().websockets.session.id).toBe(333);
    expect(store.getState().websockets.session.ttl).toBe("ksr");
	});

});

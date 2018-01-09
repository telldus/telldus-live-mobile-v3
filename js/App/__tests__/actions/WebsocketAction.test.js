import { authenticateSession } from '../../Actions/Websockets';
import { configureStore } from '../../Store/ConfigureStore';

// import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test websocket actions', ()=>{
	let store = configureStore();

	it('check websocket action authenticateSession', () => {
		const session = { sessionId: 333, ttl: 'ksr' };
		  store.dispatch(authenticateSession());
		// Send new status through websocket connection
		store.dispatch({type: 'SESSION_ID_AUTHENTICATED', payload: session});
		expect(store.getState().websockets.session.id).toBe(333);
		expect(store.getState().websockets.session.ttl).toBe('ksr');
	});

});

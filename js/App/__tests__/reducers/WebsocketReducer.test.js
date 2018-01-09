import reducer from '../../Reducers/Websockets.js';
jest.useFakeTimers();

describe('Test Websocket reducers', ()=>{

	it('check Websocket reducers initial state', () => {
		 const State = { session: { id: undefined, ttl: undefined }};
		expect(reducer(undefined, {})).toEqual(State);
	});

	it('check Websocket reducers after state changes', () => {
		const State = { session: { id: 333, ttl: 'ksr' }};
		const action = {
			type: 'SESSION_ID_AUTHENTICATED',
			payload: { sessionId: 333, ttl: 'ksr', websockets: State },
		};
		expect(reducer( {}, action )).toEqual(State);
	});

	it('check Websocket reducers after logout return initial state', () => {
		const State = { session: { id: undefined, ttl: undefined }};
		const action = {
			type: 'LOGGED_OUT',
		};
		expect(reducer({}, action)).toEqual(State);
	});

	it('check Websocket reducers REHYDRATE', () => {
		const State = { session: { id: 555, ttl: 'rk' }};
		const action = {
			type: 'REHYDRATE',
			payload: { websockets: State },
		};
		expect(reducer( State, action )).toEqual(State);
	});


});

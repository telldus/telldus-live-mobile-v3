import reducer from '../../Reducers/LiveApi.js';
jest.useFakeTimers();

describe('Test LiveApi reducers', ()=>{
	const initialState = {
		sensors: false,
		jobs: false,
		gateways: false,
	};
	it('check LiveApi reducers initial state', () => {

		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check LiveApi reducers app foreground', () => {
		const action = {
			type: 'APP_FOREGROUND',
		};
		expect(reducer( {}, action )).toEqual(initialState);
	});

	it('check Liveapi reducers after live api refetch', () => {
		const State = { true: true};
		const action = {
			type: 'LIVEAPI_REFETCH',
			endpoint: true,
		};
		expect(reducer({}, action)).toEqual(State);
	});

	it('check Liveapi reducers after logout sholud return empty object', () => {
		const state = {};
		const action = {
			type: 'LOGGED_OUT',
		};
		expect(reducer( {}, action )).toEqual(state);
	});


});

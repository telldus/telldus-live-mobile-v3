import reducer from '../../Reducers/Navigation.js';
jest.useFakeTimers();


const initialState = {
	screen: 'Dashboard',
};


describe('Test Navigation reducers', ()=>{

	it('check Navigation reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check navigation reducers after switching screen', () => {
		const State = { screen: 'Sensors' };
		const action = {
			type: 'CHANGE_SCREEN',
			screen: 'Sensors',
		};
		expect(reducer( {}, action )).toEqual(State);
	});

	it('check navigation reducers after logout', () => {
		const action = {
			type: 'LOGGED_OUT',
		};
		expect(reducer({}, action)).toEqual(initialState);
	});

});

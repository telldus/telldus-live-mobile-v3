import reducer from '../../Reducers/Navigation.js';
jest.useFakeTimers();


const initialState = {
	tab: 'Dashboard',
};


describe('Test Navigation reducers', ()=>{

	it('check Navigation reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check navigation reducers after switching tab', () => {
		const State = { tab: 'Sensors' };
		const action = {
			type: 'SWITCH_TAB',
			tab: 'Sensors',
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

import reducer from '../../Reducers/Tabs.js';
jest.useFakeTimers();

const initialState = {
	editModeSensorsTab: false,
	editModeDevicesTab: false,
};
describe('Test Tab reducers', ()=>{

	it('check Tab reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check tab reducers after toggle edit mode', () => {
		const State = { editModeSensorsTab: true };
		const state = { editModeDevicesTab: true };
		const Action = {
			type: 'TOGGLE_EDIT_MODE',
			tab: 'sensorsTab',
		};
		expect(reducer( {}, Action )).toEqual(State);

		const action = {
			type: 'TOGGLE_EDIT_MODE',
			tab: 'devicesTab',
		};
		expect(reducer( {}, action )).toEqual(state);
	});

	it('check Tab reducers after logout should return initial state', () => {
		const action = {
			type: 'LOGGED_OUT',
		};
		expect(reducer({}, action)).toEqual(initialState);
	});

	it('check Tab reducers after app start should return initial state', () => {
		const action = {
			type: 'APP_START',
		};
		expect(reducer({}, action)).toEqual(initialState);
	});

});

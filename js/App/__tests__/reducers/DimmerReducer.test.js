import reducer from '../../Reducers/Dimmer.js';

const initial = {
	deviceId: 0,
	initialState: '',
	initialValue: 0,
	name: 'N/A',
	show: false,
	value: 0,
};

describe('Dimmer reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initial);
	});

	it('should return show dimmer popup', () => {
		const state = {
			name: 'telldus',
			value: 333,
			show: true,
	 };
		const action = {
			type: 'SHOW_DIMMER_POPUP',
			name: 'telldus',
			value: 333,
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should return hide dimmer popup', () => {
		const state = {
			show: false,
	 };
		const action = {
			type: 'HIDE_DIMMER_POPUP',
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should return save dimmer initial state', () => {
		const state = {
			initialValue: 3,
			initialState: 'tell',
			deviceId: 12345,
	 };
		const action = {
			type: 'SAVE_DIMMER_INITIAL_STATE',
			payload: {
				initialValue: 3,
				initialState: 'tell',
				deviceId: 12345,
			},
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('should return hide dimmer popup', () => {
		const state = {
			value: 5,
	 };
		const action = {
			type: 'SET_DIMMER_VALUE',
			payload: {
				value: 5,
			},
		};
		expect(reducer({}, action)).toEqual(state);
	});


});

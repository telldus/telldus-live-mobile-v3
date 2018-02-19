import reducer from '../../Reducers/Modal.js';

const initial = {
	openModal: false,
	data: '',
	extras: false,
};

describe('Modal reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initial);
	});

	it('should handle request modal close', () => {
		const action = {
			type: 'REQUEST_MODAL_CLOSE',
			openModal: true,
		};
		const state = {
			openModal: false,
			data: 'telldus',
			extras: true,
		};
		expect(reducer(state, action)).toEqual(state);
	});

	it('should handle request modal open', () => {
		const action = {
			type: 'REQUEST_MODAL_OPEN',
			openModal: true,
			payload: {
				data: 'ksr',
				extras: false,
			},
		};
		const state = {
			openModal: true,
			data: 'ksr',
			extras: false,
		};
		expect(reducer({}, action)).toEqual(state);
	});

	it('check modal reducers after requset modal clear data', () => {
		const action = {
			type: 'REQUEST_MODAL_CLEAR_DATA',
		};
		expect(reducer({}, action)).toEqual(initial);
	});

});

import reducer from '../../Reducers/Devices.js';

jest.useFakeTimers();

const initialState = {allIds: [], byId: {}};

describe('Test Devices reducers', ()=>{

	it('check devices reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check devices reducers', () => {
		const data = {
			allIds: [1, 2, 3, 4, 5],
			byId: {ID: 'tell123'},
		};
		const type = {};
		expect(reducer(data, type)).toEqual(data);
	});
});

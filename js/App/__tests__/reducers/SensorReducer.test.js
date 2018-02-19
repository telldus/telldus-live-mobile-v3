import reducer from '../../Reducers/Sensors.js';
jest.useFakeTimers();

const initialState = {allIds: [], byId: {}};

describe('Test Sensor reducers', ()=>{

	it('check Sensor reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check sensor reducers', () => {

		const sensors = {
			allIds: [1, 2, 3, 4],
			byId: [5, 6, 7],
		};
		const gateways = {};
		const editmode = true;
		expect(reducer(sensors, gateways, editmode)).toEqual(sensors);
	});

});

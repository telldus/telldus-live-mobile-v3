import {parseSensorsForListView} from '../../Reducers/Sensors.js';
jest.useFakeTimers();

const initialState = {hiddenList: [], visibleList: []};

describe('Test Sensor reducers', ()=>{

	it('check Sensor reducers initial state', () => {
		expect(parseSensorsForListView(undefined, {})).toEqual(initialState);
	});
});

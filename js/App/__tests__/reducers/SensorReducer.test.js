import {parseSensorsForListView} from '../../Reducers/Sensors.js';
jest.useFakeTimers();

import Theme from '../../Theme';

const toggleHiddenButtonRow = {
	header: Theme.Core.buttonRowKey,
	data: [{
		buttonRow: true,
		id: Theme.Core.buttonRowKey,
	}],
};
const initialState = {hiddenList: [], visibleList: [toggleHiddenButtonRow]};

describe('Test Sensor reducers', ()=>{

	it('check Sensor reducers initial state', () => {
		expect(parseSensorsForListView(undefined, {})).toEqual(initialState);
	});
});

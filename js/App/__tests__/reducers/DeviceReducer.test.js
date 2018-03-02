import { parseDevicesForListView } from '../../Reducers/Devices.js';

jest.useFakeTimers();

const initialState = { hiddenList: [], visibleList: []};

describe('Test Devices reducers', ()=>{

	it('check devices reducers initial state', () => {
		expect(parseDevicesForListView(undefined, {})).toEqual(initialState);
	});
});

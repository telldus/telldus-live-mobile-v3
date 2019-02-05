import { parseDevicesForListView } from '../../Reducers/Devices.js';
import Theme from '../../Theme';

jest.useFakeTimers();

const toggleHiddenButtonRow = {
	header: Theme.Core.buttonRowKey,
	data: [{
		buttonRow: true,
		id: Theme.Core.buttonRowKey,
	}],
};
const initialState = {hiddenList: [], visibleList: [toggleHiddenButtonRow]};

describe('Test Devices reducers', ()=>{

	it('check devices reducers initial state', () => {
		expect(parseDevicesForListView(undefined, {})).toEqual(initialState);
	});
});

import { parseDevicesForListView } from '../../Reducers/Devices.js';
import Theme from '../../Theme';

jest.useFakeTimers();

const toggleHiddenButtonRow = {
	key: Theme.Core.buttonRowKey,
	data: [{
		buttonRow: true,
	}],
};
const initialState = {hiddenList: [], visibleList: [toggleHiddenButtonRow]};

describe('Test Devices reducers', ()=>{

	it('check devices reducers initial state', () => {
		expect(parseDevicesForListView(undefined, {})).toEqual(initialState);
	});
});

import {parseJobsForListView} from '../../Reducers/Jobs.js';

jest.useFakeTimers();

const initialState = { sectionIds: [], sections: {'0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': []} };

describe('Test jobs reducers', ()=>{

	it('check parseJobsForListView reducers initial state', () => {
		expect(parseJobsForListView(undefined, {})).toEqual(initialState);
	});

});

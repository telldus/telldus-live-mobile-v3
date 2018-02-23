import {parseJobsForListView} from '../../Reducers/Jobs.js';

jest.useFakeTimers();

const initialState = { sectionIds: [], sections: {} };

describe('Test jobs reducers', ()=>{

	it('check parseJobsForListView reducers initial state', () => {
		expect(parseJobsForListView(undefined, {})).toEqual(initialState);
	});

});

import reducer from '../../Reducers/Jobs.js';

jest.useFakeTimers();

const initialState = [];

describe('Test jobs reducers', ()=>{

	it('check parseJobsForListView reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});


	it('check dashboard reducers ', () => {

		const jobs = ['sectionIds', 'sections'];
		const sectionIds = ['tell', 'dus'];
		const sections = {sectionId1: 'ksr1', sectionId2: 'ksr2'};

		const devices = {
			byId: ['deviceId1', 'deviceId2', 'deviceId3', 'deviceId4'],
		};
		const gateways = {
			byId: ['sensorId1', 'sensorId2', 'sensorId3', 'sensorId4'],
		};


		expect(reducer(jobs, gateways, devices, { sections, sectionIds } )).toEqual(jobs);
	});

});

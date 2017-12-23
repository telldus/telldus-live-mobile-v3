import { parseDashboardForListView } from '../../Reducers/Dashboard.js';

jest.useFakeTimers();

describe('Test Dashboard reducers', ()=>{

	it('check dashboard reducers ', () => {

		const state = [{childObject: 'deviceId4', objectType: 'device'}, {childObject: 'sensorId3', objectType: 'sensor'}];

		const dashboard = {
			deviceIds: [3],
			sensorIds: [2],
		};

		const devices = {
			byId: ['deviceId1', 'deviceId2', 'deviceId3', 'deviceId4'],
		};
		const sensors = {
			byId: ['sensorId1', 'sensorId2', 'sensorId3', 'sensorId4'],
		};


		expect(parseDashboardForListView(dashboard, devices, sensors)).toEqual(state);
	});

});

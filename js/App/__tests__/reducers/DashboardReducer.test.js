import { parseDashboardForListView } from '../../Reducers/Dashboard.js';

jest.useFakeTimers();

describe('Test Dashboard reducers', ()=>{

	it('check dashboard reducers ', () => {
		const device = { 3: {
			clientId: 1,
			id: 3,
			isOnline: true,
		}};
		const sensor = { 2: {
			clientId: 1,
			id: 2,
			isOnline: true,
		}};

		const dashboard = {
			deviceIds: [3],
			sensorIds: [2],
		};

		const devices = {
			byId: device,
		};
		const sensors = {
			byId: sensor,
		};
		const gateways = {
			byId: { 1: {
				id: 1,
				online: true,
			}},
		};

		const state = [{
			key: 3, data: device[3], objectType: 'device',
		},
		{
			data: sensor[2], key: 2, objectType: 'sensor',
		}];


		expect(parseDashboardForListView(dashboard, devices, sensors, gateways)).toEqual(state);
	});

});

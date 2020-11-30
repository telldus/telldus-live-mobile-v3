import { parseDashboardForListView } from '../../Reducers/Dashboard.js';

jest.useFakeTimers();

describe('Test Dashboard reducers', () => {

	it('check dashboard reducers ', () => {

		const userId = '1';
		const dashboardId = 'dashboardId';

		const device = { 3: {
			clientId: 1,
			id: 3,
			isOnline: true,
			name: 'a',
			websocketOnline: true,
			supportLocalControl: false,
		}};
		const sensor = { 2: {
			clientId: 1,
			id: 2,
			isOnline: true,
			name: 'b',
			websocketOnline: true,
			supportLocalControl: false,
		}};

		const dashboard = {
			deviceIds: {
				[userId]: {
					[dashboardId]: [3],
				},
			},
			sensorIds: {
				[userId]: {
					[dashboardId]: [2],
				},
			},
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
				localKey: {},
				websocketOnline: true,
			}},
		};

		const state = [{
			data: device[3], key: 3, objectType: 'device',
		},
		{
			data: sensor[2], key: 2, objectType: 'sensor',
		}];

		const app = {
			defaultSettings: {
				activeDashboardId: dashboardId,
			},
		};

		const user = {
			userId,
		};

		const thirdParties = {
		};

		const intl = {};

		expect(parseDashboardForListView(dashboard, devices, sensors, gateways, app, user, thirdParties, intl)).toEqual(state);
	});

});

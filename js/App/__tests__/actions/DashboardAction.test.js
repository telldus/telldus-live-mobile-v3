import * as actions from '../../Actions/Dashboard.js';
import {
	isArrayUnique,
} from '../../Lib/appUtils';
import { configureStore } from '../../Store/ConfigureStore';

describe('(Dashboard) removeFromDashboard ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';

	beforeAll(() => {
		store = configureStore().store;
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			uuid: userId,
		}});
	});

	it('should not contain the removed id', () => {
		const kind = 'device';
		const id = '10';

		store.dispatch(actions.removeFromDashboard(kind, id));

		const deviceIdsCurrent = store.getState().dashboard.deviceIds[userId][dashboardId];

		expect(deviceIdsCurrent).not.toContain(parseInt(id, 10));
	});
});


describe('(Dashboard) addToDashboard ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';

	beforeAll(() => {
		store = configureStore().store;
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			uuid: userId,
		}});
	});

	it('should contain newly added id', () => {
		const kind = 'device';
		const id = '10';

		store.dispatch(actions.addToDashboard(kind, id));

		const deviceIdsCurrent = store.getState().dashboard.deviceIds[userId][dashboardId];

		expect(deviceIdsCurrent).toContain(parseInt(id, 10));
	});
});

describe('(Sensor) addToDashboardBatch ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';
	const sensorIdOne = '10';
	const sensorIdTwo = '11';

	beforeAll(() => {
		store = configureStore().store;
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			uuid: userId,
		}});
	});

	it('should contain newly added ids', () => {
		const kind = 'sensor';
		const selectedItems = {
			[sensorIdOne]: {
			},
			[sensorIdTwo]: {
			},
		};

		store.dispatch(actions.addToDashboardBatch(kind, selectedItems));

		const sensorIdsCurrent = store.getState().dashboard.sensorIds[userId][dashboardId];
		expect(sensorIdsCurrent).toEqual(expect.arrayContaining([parseInt(sensorIdOne, 10), parseInt(sensorIdTwo, 10)]));
	});
});

describe('(Sensor) addToDashboardBatch ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';
	const sensorIdOne = '12';
	const sensorIdTwo = '13';
	const kind = 'sensor';

	beforeAll(() => {
		store = configureStore().store;
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			uuid: userId,
		}});
		store.dispatch(actions.addToDashboard(kind, sensorIdOne));
		store.dispatch(actions.addToDashboard(kind, sensorIdTwo));
	});

	it('should contain newly added ids, but should not contain duplicate', () => {
		const selectedItems = {
			[sensorIdOne]: {
			},
			[sensorIdTwo]: {
			},
		};

		store.dispatch(actions.addToDashboardBatch(kind, selectedItems));

		const sensorIdsCurrent = store.getState().dashboard.sensorIds[userId][dashboardId];
		expect(sensorIdsCurrent).toEqual(expect.arrayContaining([parseInt(sensorIdOne, 10), parseInt(sensorIdTwo, 10)]));
		expect(isArrayUnique(sensorIdsCurrent)).toBeTruthy();
	});
});

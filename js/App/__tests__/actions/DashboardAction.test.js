import * as actions from '../../Actions/Dashboard.js';
import { configureStore } from '../../Store/ConfigureStore';

describe('(Dashboard) removeFromDashboard ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';

	beforeAll(() => {
		store = configureStore();
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			email: userId,
		}});
	});

	it('should not contain the removed id', () => {
		const kind = 'device';
		const id = '10';

		store.dispatch(actions.removeFromDashboard(kind, id));

		const deviceIdsCurrent = store.getState().dashboard.deviceIds[userId][dashboardId];

		expect(deviceIdsCurrent).not.toContain(id);
	});
});


describe('(Dashboard) addToDashboard ', () => {
	let store;
	const dashboardId = 'dashboardId';
	const userId = '1';

	beforeAll(() => {
		store = configureStore();
		store.dispatch({type: 'SELECT_DASHBOARD', payload: {
			dashboardId,
		}});
		store.dispatch({type: 'RECEIVED_USER_PROFILE', payload: {
			email: userId,
		}});
	});

	it('should not contain the removed id', () => {
		const kind = 'device';
		const id = '10';

		store.dispatch(actions.addToDashboard(kind, id));

		const deviceIdsCurrent = store.getState().dashboard.deviceIds[userId][dashboardId];

		expect(deviceIdsCurrent).toContain(id);
	});
});

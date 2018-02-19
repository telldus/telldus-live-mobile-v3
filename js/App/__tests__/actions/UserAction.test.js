import { registerPushToken, unregisterPushToken } from '../../Actions/User';
import { configureStore } from '../../Store/ConfigureStore';
import { format } from 'url';
// import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test User actions', ()=>{
	let store = configureStore();

	it('check user registerPushToken', () => {
		const token = 'token333';
		const name = 'nameKSR';
		const model = 'model777';
		const manufacturer = 'manufacturer123';
		const osVersion = 'osVersion3';
		const deviceId = 'deviceId12345';
		const pushServiceId = 373;

		const url = format({
			pathname: '/user/registerPushToken',
			query: {
				token,
				name,
				model,
				manufacturer,
				osVersion,
				deviceId,
				pushServiceId,
			},
		}); const payload = { url, requestParams: {	method: 'GET'}};
		return store.dispatch(registerPushToken(token, name, model, manufacturer, osVersion, deviceId, pushServiceId))
			.then((response) => {
				// Send new status through websocket connection
				store.dispatch({type: 'PUSH_TOKEN_REGISTERED', token: token,	payload: { ...payload, ...response}});
			})
			.then((response) => {
				expect(store.getState().user.pushTokenRegistered).toBe(true);
			});
	});

	it('check user unregisterPushToken', () => {
		const token = 'token';
		const url = format({ pathname: '/user/unregisterPushToken',	query: { token }});
		const payload = { url, requestParams: {	method: 'GET'}};
		return store.dispatch(unregisterPushToken(token))
			.then((response) => {
				// Send new status through websocket connection
				store.dispatch({type: 'PUSH_TOKEN_UNREGISTERED', token: token,	payload: { ...payload, ...response}});
			})
			.then(() => {
				expect(store.getState().user.pushTokenRegistered).toBe(true);
			});
	});

});

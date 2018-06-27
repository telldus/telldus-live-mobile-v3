import { unregisterPushToken } from '../../Actions/User';
import { configureStore } from '../../Store/ConfigureStore';
import { format } from 'url';
import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test User actions', ()=>{
	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};
	let token = 'token';

	beforeEach(() => {
		store = configureStore();
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
		fetchMock.mock('glob:*/oauth2/user/unregisterPushToken?token=token', '{"status": "success"}', {
			name: 'unregisterPushToken',
			overwriteRoutes: true,
		});
	});

	it('check user unregisterPushToken', () => {
		store = configureStore();
		const url = format({ pathname: '/user/unregisterPushToken',	query: { token }});
		const payload = { url, requestParams: {	method: 'GET'}};
		return store.dispatch(unregisterPushToken(token))
			.then((response) => {
				// Send new status through websocket connection
				store.dispatch({type: 'PUSH_TOKEN_UNREGISTERED', token: token,	payload: { ...payload, ...response}});
			})
			.then(() => {
				expect(store.getState().user.pushTokenRegistered).toBe(false);
				expect(fetchMock.calls('unregisterPushToken').length).toBe(1);
			});
	});

});

import { unregisterPushToken } from '../../Actions/User';
import { configureStore } from '../../Store/ConfigureStore';
import { format } from 'url';
// import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test User actions', ()=>{
	let store = configureStore();

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
				expect(store.getState().user.pushTokenRegistered).toBe(false);
			});
	});

});

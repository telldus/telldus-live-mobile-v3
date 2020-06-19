import { format } from 'url';
import axios from 'axios';

import { unregisterPushToken } from '../../Actions/User';
import { configureStore } from '../../Store/ConfigureStore';

jest.useFakeTimers();

describe('Test User actions', ()=>{
	let store;
	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};
	let token = 'token';

	beforeEach(() => {
		store = configureStore().store;
		store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
		axios.mockReset();
		const data = {
			data: {
			  status: 'success',
			},
		};
		axios.mockReturnValueOnce(data);
	});

	afterEach(() => {
		axios.mockReset();
	});

	it('check user unregisterPushToken', () => {
		store = configureStore().store;
		const url = format({ pathname: '/user/unregisterPushToken',	query: { token }});
		const payload = { url, requestParams: {	method: 'GET'}};
		return store.dispatch(unregisterPushToken(token))
			.then((response) => {
				// Send new status through websocket connection
				store.dispatch({type: 'PUSH_TOKEN_UNREGISTERED', token: token,	payload: { ...payload, ...response}});
			})
			.then(() => {
				expect(store.getState().user.pushTokenRegistered).toBe(false);
				expect(axios).toHaveBeenCalledTimes(1);
				expect(axios).toBeCalledWith(
					expect.stringContaining(`unregisterPushToken?token=${token}`),
					expect.any(Object),
				);
			});
	});

});

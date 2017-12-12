import * as actions  from '../../Actions/Login.js';
import { configureStore } from '../../Store/ConfigureStore';
jest.useFakeTimers();

 describe('Test Login actions', ()=>{
 	let store;
 	let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};
	it('(Login), logintelldus', () => {
    store = configureStore();
		 store.dispatch(actions.loginToTelldus())
			.then(() => {
				store.dispatch({type: 'RECEIVED_ACCESS_TOKEN'});
			})
		})
});

import { addNewGateway } from '../../Actions/Gateways';
import { configureStore } from '../../Store/ConfigureStore';

jest.useFakeTimers();

describe('Test Gateway actions', ()=>{

	it('check gateway actions addNewGateway', () => {
		let store = configureStore();
		return store.dispatch(addNewGateway())
			.then(() => {
				// Send new status through websocket connection
				store.dispatch({type: 'ADD_GATEWAY_REQUEST', payload: {clients: 'ksr'}});
			})
			.then(() => {
				expect(store.getState().gateways.toActivate.clients).toBe('ksr');
			});
	});

});

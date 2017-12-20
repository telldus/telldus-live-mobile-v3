import { getGateways, addNewGateway, activateGateway, getGatewayInfo, getGeoCodePosition } from 'Actions_Gateways';
import { configureStore } from '../../Store/ConfigureStore';
import { format } from 'url';
import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('Test Gateway actions', ()=>{

    it('check gateway actions addNewGateway',() => {
    store = configureStore();
      return store.dispatch(addNewGateway())
      .then(() => {
       			// Send new status through websocket connection
       			store.dispatch({type: 'ADD_GATEWAY_REQUEST', payload: {clients:"ksr"}});
       		})
        .then(() => {
            expect(store.getState().gateways.toActivate.clients).toBe('ksr');
        })
  })

});

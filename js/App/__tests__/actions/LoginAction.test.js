import {updateAccessToken}  from '../../Actions/Login.js';
import { configureStore } from '../../Store/ConfigureStore';
jest.useFakeTimers();
import fetchMock from 'fetch-mock';

 describe('Test Login actions', ()=>{
   let store;
   let accessToken = {access_token: 'bajs', refresh_token: 'bajs'};

   beforeEach(() => {
     store = configureStore();
     store.dispatch({type: 'RECEIVED_ACCESS_TOKEN', accessToken});
     store.dispatch({type: 'RECEIVED_DEVICES', payload: {
       device: [{
         id: '1',
         methods: 3,
         state: 2,
       }],
     }});
     fetchMock.reset();
     fetchMock.mock('glob:*/oauth2/device/command?id=1&method=1&value=null', '{"status": "success"}', {
       name: 'deviceCommand',
     });
     fetchMock.mock('glob:*/oauth2/device/info?id=1&supportedMethods=951', {
       'state': 2,
     }, {
       name: 'deviceInfo',
     });
   });

    it('should return  updateAccessToken', () => {
        const expectedAction = {
          type: "RECEIVED_ACCESS_TOKEN",
          accessToken: 'errorMessage',
        };
    expect(updateAccessToken('errorMessage')).toEqual(expectedAction)
    })

});

import React from 'react';
import { getJobs } from "../../Actions/Jobs";
import { configureStore } from '../../Store/ConfigureStore';
import { format } from 'url';
import fetchMock from 'fetch-mock';

jest.useFakeTimers();

describe('(Jobs) getJobs', () => {

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


  it('should return job details', () => {
    store = configureStore();
       store.dispatch(getJobs())
      expect(store.getState().jobs).toEqual([]);
})

})

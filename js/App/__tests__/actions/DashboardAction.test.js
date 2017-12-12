import React from 'react';
import * as actions from "../../Actions/Dashboard.js";
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('(Dashboard) removeFromDashboard ', () => {
  it('should return  REMOVE_FROM_DASHBOARD', () => {
    const Kind = 'device';
    const Id = '10';
      const expectedAction = {
        type: 'REMOVE_FROM_DASHBOARD',
        kind:Kind,
        id:Id
      };
  expect(actions.removeFromDashboard(Kind,Id)).toEqual(expectedAction)
  })
})


describe('(Dashboard) addToDashboard ', () => {
  it('should return  ADD_TO_DASHBOARD', () => {
    const Kind = 'device';
    const Id = '10';
      const expectedAction = {
        type: 'ADD_TO_DASHBOARD',
        kind:Kind,
        id:Id
      };
  expect(actions.addToDashboard(Kind,Id)).toEqual(expectedAction)
  })
})

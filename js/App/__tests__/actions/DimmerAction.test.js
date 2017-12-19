import React from 'react';
import * as actions from "../../Actions/Dimmer.js"
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('(Dimmer) showDimmerPopup ', () => {
  it('should return  SHOW_DIMMER_POPUP', () => {
    const Name = 'raj';
    const Value = 10;
      const expectedAction = {
        type: 'SHOW_DIMMER_POPUP',
        name:Name,
        value:Value,
      };
  expect(actions.showDimmerPopup(Name,Value)).toEqual(expectedAction)
  })
})

describe('(Dimmer) saveDimmerInitialState ', () => {
  it('should return  SAVE_DIMMER_INITIAL_STATE', () => {
    const DeviceId = 333;
    const IValue = 10;
    const IState = 'ksr';
      const expectedAction = {
        payload: {
          deviceId:DeviceId,
          initialValue:IValue,
          initialState:IState
        },
          type: 'SAVE_DIMMER_INITIAL_STATE',
        };
    expect(actions.saveDimmerInitialState(DeviceId,IValue,IState)).toEqual(expectedAction)
  })
})

describe('(Dimmer) hideDimmerPopup ', () => {
  it('should return HIDE_DIMMER_POPUP', () => {
    const expectedAction = {
        type: 'HIDE_DIMMER_POPUP',
     };
  expect(actions.hideDimmerPopup()).toEqual(expectedAction)
  })
})

describe('(Dimmer) setDimmerValue ', () => {
  it('should return  SET_DIMMER_VALUE', () => {
    const Value = 10;
    const DeviceId = 333;
    const store = mockStore();
        const expectedAction = [{
          type: 'SET_DIMMER_VALUE',
          payload: {
      			value:Value,
            deviceId: DeviceId
      		},
        }]
    store.dispatch(actions.setDimmerValue(DeviceId,Value));
    expect(store.getActions()).toEqual(expectedAction);

  })
})

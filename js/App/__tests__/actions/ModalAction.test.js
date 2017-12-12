import React from 'react';
import * as actions from "../../Actions/Modal.js";

describe('(Modal) showModal ', () => {
  it('should return received modal', () => {
    const Data = 'raj';
    //const Extras = 10;
      const expectedAction = {
        type: 'REQUEST_MODAL_OPEN',
        payload : {
        data:Data,
        //extras:Extras
      }
      };
  expect(actions.showModal(Data)).toEqual(expectedAction)
  })
})

 describe('(Modal) hideModal ', () => {
  it('should return  REQUEST_MODAL_CLOSE', () => {
    const Data = 'raj';
    const Extras = 10;
      const expectedAction = {
        type: 'REQUEST_MODAL_OPEN',
        payload : {
        data:Data,
        extras:Extras
      },
          type: 'REQUEST_MODAL_CLOSE',
        };
    expect(actions.hideModal( Data,Extras)).toEqual(expectedAction)
  })
})

describe('(Dimmer) clearData ', () => {
  it('should return REQUEST_MODAL_CLEAR_DATA', () => {
    const expectedAction = {
        type: 'REQUEST_MODAL_CLEAR_DATA',
     };
  expect(actions.clearData()).toEqual(expectedAction)
  })
})

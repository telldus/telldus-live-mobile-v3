
import React from 'react';
import reducer from "../../Reducers/Modal.js";
import * as type from "../../Actions/Types";

const initial = {
	openModal: false,
	data: '',
	extras: false,
};

describe('Modal reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initial)
  })

  it('should handle global error show', () => {
expected =  reducer(initial,
        {
        type: type.REQUEST_MODAL_CLOSE,
        openModal: true,
      })
  expect(initial).toEqual(expected);
})
})

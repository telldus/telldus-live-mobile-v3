
import React from 'react';
import reducer from "../../Reducers/Dimmer.js";
import * as type from "../../Actions/Types";

const initial = {
  deviceId: 0,
  initialState: "",
  initialValue: 0,
  name: "N/A",
  show: false,
  value: 0,
}

describe('Dimmer reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initial)
  })

  it('should handle global error show', () => {
    expect(
      reducer(initial,
        {
        type: type.HIDE_DIMMER_POPUP,
      })
    ).toEqual(
      {
        deviceId: 0,
        initialState: "",
        initialValue: 0,
        name: "N/A",
        show: false,
        value: 0,
      },
    )
})
})

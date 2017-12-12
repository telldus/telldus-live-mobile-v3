
import React from 'react';
import * as actions from "../../Actions/Sensors.js";


describe('(Sensor) processWebsocketMessageForSensor ', () => {
  it('should return sensor websocket unhandled', () => {
    const data = undefined;
     const expectedAction = {
      type: 'SENSOR_WEBSOCKET_UNHANDLED',
      payload: data,
    };
     expect(actions.processWebsocketMessageForSensor(data)).toEqual(expectedAction)
  })
})

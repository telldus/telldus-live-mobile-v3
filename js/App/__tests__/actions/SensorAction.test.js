
import React from 'react';
import { processWebsocketMessageForSensor, getSensors } from "../../Actions/Sensors.js";
import { configureStore } from '../../Store/ConfigureStore';




describe('(Sensor) processWebsocketMessageForSensor ', () => {
  it('should return sensor websocket unhandled', () => {
    const data = undefined;
     const expectedAction = {
      type: 'SENSOR_WEBSOCKET_UNHANDLED',
      payload: data,
    };
     expect(processWebsocketMessageForSensor(data)).toEqual(expectedAction)
  })
})

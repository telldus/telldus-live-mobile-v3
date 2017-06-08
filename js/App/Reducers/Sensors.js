/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

import type { Action } from 'Actions_Types';
import { REHYDRATE } from 'redux-persist/constants';

import { combineReducers } from 'redux';

export type State = ?Object;

function reduceSensor(state = {}, action: Action): State {
  switch (action.type) {
    case 'RECEIVED_SENSORS':
      // properties originated from server
      const newSensor = {
        id: parseInt(state.id, 10), // unique id
        sensorId: parseInt(state.sensorId, 10), // TODO: is this ever used?
        battery: state.battery,
        clientId: parseInt(state.client, 10),
        editable: Boolean(state.editable),
        ignored: Boolean(state.ignored),
        keepHistory: Boolean(state.keepHistory),
        lastUpdated: state.lastUpdated,
        model: state.model,
        name: state.name,
        protocol: state.protocol,
      };

      // properties originated on client
      if (state.temp) {
        newSensor.temperature = state.temp;
      }
      if (state.humidity) {
        newSensor.humidity = state.humidity;
      }
      if (state.rrate) {
        newSensor.rainRate = state.rrate;
      }
      if (state.rtot) {
        newSensor.rainTotal = state.rtot;
      }
      if (state.uv) {
        newSensor.uv = state.uv;
      }
      if (state.watt) {
        newSensor.watt = state.watt;
      }
      if (state.lum) {
        newSensor.luminance = state.lum;
      }
      if (state.wavg) {
        newSensor.windAverage = state.wavg;
      }
      if (state.wgust) {
        newSensor.windGust = state.wgust;
      }
      if (state.wdir) {
        newSensor.windDirection = state.wdir;
      }
      return newSensor;

    case 'SENSOR_UPDATE_VALUE':
      const newState = {};

      newState.lastUpdated = parseInt(action.payload.time, 10);
      newState.battery = action.payload.battery;
      action.payload.data.forEach(sensorData => {
        if (sensorData.type === 1) {
          newState.temperature = sensorData.value;
        } else if (sensorData.type === 2) {
          newState.humidity = sensorData.value;
        } else if (sensorData.type === 4) {
          newState.rainRate = sensorData.value;
        } else if (sensorData.type === 8) {
          newState.rainTotal = sensorData.value;
        } else if (sensorData.type === 32) {
          newState.windAverage = sensorData.value;
        } else if (sensorData.type === 64) {
          newState.windGust = sensorData.value;
        } else if (sensorData.type === 16) {
          newState.windDirection = sensorData.value;
        } else if (sensorData.type === 128) {
          newState.uv = sensorData.value;
        } else if (sensorData.type === 256 && sensorData.scale === 2) {
          newState.watt = sensorData.value;
        } else if (sensorData.type === 512) {
          newState.luminance = sensorData.value;
        }
      });
      return {
        ...state,
        ...newState,
      };

    case 'ADD_TO_DASHBOARD':
      return {
        ...state,
        isInDashboard: true,
      };

    case 'REMOVE_FROM_DASHBOARD':
      return {
        ...state,
        isInDashboard: false,
      };

    default:
      return state;
  }
}

const byId = (state = {}, action: Action): State => {
  if (action.type === REHYDRATE) {
    if (action.payload.sensors && action.payload.sensors.byId) {
      console.log('rehydrating sensors.byId');
      return {
        ...state,
        ...action.payload.sensors.byId,
      };
    }
    return { ...state };
  }
  if (action.type === 'RECEIVED_SENSORS') {
    return action.payload.sensor.reduce((acc, sensorState) => {
      acc[sensorState.id] = {
        ...state[sensorState.id],
        // TODO: pass in received state as action.payload (see gateways reducer)
        ...reduceSensor(sensorState, action),
      };
      return acc;
    }, {});
  }
  if (action.type === 'SENSOR_UPDATE_VALUE') {
    return {
      ...state,
      [action.payload.id]: reduceSensor(state[action.payload.id], action),
    };
  }
  if (action.type === 'ADD_TO_DASHBOARD' && action.kind === 'sensor') {
    return {
      ...state,
      [action.id]: reduceSensor(state[action.id], action),
    };
  }
  if (action.type === 'REMOVE_FROM_DASHBOARD' && action.kind === 'sensor') {
    return {
      ...state,
      [action.id]: reduceSensor(state[action.id], action),
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return {};
  }

  return state;
};

const allIds = (state = [], action: Action): State => {
  if (action.type === REHYDRATE) {
    if (action.payload.sensors && action.payload.sensors.allIds) {
      console.log('rehydrating sensors.allIds');
      return [
        ...state,
        ...action.payload.sensors.allIds,
      ];
    }
    return [ ...state ];
  }
  if (action.type === 'RECEIVED_SENSORS') {
    // overwrites entire state
    return action.payload.sensor.map(sensorState => sensorState.id);
  }
  if (action.type === 'LOGGED_OUT') {
    return [];
  }
  return state;
};

export default combineReducers({
  allIds,
  byId,
});

export function parseSensorsForListView(sensors = {}, gateways = {}, editMode = false) {
  const sections = sensors.allIds.reduce((acc, sensorId) => {
    acc[sensors.byId[sensorId].clientId] = [];
    return acc;
  }, {});
  const sectionIds = Object.keys(sections).map(id => parseInt(id, 10));

  sensors.allIds.forEach(sensorId => {
    const sensor = sensors.byId[sensorId];
    sections[sensor.clientId].push({
      sensor,
      editMode,
    });
  });

  sectionIds.sort((a, b) => {
    // might be that sensors get rendered before gateways are fetched
    const gatewayA = gateways.byId[a] ? gateways.byId[a].name : a;
    const gatewayB = gateways.byId[b] ? gateways.byId[b].name : b;

    if (gatewayA < gatewayB) {
      return -1;
    }
    if (gatewayA > gatewayB) {
      return 1;
    }
    return 0;
  });
  return { sections, sectionIds };
}

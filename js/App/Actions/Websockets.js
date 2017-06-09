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
 *
 * @providesModule Actions_Websockets
 */

// @flow

'use strict';

import type { Dispatch, GetState, ThunkAction } from './types';

import { v4 } from 'react-native-uuid';
import TelldusWebsocket from '../Lib/Socket';

import { processWebsocketMessageForSensor } from 'Actions_Sensors';
import { processWebsocketMessageForDevice } from 'Actions_Devices';

import formatTime from '../Lib/formatTime';

import LiveApi from 'LiveApi';

// TODO: expose websocket lib via Provider component, so that it is bound and so that we have access to store

// TODO: move connection lookup to redux state
const websocketConnections = {};

/*
 * Ensures that our sessionId is registered at the LiveApi. When a new socket connection is established
 * in `setupGatewayConnection`, the sessionId is used to auhenticate.
 *
 * When a sessionId is successfully registered, the LiveApi returns a ttl (time to live) which is an
 * expiry date (timestamp in seconds UTC). Whenever the sessionId expires, `authenticateSession`
 * automatically registers a new sessionId.
 *
 * `authenticateSession` returns a promise. It resolves to the authenticated sessionId, which is also
 * stored in the redux state.
 */
export const authenticateSession : () => ThunkAction = (() => {
  // immediately executing function to create closure for promise management
  let promise;
  let resolving = false;

  return () => (dispatch: Dispatch, getState: GetState) => {
    const {
      websockets: { session: { ttl, sessionId } },
    } = getState();
    const now = new Date();

    if (ttl > now) {
      // session still valid, not creating new one
      return new Promise.resolve(sessionId);
    }

    if (resolving) {
      // already authenticating, return the promise
      return promise;
    }

    // authenticate, set promise and return it
    const newSessionId = v4();
    const payload = {
      url: `/user/authenticateSession?session=${newSessionId}`,
      requestParams: {
        method: 'GET',
      },
    };

    resolving = true;
    promise = LiveApi(payload);
    return promise
  .then(response => dispatch({
    type: 'SESSION_ID_AUTHENTICATED',
    payload: {
      sessionId: newSessionId,
      ttl: response.ttl,
    },
  }))
  .then(() => {
    resolving = false;
    return newSessionId;
  });
  };
})();

/*
 * Sets up socket connections to known gateways.
 * Makes sure that the session is authenticated before connecting.
 */
export const connectToGateways = () => (dispatch: Dispatch, getState: GetState ) => {
  const {
    gateways: { allIds, byId },
  } = getState();

  allIds.forEach(gatewayId => {
    const { websocketAddress } = byId[gatewayId] || {};
    const { address, port } = websocketAddress || {};
    if (!address || !port) {
      return console.error('cannot connect to gateway because address or port is missing', {
        gatewayId,
        address,
        port,
      });
    }

    authenticateSession()(dispatch, getState).then(() => {
      setupGatewayConnection(gatewayId, address, port)(dispatch, getState);
    });
  });
};

/*
 * Retrieves the socket address for a gateway.
 * If it receives an address that is different than the one that is in the state,
 * or different than the one we are connected to, it updates the state and creates
 * a new socket connection.
 */
export const getWebsocketAddress = (gatewayId: number) => (dispatch: Dispatch, getState: GetState) => {
  const payload = {
    url: `/client/serverAddress?id=${gatewayId}`,
    requestParams: {
      method: 'GET',
    },
  };
  return LiveApi(payload).then(response => {
    const {
      gateways: { byId: { [gatewayId]: gateway } },
    } = getState();
    const { websocketAddress } = gateway || {};
    const { address, port } = response;
    if (!address || !port) {
      return console.error('received illegal gateway socket address', {
        gatewayId,
        response,
      });
    }

    const websocketConnection:Object = websocketConnections[gatewayId] || {};
    if (
      address === websocketAddress.address &&
      address === websocketConnection.address &&
      port === websocketAddress.port &&
      port === websocketConnection.port
    ) {
      return console.log('websocket address has not changed, ignoring');
    }

    console.log('received new websocket address, reconnecting');

    dispatch({
      type: 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS',
      gatewayId,
      payload: {
        ...payload,
        ...response,
      },
    });

    authenticateSession()(dispatch, getState).then(() => {
      setupGatewayConnection(gatewayId, address, port)(dispatch, getState);
    });
  });
};

export const destroyAllConnections = () => {
  Object.keys(websocketConnections).forEach(destroyConnection);
};

const destroyConnection = gatewayId => {
  const websocketConnection = websocketConnections[gatewayId];
  if (!websocketConnection) {
    return;
  }
  if (websocketConnection.websocket) {
    websocketConnection.websocket.destroy();
  }
  delete websocketConnections[gatewayId];
};

/*
 * Sets up a websocket connection for a gateway
 * It makes sure that any existing socket connection for this gateway is destroyed first.
 * When the connection is setup, it:
 * - registers event listeners
 * - registers the sessionId
 * - registers listeners for devices and sensors that call Action Creators
 *
 * When the connection is closed it automatically tries to reopen the connection.
 *
 * When the server indicates that it is not the right server to connect to, it
 * calls `getWebsocketAddress`, so that a new connection for the a new address
 * is set up.
 */
const setupGatewayConnection = (gatewayId, address, port) => (dispatch, getState) => {
  destroyConnection(gatewayId);
  const websocketUrl = `ws://${address}:${port}/websocket`;
  console.log('opening socket connection to', websocketUrl);
  const websocket = new TelldusWebsocket(gatewayId, websocketUrl);
  websocketConnections[gatewayId] = {
    url: websocketUrl,
    websocket: websocket,
    address,
    port,
  };

  websocket.onopen = () => {
    const formattedTime = formatTime(new Date());
    const message = `websocket_opened @ ${formattedTime} (gateway ${gatewayId})`;

    try {
      console.groupCollapsed(message);
      console.groupEnd();
    } catch (e) {
      console.log(message);
    }

    const {
      websockets: { session: { id: sessionId } },
    } = getState();

    authoriseWebsocket(sessionId);

    addWebsocketFilter('device', 'added');
    addWebsocketFilter('device', 'removed');
    addWebsocketFilter('device', 'failSetState');
    addWebsocketFilter('device', 'setState');

    addWebsocketFilter('sensor', 'added');
    addWebsocketFilter('sensor', 'removed');
    addWebsocketFilter('sensor', 'setName');
    addWebsocketFilter('sensor', 'setPower');
    addWebsocketFilter('sensor', 'value');

    addWebsocketFilter('zwave', 'removeNodeFromNetwork');
    addWebsocketFilter('zwave', 'removeNodeFromNetworkStartTimeout');
    addWebsocketFilter('zwave', 'addNodeToNetwork');
    addWebsocketFilter('zwave', 'addNodeToNetworkStartTimeout');
    addWebsocketFilter('zwave', 'interviewDone');
    addWebsocketFilter('zwave', 'nodeInfo');

    dispatch({
      type: 'GATEWAY_WEBSOCKET_OPEN',
      gatewayId,
    });
  };

  websocket.onmessage = (msg) => {
    const formattedTime = formatTime(new Date());
    const title_prefix = `websocket_message @ ${formattedTime} (from gateway ${gatewayId})`;
    let title = '';
    let message = '';
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      message = msg.data;
      title = ` ${msg.data}`;
    }

    if (message === 'validconnection') {
      message = {
        module: 'websocket_connection',
        action: 'connected',
      };
      title = ` ${message.module}:${message.action}`;
    } else if (message === 'nothere') {
      message = {
        module: 'websocket_connection',
        action: 'wrong_server',
      };
      title = ` ${message.module}:${message.action}`;
    } else if (message === 'error') {
      message = {
        module: 'websocket_connection',
        action: 'unknown_error',
      };
      title = ` ${message.module}:${message.action}`;
    }

    if (message.module && message.action) {
      title = ` ${message.module}:${message.action}`;

      switch (message.module) {
        case 'websocket_connection':
          if (message.action === 'wrong_server') {
            dispatch(getWebsocketAddress(gatewayId));
          }
          break;
        case 'device':
          dispatch(processWebsocketMessageForDevice(message.action, message.data));
          break;
        case 'sensor':
          dispatch(processWebsocketMessageForSensor(message.action, message.data));
          break;
        case 'zwave':

          break;
        default:
      }
    }
    try {
      console.groupCollapsed(title_prefix + title);
      console.log(message);
      console.groupEnd();
    } catch (e) {
      console.log(message);
    }
  };

  websocket.onerror = (e) => {
    const formattedTime = formatTime(new Date());
    const message = `websocket_error @ ${formattedTime} (gateway ${gatewayId})`;
    try {
      console.groupCollapsed(message);
      console.log(e);
      console.groupEnd();
    } catch (error) {
      console.log(message, error);
    }
  };

  websocket.onclose = () => {
    const formattedTime = formatTime(new Date());
    const message = `websocket_closed @ ${formattedTime} (gateway ${gatewayId})`;
    try {
      console.groupCollapsed(message);
      console.groupEnd();
    } catch (e) {
      console.log(message);
    }

    dispatch({
      type: 'GATEWAY_WEBSOCKET_CLOSED',
      gatewayId,
    });
  };

  function authoriseWebsocket(sessionId:string) {
    sendMessage(`{"module":"auth","action":"auth","data":{"sessionid":"${sessionId}","clientId":"${gatewayId}"}}`);
  }

  function addWebsocketFilter(module:string, action:string) {
    sendMessage(`{"module":"filter","action":"accept","data":{"module":"${module}","action":"${action}"}}`);
  }

  function sendMessage(message:string) {
    const formattedTime = formatTime(new Date());
    const title_prefix = `sending websocket_message @ ${formattedTime} (for gateway ${gatewayId})`;
    try {
      console.groupCollapsed(title_prefix);
      console.log(message);
      console.groupEnd();
    } catch (e) {
      console.log(message);
    }
    websocket.send(message);
  }
};

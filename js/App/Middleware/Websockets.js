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

var websocketConnections = [];

import { authoriseWebsocket, addWebsocketFilter, processWebSocketMessage, processWebsocketMessageForSensor } from 'Actions';
import * as watch from 'react-native-watch-connectivity'

const formatTime = (time) => `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;
const repeat = (str, times) => (new Array(times + 1)).join(str);
const pad = (num, maxLength) => repeat(`0`, maxLength - num.toString().length) + num;

export default function (store) {
	return next => action => {
		const result = next(action);
		try {
			switch(action.type) {
				case 'RECEIVED_GATEWAY_WEBSOCKET_ADDRESS':
					const payload = action.payload;
					const gatewayId = payload.gatewayId;
					const sessionId = payload.sessionId;
					if (payload.address && payload.port) {
						const websocketUrl = `ws://${payload.address}:${payload.port}/websocket`;
						websocketConnections[gatewayId] = new WebSocket(websocketUrl);
						websocketConnections[gatewayId].onopen = () => {
							store.dispatch(authoriseWebsocket(gatewayId, sessionId))
							.then((action) => {
								store.dispatch(addWebsocketFilter(gatewayId, 'device', 'added'));
								store.dispatch(addWebsocketFilter(gatewayId, 'device', 'removed'));
								store.dispatch(addWebsocketFilter(gatewayId, 'device', 'failSetStae'));
								store.dispatch(addWebsocketFilter(gatewayId, 'device', 'setState'));

								store.dispatch(addWebsocketFilter(gatewayId, 'sensor', 'added'));
								store.dispatch(addWebsocketFilter(gatewayId, 'sensor', 'removed'));
								store.dispatch(addWebsocketFilter(gatewayId, 'sensor', 'setName'));
								store.dispatch(addWebsocketFilter(gatewayId, 'sensor', 'setPower'));
								store.dispatch(addWebsocketFilter(gatewayId, 'sensor', 'value'));

								store.dispatch(addWebsocketFilter(gatewayId, 'onkyo', 'event'));

								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'removeNodeFromNetwork'));
								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'removeNodeFromNetworkStartTimeout'));
								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'addNodeToNetwork'));
								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'addNodeToNetworkStartTimeout'));
								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'interviewDone'));
								store.dispatch(addWebsocketFilter(gatewayId, 'zwave', 'nodeInfo'));

							});
						};
						websocketConnections[gatewayId].onmessage = (msg) => {
							const formattedTime = formatTime(new Date());
							var title = `websocket_message @ ${formattedTime} (from gateway ${gatewayId})`;
							var message = '';
							try {
								message = JSON.parse(msg.data);
								if (message.module && message.action) {
									title += ` ${message.module}:${message.action}`;
								}
							} catch (e) {
								message = msg.data;
								title += ` ${msg.data}`;
							}

							if(message.module && message.action) {
								switch(message.module) {
									case 'device':

									break;
									case 'sensor':
										store.dispatch(processWebsocketMessageForSensor(message.action, message.data));
									break;
									case 'zwave':

									break;
								default:
								}
							}

							/*try {
								const timestamp = new Date().getTime()
								watch.sendMessage({text: `Websocket Message @${timestamp}`, timestamp: timestamp}, (err, replyMessage) => {
									if (!err) {
										console.log("Received reply from watch", replyMessage)
									}
								});
							} catch (e) {

							}*/
							try {
								console.groupCollapsed(title);
								console.log(message);
								console.groupEnd();
							} catch (e) {
								console.log(message);
							}
						};
						websocketConnections[gatewayId].onerror = (e) => {
							console.log(`[${gatewayId}] Websocket Error: ${e.message}`);
						};
						websocketConnections[gatewayId].onclose = (e) => {
							delete websocketConnections[gatewayId];
						}
					} else {
						delete websocketConnections[gatewayId];
					}
					break;
				case 'SEND_WEBSOCKET_MESSAGE':
					if (websocketConnections[action.gatewayId]) {
						websocketConnections[action.gatewayId].send(action.message);
					}
					break;
				case 'LOGGED_OUT':
					websocketConnections.forEach((websocketConnection) => {
						websocketConnection.close();
					});
					break;
			default:
			}
		} catch(e) {
			console.log(e);
		}
		return result;
	};
}

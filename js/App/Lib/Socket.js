/*
 * The app needs one websocket connection for each client (location).
 * To authenticate it you need to call /user/authenticateSession before the websocket can be opened.

 * The authorization for websockets is not directly tied to the access token. Each websocket conenction
 * gets its own access token and is only valid for that "app session".
 *
 * Each gateway has its own socket connection. Since two clients can (and often will be) connected to different servers.
 * A webconnection is connected directly to the server where the TellStick is connected to.
 */

 import formatTime from './formatTime';

// TODO: figure out whether we want to listen for appState to close the connection
// https://facebook.github.io/react-native/docs/appstate.html
// import { AppState } from 'react-native';
// AppState.addEventListener('change', (appState) => {
// 	console.log('***** AppState state changed', appState)
// 	if (appState === 'active') {
// 		Object.keys(websocketConnections).forEach(gatewayId => {
// 			const websocketConnection = websocketConnections[gatewayId];
// 			if (websocketConnection.websocket) {
// 				console.log('reopening websocket');
// 				websocketConnection.websocket.open();
// 			}
// 		});
// 	}
// 	if (appState === 'inactive' || appState === 'background') {
// 		Object.keys(websocketConnections).forEach(gatewayId => {
// 			const websocketConnection = websocketConnections[gatewayId];
// 			if (websocketConnection.websocket) {
// 				console.log('closing websocket');
// 				websocketConnection.websocket.close();
// 			}
// 		});
// 	}
// });

let websocketConnections = {};

export function addConnection(gatewayId, websocketUrl) {
	if (websocketConnections[gatewayId] && websocketConnections[gatewayId].websocket) {
		websocketConnections[gatewayId].websocket.close();
	}
	websocketConnections[gatewayId] = {
		url: websocketUrl,
		websocket: new WebSocket(websocketUrl)
	};
	return websocketConnections[gatewayId].websocket;
}

export function removeConnection(gatewayId) {
	if (websocketConnections[gatewayId] && websocketConnections[gatewayId].websocket) {
		websocketConnections[gatewayId].websocket.close();
	}
	delete websocketConnections[gatewayId];
}

export function sendMessage(gatewayId, message) {
	if (!websocketConnections[gatewayId] || !websocketConnections[gatewayId].websocket) {
		return console.error('cannot send websocket message');
	}
	const formattedTime = formatTime(new Date());
	const title_prefix = `sending websocket_message @ ${formattedTime} (for gateway ${gatewayId})`;
    try {
        console.groupCollapsed(title_prefix);
        console.log(message);
        console.groupEnd();
    } catch (e) {
        console.log(message);
    }
	websocketConnections[gatewayId].websocket.send(message);
}

export function closeAllConnections() {
	Object.keys(websocketConnections).forEach(_gatewayId => {
		const websocketConnection = websocketConnections[_gatewayId];
		if (websocketConnection.websocket) {
			websocketConnection.websocket.close();
		}
		delete websocketConnections[_gatewayId];
	});
}

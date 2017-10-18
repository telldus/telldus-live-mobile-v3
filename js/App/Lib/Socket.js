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

/*
 * The app needs one websocket connection for each client (location).
 * To authenticate it you need to call /user/authenticateSession before the websocket can be opened.

 * The authorization for websockets is not directly tied to the access token. Each websocket conenction
 * gets its own access token and is only valid for that "app session".
 *
 * Each gateway has its own socket connection. Since two clients can (and often will be) connected to different servers.
 * A webconnection is connected directly to the server where the TellStick is connected to.
 */

// @flow

import ReconnectingWebSocket from 'reconnecting-websocket';

// Websocket wrapper around ReconnectingWebSocket
//
// TelldusWebsocket can be closed and reopened without the callee having
// to reassign event listeners.
// This allows us to close the connection when the app goes to the background and
// open the connection again when it goes to the front easily.

import { AppState } from 'react-native';

export default class TelldusWebsocket {
	gatewayId: string;
	websocketUrl: string;
	websocket: Object;
	send: Object;
	_onAppStateChange : string => void;
	onmessage: Function;
	onerror: Function;
	onclose: Function;
	onopen: Function;

	constructor(gatewayId:string, websocketUrl:string) {
		this.gatewayId = gatewayId;
		this.websocketUrl = websocketUrl;

		this.open();
		this._listenForAppStateChange();
	}

	open() {
		if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
			return console.log('socket already open');
		}
		if (this.websocket && this.websocket.readyState === this.websocket.OPENING) {
			return console.log('socket already opening');
		}

		this.websocket = new ReconnectingWebSocket(this.websocketUrl);

		// bind any listeners on TelldusWebsocket to this.socket
		this._addListeners();

		// expose websocket.send as this.send
		this.send = this.websocket.send;

		this._onAppStateChange = this._onAppStateChange.bind(this);
	}

	close(keepClosed?: boolean = true) {
		if (!this.websocket) {
			return console.error('there is no websocket to close');
		}
		if (this.websocket.readyState === this.websocket.CLOSE) {
			return console.log('socket already closed');
		}
		if (this.websocket.readyState === this.websocket.CLOSING) {
			return console.log('socket already closing');
		}

		this.websocket.close(null, null, {
			keepClosed: keepClosed,
			// fastClose: true,
		});
	}

	// reconnect to a different websocket url
	setUrl(url: string) {
		this.websocketUrl = url;
		this.close();
		this.open();
	}

	destroy() {
		// make sure no event listeners are fired
		delete this.websocket.onopen;
		delete this.websocket.onmessage;
		delete this.websocket.onerror;
		delete this.websocket.onclose;
		AppState.removeEventListener('change', this._onAppStateChange);

		this.close();
		delete this.websocket;
	}

	_addListeners() {
		this._addListener('onopen');
		this._addListener('onmessage');
		this._addListener('onerror');
		this._addListener('onclose');
	}

	_addListener(eventType:string) {
		const noop = event => console.log('nooping', event);
		this.websocket[eventType] = event => {
      // $FlowFixMe
			const fn = this[eventType] || noop;
			fn(event);
		};
	}

	_listenForAppStateChange() {
		AppState.addEventListener('change', this._onAppStateChange);
	}

	_onAppStateChange(appState) {
		if (appState === 'active') {
			console.log('app is active, reopening socket connection');
			this.close(false);
			this.open();
		}
		if (appState === 'background') {
			console.log('app in background, closing socket connection');
			this.close();
		}
	}
}

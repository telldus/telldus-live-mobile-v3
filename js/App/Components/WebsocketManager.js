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

import React from 'React';
import uuid from 'react-native-uuid';

import type { Action } from './types';

class WebsocketManager extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			session: {
				id: '',
				authenticated: false,
				authenticationRequested: false
			},
			timer: false
		};
	}

	componentDidMount() {
		if (!this.state.timer) {
			this.state.timer = setInterval( this._checkWebSocketConnections.bind(this), 3000 );
		}
	}

	_checkWebSocketConnections() {
		this._checkSessionId()
		.then(() => {
			this.props.dispatch({
				type: 'WEBSOCKET_WATCHDOG',
				payload: this.state.session.id
			});
		})
		.catch((e) => {
			console.log(e);
		});
	}

	async _checkSessionId(): Promise<Action> {
		return new Promise((resolve, reject) => {
			if (this.state.session.authenticationRequested === true) {
				reject('Session authentication already requested!');
			} else {
				if (this.state.session.id === '') {
					this.state.session.id = uuid.v4();
				}
				if (this.state.session.authenticated === true) {
					resolve();
				} else {
					this.state.session.authenticationRequested = true;
					const payload = {
						url: `/user/authenticateSession?session=${this.state.session.id}`,
						requestParams: {
							method: 'GET'
						}
					};
					this.props.dispatch({
						type: 'LIVE_API_CALL',
						returnType: 'RECEIVED_AUTHENTICATE_SESSION_RESPONSE',
						payload: payload,
						callback: (authenticateSessionResponse) => {
							this.state.session.authenticationRequested = false;
							if (authenticateSessionResponse.status && authenticateSessionResponse.status === 'success') {
								this.state.session.authenticated = true;
								resolve();
							} else {
								this.state.session.authenticated = false;
								reject('Session failed to authenticate!');
							}
						}
					});
				}
			}
		});
	}

	render() {
		return null;
	}

}

module.exports = WebsocketManager;

/**
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
// @flow

'use strict';

import React, { Component } from 'react';
import {
	Text,
	View,
	NativeModules,
} from 'react-native';

type State = {
    debug: boolean,
};

type Props = {
};

export default class DevMenu extends Component<Props, State> {
props: Props;
state: State;
reload: () => void;
remoteDebug: () => void;
constructor() {
	super();

	this.state = {
		debug: false,
	};

	this.reload = this.reload.bind(this);
	this.remoteDebug = this.remoteDebug.bind(this);
}

remoteDebug() {
	this.setState({
		debug: !this.state.debug,
	}, () => {
		NativeModules.DevSettings.setIsDebuggingRemotely(this.state.debug);
	});
}

reload() {
	NativeModules.DevSettings.reload();
}

render(): Object {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{height: 25}} onPress={this.reload}>
                Reload
			</Text>
			<Text style={{height: 25}} onPress={this.remoteDebug}>
                Enable/Disbale remote debug
			</Text>
		</View>
	);
}
}

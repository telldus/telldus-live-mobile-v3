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

// @flow

'use strict';

import React from 'react';

import {
	View,
	TouchableButton,
} from '../../../../../BaseComponents';
import { ZWaveIncludeExcludeUI } from '../../Common';

import i18n from '../../../../Translations/common';


type Props = {
    appLayout: Object,
    idToReplace: number,

    intl: Object,
	onDoneReplaceFailedNode: () => void,
	registerForWebSocketEvents: (Object) => Object,
};

type State = {
    percent: number,
    timer: number | null,
    status: string | null,
    percent: number,
    showTimer: boolean,
    showThrobber: boolean,
    infoText: string,
    deviceImage: string,
};

class ReplaceFailedNode extends View<Props, State> {
props: Props;
state: State = {
	showTimer: true,
	timer: null,
	status: null,
	percent: 0,
	showThrobber: false,
	deviceImage: 'img_zwave_include',
	infoText: this.props.intl.formatMessage(i18n.messageHint),
};

setSocketListeners: () => void;

constructor(props: Props) {
	super(props);

	this.destroyInstanceWebSocket = null;
	this.sendSocketMessageMeth = null;
}

componentDidMount() {
	const { registerForWebSocketEvents } = this.props;

	const callbacks = {
		callbackOnOpen: this.callbackOnOpen,
		callbackOnMessage: this.callbackOnMessage,
	};

	let {
		sendSocketMessage,
		destroyInstance,
	} = registerForWebSocketEvents(callbacks);
	this.sendSocketMessageMeth = sendSocketMessage;
	this.destroyInstanceWebSocket = destroyInstance;
}

componentWillUnmount() {
	if (this.destroyInstanceWebSocket) {
		this.destroyInstanceWebSocket();
	}
}

callbackOnOpen = () => {
	this.sendFilter('zwave', 'replaceFailedNode');
	this.sendFilter('zwave', 'replaceFailedNodeStartTimeout');
}

sendFilter = (module: string, action: string) => {
	const message = JSON.stringify({
		module: 'filter',
		action: 'accept',
		data: {
			module,
			action,
		},
	});
	this.sendSocketMessage(message);
}

sendSocketMessage = (message: string) => {
	if (this.sendSocketMessageMeth) {
		this.sendSocketMessageMeth(message);
	}
}

callbackOnMessage = (msg: Object) => {
	const {
		onDoneReplaceFailedNode,
		idToReplace,
	} = this.props;

	let message = {};
	try {
		message = JSON.parse(msg.data);
	} catch (e) {
		message = msg.data;
	}
	if (typeof message === 'string') {
		if (message === 'validconnection') {
			const replaceMessage = JSON.stringify({
				module: 'client',
				action: 'forward',
				data: {
					'module': 'zwave',
					'action': 'replaceFailedNode',
					'device': idToReplace,
				},
			});
			this.sendSocketMessage(replaceMessage);
		}
	} else {
		const { module, action, data } = message;
		if (module && action) {
			if (module === 'zwave' && action === 'replaceFailedNodeStartTimeout') {
				if (this.inclusionTimer) {
					clearInterval(this.inclusionTimer);
				}
				this.inclusionTimer = setInterval(() => {
					this.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'replaceFailedNode') {
				let status = data[0];
				if (status === 6) {
					clearInterval(this.inclusionTimer);
					if (data[2] > 0) {
						onDoneReplaceFailedNode();
					}
				}
			}
		}
	}
}

runInclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		this.setState({
			timer: timer ? timer - 1 : data,
			showThrobber: false,
		});
	} else if (timer === 0) {
		this.setState({
			timer: null,
			showThrobber: false,
		}, () => {
			this.clearTimer();
			this.props.onDoneReplaceFailedNode();
		});
	}
}

clearTimer() {
	clearInterval(this.inclusionTimer);
}

render(): Object {

	const {
		intl,
		appLayout,
	} = this.props;
	const {
		percent,
		status,
		timer,
		showTimer,
		showThrobber,
		infoText,
		deviceImage,
	} = this.state;
	const { formatMessage } = intl;

	const progress = Math.max(percent / 100, 0);
	const statusText = (status !== null) ? `${status} (${percent}% ${intl.formatMessage(i18n.done).toLowerCase()})` : ' ';
	const timerText = (timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' ';

	return (
		<>
			<ZWaveIncludeExcludeUI
				progress={progress}
				percent={percent}
				showThrobber={showThrobber}
				status={statusText}
				timer={timerText}
				intl={intl}
				appLayout={appLayout}
				infoText={infoText}
				deviceImage={deviceImage}/>
			<TouchableButton
				text={i18n.defaultNegativeText}
				onPress={this.props.onDoneReplaceFailedNode}/>
		</>
	);
}

}

export default (ReplaceFailedNode: Object);


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
 */

// @flow

'use strict';

import React from 'react';
const isEqual = require('react-fast-compare');

import {
	View,
	TouchableButton,
} from '../../../../../BaseComponents';
import { ZWaveIncludeExcludeUI } from '../../Common';

import i18n from '../../../../Translations/common';

type Props = {
    appLayout: Object,
    clientId: number,

    intl: Object,
    getSocketObject: (number) => any,
    sendSocketMessage: (number, string, string, Object) => any,
	onExcludeSuccess: () => void,
	onPressCancelExclude: () => void,
	processWebsocketMessageForDevice: (string, Object) => null,
};

type State = {
    showTimer: boolean,
	timer: number | null,
	status?: string | null,
	progress: number,
	excludeSucces: boolean,
};

class ExcludeDevice extends View<Props, State> {

props: Props;
state: State;

setSocketListeners: () => void;
onPressCancelExclude: () => void;
onPressOkay: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: undefined,
		progress: 0,
		excludeSucces: false,
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);

	const { clientId, getSocketObject } = this.props;
	this.websocket = getSocketObject(clientId);
	if (this.websocket) {
		this.setSocketListeners();
	}

	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.onPressOkay = this.onPressOkay.bind(this);
}

componentDidMount() {
	const { clientId, sendSocketMessage } = this.props;
	sendSocketMessage(clientId, 'client', 'forward', {
		module: 'zwave',
		action: 'removeNodeFromNetwork',
	});
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.state, nextState);
}

componentWillUnmount() {
	this.clearSocketListeners();
	this.clearTimer();
}

setSocketListeners() {
	const that = this;
	const {
		processWebsocketMessageForDevice,
		intl,
	} = this.props;
	this.websocket.onmessage = (msg: Object) => {
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
		}
		const { module, action, data } = message;
		if (module && action) {
			if (module === 'zwave' && action === 'removeNodeFromNetworkStartTimeout') {
				that.exclusionTimer = setInterval(() => {
					that.runExclusionTimer(data);
				}, 1000);
			}
			if (module === 'device' && action === 'removed') {
				this.setState({
					excludeSucces: true,
					timer: `${intl.formatMessage(i18n.done)}!`,
					status: intl.formatMessage(i18n.messageDeviceExcluded),
					progress: 100,
				});
				this.clearTimer();
			}
			if (module === 'device') {
				processWebsocketMessageForDevice(action, data);
			}
		}
	};
}

runExclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		const progress = timer ? Math.max((data - timer) / 60, 0) : 0;
		this.setState({
			timer: timer ? timer - 1 : data,
			progress,
			status: '',
		});
	} else {
		this.setState({
			timer: null,
			status: 'Exclusion timed out!',
		});
		this.clearTimer();
	}
}

clearTimer() {
	clearInterval(this.exclusionTimer);
}

clearSocketListeners() {
	this.websocket = null;
}

onPressCancelExclude() {
	const { onPressCancelExclude } = this.props;
	this.clearTimer();
	this.clearSocketListeners();
	if (onPressCancelExclude) {
		onPressCancelExclude();
	}
}

onPressOkay() {
	const { onExcludeSuccess } = this.props;
	if (onExcludeSuccess) {
		onExcludeSuccess();
	}
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { timer, status, progress, excludeSucces, showTimer } = this.state;
	const { formatMessage } = intl;

	let timerText = (timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' ';
	timerText = excludeSucces ? timer : timerText;

	return (
		<View style={{
			flex: 1,
		}}>
			<ZWaveIncludeExcludeUI
				progress={progress}
				status={status}
				timer={timerText}
				intl={intl}
				appLayout={appLayout}
				action={'exclude'}/>
			<TouchableButton
				text={excludeSucces ? formatMessage(i18n.defaultPositiveText) : formatMessage(i18n.defaultNegativeText)}
				onPress={excludeSucces ? this.onPressOkay : this.onPressCancelExclude}
				style={{
					marginTop: 10,
				}}/>
		</View>
	);
}
}

export default ExcludeDevice;

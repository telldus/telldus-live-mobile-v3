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
import { LayoutAnimation } from 'react-native';
const isEqual = require('react-fast-compare');

import {
	View,
	TouchableButton,
	IconTelldus,
	Text,
} from '../../../../../BaseComponents';
import { ZWaveIncludeExcludeUI } from '../../Common';

import { LayoutAnimations } from '../../../../Lib';

import i18n from '../../../../Translations/common';

import Theme from '../../../../Theme';

type Props = {
    appLayout: Object,
    clientId: number,

    intl: Object,
    getSocketObject: (number) => any,
    sendSocketMessage: (number, string, string, Object) => any,
	onExcludeSuccess: () => void,
	onExcludeSuccessImmediate: () => void,
	onExcludeTimedoutImmediate: () => void,
	onPressCancelExclude: () => void,
	processWebsocketMessageForDevice: (string, Object) => null,
};

type State = {
    showTimer: boolean,
	timer: number | null,
	status?: string | null,
	progress: number,
	excludeSucces: boolean,
	showThrobber: boolean,
};

class ExcludeDevice extends View<Props, State> {

props: Props;
state: State;

setSocketListeners: () => void;
onPressCancelExclude: () => void;
onPressOkay: () => void;
handleErrorEnterLearnMode: () => void;
startRemoveDevice: () => void;
onPressTryAgain: () => void;
runExclusionTimer: (number) => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: undefined,
		progress: 0,
		excludeSucces: false,
		showThrobber: false,
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);

	const { clientId, getSocketObject } = this.props;

	this.websocket = getSocketObject(clientId);
	if (this.websocket) {
		this.setSocketListeners();
	}

	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);
	this.onPressOkay = this.onPressOkay.bind(this);
	this.startRemoveDevice = this.startRemoveDevice.bind(this);
	this.onPressTryAgain = this.onPressTryAgain.bind(this);
	this.runExclusionTimer = this.runExclusionTimer.bind(this);
}

componentDidMount() {
	this.startRemoveDevice();
}

onPressTryAgain() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		status: undefined,
	}, () => {
		this.startRemoveDevice();
	});
}

stopAddRemoveDevice() {
	const { sendSocketMessage, clientId } = this.props;
	sendSocketMessage(clientId, 'client', 'forward', {
		'module': 'zwave',
		'action': 'removeNodeFromNetworkStop',
	});
	sendSocketMessage(clientId, 'client', 'forward', {
		'module': 'zwave',
		'action': 'addNodeToNetworkStop',
	});
}

startRemoveDevice() {
	const { clientId, sendSocketMessage } = this.props;
	sendSocketMessage(clientId, 'client', 'forward', {
		module: 'zwave',
		action: 'removeNodeFromNetwork',
	});
}

stopRemoveDevice() {
	const { clientId, sendSocketMessage } = this.props;
	sendSocketMessage(clientId, 'client', 'forward', {
		'module': 'zwave',
		'action': 'removeNodeFromNetworkStop',
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
		onExcludeSuccessImmediate,
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
					that.runExclusionTimer(5);
				}, 1000);
			} else if (module === 'zwave' && action === 'removeNodeFromNetwork') {
				let status = data[0];
				if (status === 6) {
					if (data[2] > 0) {
						if (onExcludeSuccessImmediate) {
							onExcludeSuccessImmediate();
						}
						this.setState({
							excludeSucces: true,
							timer: `${intl.formatMessage(i18n.done)}!`,
							status: intl.formatMessage(i18n.messageDeviceExcluded),
							progress: 100,
							showThrobber: false,
						});
						this.clearTimer();
					}
				}
				if (status === 7) {
					that.handleErrorEnterLearnMode();
				}
			}
			if (module === 'device' && action === 'removed') {
				if (onExcludeSuccessImmediate) {
					onExcludeSuccessImmediate();
				}
				this.setState({
					excludeSucces: true,
					timer: `${intl.formatMessage(i18n.done)}!`,
					status: intl.formatMessage(i18n.messageDeviceExcluded),
					progress: 100,
					showThrobber: false,
				});
				this.clearTimer();
			}
			if (module === 'device') {
				processWebsocketMessageForDevice(action, data);
			}
		}
	};
}

handleErrorEnterLearnMode() {
	const { showThrobber } = this.state;
	if (showThrobber) {
		this.setState({
			status: 'Error : could not enter learn mode',
			showThrobber: false,
		});
	} else {
		this.setState({
			showThrobber: true,
			status: '',
		});
		this.stopAddRemoveDevice();
		this.startRemoveDevice();
	}
}

runExclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		const progress = timer ? Math.max((data - timer) / 60, 0) : 0;
		this.setState({
			timer: timer ? timer - 1 : data,
			progress,
			status: '',
			excludeSucces: false,
			showThrobber: false,
		});
	} else {
		const { onExcludeTimedoutImmediate } = this.props;
		if (onExcludeTimedoutImmediate) {
			onExcludeTimedoutImmediate();
		}
		this.setState({
			timer: null,
			status: 'timed out',
			showThrobber: false,
		});
		this.stopRemoveDevice();
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
	const { onPressCancelExclude, sendSocketMessage, clientId } = this.props;
	this.clearTimer();
	this.clearSocketListeners();
	sendSocketMessage(clientId, 'client', 'forward', {
		'module': 'zwave',
		'action': 'removeNodeFromNetworkStop',
	});
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
	const { timer, status, progress, excludeSucces, showTimer, showThrobber } = this.state;
	const { formatMessage } = intl;

	let timerText = (timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' ';
	timerText = excludeSucces ? timer : timerText;

	const {
		infoContainer,
		infoTextStyle,
		statusIconStyle,
		padding,
		brandDanger,
	} = this.getStyles();

	return (
		<View style={{
			flex: 1,
		}}>
			{status === 'timed out' ?
				<View style={infoContainer}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={infoTextStyle}>
						{formatMessage(i18n.noDeviceFoundMessageExclude)}
					</Text>
				</View>
				:
				<View style={{
					flex: 1,
				}}>
					<ZWaveIncludeExcludeUI
						progress={progress}
						status={status}
						timer={timerText}
						intl={intl}
						appLayout={appLayout}
						action={'exclude'}
						showThrobber={showThrobber}/>
					<TouchableButton
						text={excludeSucces ? formatMessage(i18n.defaultPositiveText) : formatMessage(i18n.defaultNegativeText)}
						onPress={excludeSucces ? this.onPressOkay : this.onPressCancelExclude}
						style={{
							marginTop: 10,
						}}/>
				</View>
			}
			{status === 'timed out' && (
				<View style={{
					flex: 1,
				}}>
					<TouchableButton
						text={formatMessage(i18n.tryAgain)}
						onPress={this.onPressTryAgain}
						style={{
							backgroundColor: brandDanger,
						}}/>
					<TouchableButton
						text={formatMessage(i18n.exit)}
						onPress={this.onPressCancelExclude}
						style={{
							marginTop: padding / 2,
						}}/>
				</View>
			)}
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, eulaContentColor, brandSecondary, shadow, brandDanger } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * 0.04;

	return {
		brandDanger,
		padding,
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			margin: padding,
			padding: innerPadding,
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.16,
			color: brandSecondary,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			color: eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: innerPadding,
		},
	};
}
}

export default ExcludeDevice;

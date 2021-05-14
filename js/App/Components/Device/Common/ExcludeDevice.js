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
import { connect } from 'react-redux';

import {
	View,
	TouchableButton,
	InfoBlock,
} from '../../../../BaseComponents';
import ZWaveIncludeExcludeUI from './ZWaveIncludeExcludeUI';
import CantEnterInclusionExclusionUI from './CantEnterInclusionExclusionUI';
import { widgetAndroidDisableWidget } from '../../../Actions/Widget';
import {
	getDeviceManufacturerInfo,
} from '../../../Actions/Devices';

import { LayoutAnimations } from '../../../Lib';

import i18n from '../../../Translations/common';

import Theme from '../../../Theme';

type Props = {
    appLayout: Object,
	clientId: number,
	manufacturerAttributes?: Object,

	dispatch: Function,
    intl: Object,
	onExcludeSuccess: () => void,
	onExcludeSuccessImmediate: () => void,
	onExcludeTimedoutImmediate: () => void,
	onPressCancelExclude: () => void,
	processWebsocketMessage: (string, string, string, Object) => any,
	onCantEnterExclusionTimeout: () => void,
	registerForWebSocketEvents: (Object) => Object,
};

type State = {
    showTimer: boolean,
	timer: number | null,
	status?: string | null,
	progress: number,
	excludeSucces: boolean,
	showThrobber: boolean,
	cantEnterExclusion: boolean,
	cantEnterLearnMode: boolean,
	exclusionDescription?: string,
};

class ExcludeDevice extends View<Props, State> {

props: Props;
state: State;

onPressCancelExclude: () => void;
onPressOkay: () => void;
handleErrorEnterLearnMode: () => void;
startRemoveDevice: () => void;
onPressTryAgain: () => void;
runExclusionTimer: (?number) => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: undefined,
		progress: 0,
		excludeSucces: false,
		showThrobber: false,
		cantEnterExclusion: false,
		cantEnterLearnMode: false,
		exclusionDescription: undefined,
	};

	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);
	this.onPressOkay = this.onPressOkay.bind(this);
	this.startRemoveDevice = this.startRemoveDevice.bind(this);
	this.onPressTryAgain = this.onPressTryAgain.bind(this);
	this.runExclusionTimer = this.runExclusionTimer.bind(this);

	this.enterExclusionModeTimeout = null;
	this.showThrobberTimeout = null;

	this.destroyInstanceWebSocket = null;
	this.sendSocketMessageMeth = null;
}

componentDidMount() {
	const {
		registerForWebSocketEvents,
		manufacturerAttributes = {},
		dispatch,
	} = this.props;

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

	const {
		manufacturerId,
		productId,
		productTypeId,
	} = manufacturerAttributes;
	if (typeof manufacturerId !== 'undefined') {
		dispatch(getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)).then((res: Object = {}) => {
			const {
				ExclusionDescription,
			} = res;
			if (ExclusionDescription) {
				this.setState({
					exclusionDescription: ExclusionDescription,
				});
			}
		});
	}
}

callbackOnOpen = () => {
	this.sendFilter('zwave', 'removeNodeFromNetwork');
	this.sendFilter('zwave', 'removeNodeFromNetworkStartTimeout');
	this.sendFilter('device', 'removed');
	this.sendFilter('sensor', 'removed');
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

onPressTryAgain() {
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	this.setState({
		status: undefined,
	}, () => {
		this.startRemoveDevice();
	});
}

stopAddRemoveDevice() {
	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			'module': 'zwave',
			'action': 'removeNodeFromNetworkStop',
		},
	});
	this.sendSocketMessage(message);
	const message2 = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			'module': 'zwave',
			'action': 'addNodeToNetworkStop',
		},
	});
	this.sendSocketMessage(message2);
}

startRemoveDevice() {
	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			'module': 'zwave',
			'action': 'removeNodeFromNetwork',
		},
	});
	this.sendSocketMessage(message);
}

stopRemoveDevice() {
	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			'module': 'zwave',
			'action': 'removeNodeFromNetworkStop',
		},
	});
	this.sendSocketMessage(message);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.state, nextState);
}

componentWillUnmount() {
	this.clearTimer();
	clearTimeout(this.enterExclusionModeTimeout);
	clearTimeout(this.showThrobberTimeout);

	if (this.destroyInstanceWebSocket) {
		this.destroyInstanceWebSocket();
	}
}

startEnterExclusionModeTimeout() {
	this.enterExclusionModeTimeout = setTimeout(() => {
		const { timer, progress } = this.state;
		if (timer === null && progress === 0) {
			this.cantEnterExclusionMode();
		}
	}, 10000);
}

cantEnterExclusionMode() {
	this.clearTimer();
	clearTimeout(this.showThrobberTimeout);
	this.setState({
		cantEnterExclusion: true,
	}, () => {
		const { onCantEnterExclusionTimeout } = this.props;
		if (onCantEnterExclusionTimeout) {
			onCantEnterExclusionTimeout();
		}
	});
}

startShowThrobberTimeout() {
	this.showThrobberTimeout = setTimeout(() => {
		const { timer, progress, showThrobber } = this.state;
		if (timer === null && progress === 0 && !showThrobber) {
			this.setState({
				showThrobber: true,
			});
		}
	}, 1000);
}

callbackOnMessage = (msg: Object) => {
	const {
		intl,
		onExcludeSuccessImmediate,
	} = this.props;

	let message = {};
	try {
		message = JSON.parse(msg.data);
	} catch (e) {
		message = msg.data;
	}

	const { module, action, data } = message;
	if (typeof message === 'string') {
		if (message === 'validconnection') {
			this.startRemoveDevice();

			this.startEnterExclusionModeTimeout();
			this.startShowThrobberTimeout();
		}
	} else if (module && action) {
		if (module === 'zwave' && action === 'removeNodeFromNetworkStartTimeout') {
			clearTimeout(this.enterExclusionModeTimeout);
			clearTimeout(this.showThrobberTimeout);
			if (this.exclusionTimer) {
				clearInterval(this.exclusionTimer);
			}
			this.exclusionTimer = setInterval(() => {
				this.runExclusionTimer(data);
			}, 1000);
		} else if (module === 'zwave' && action === 'removeNodeFromNetwork') {
			clearTimeout(this.enterExclusionModeTimeout);
			clearTimeout(this.showThrobberTimeout);
			let status = data[0];
			if (status === 6) {
				if (data[2] > 0) {
					this.clearTimer();
					if (onExcludeSuccessImmediate) {
						onExcludeSuccessImmediate();
					} else {
						this.setState({
							excludeSucces: true,
							timer: `${intl.formatMessage(i18n.done)}!`,
							status: intl.formatMessage(i18n.messageDeviceExcluded),
							progress: 100,
							showThrobber: false,
							cantEnterLearnMode: false,
						});
					}
				}
			}
			if (status === 7) {
				this.handleErrorEnterLearnMode();
			}
		}
		if (module === 'device' && action === 'removed') {
			clearTimeout(this.enterExclusionModeTimeout);
			clearTimeout(this.showThrobberTimeout);
			this.clearTimer();
			if (onExcludeSuccessImmediate) {
				onExcludeSuccessImmediate();
			} else {
				this.setState({
					excludeSucces: true,
					timer: `${intl.formatMessage(i18n.done)}!`,
					status: intl.formatMessage(i18n.messageDeviceExcluded),
					progress: 100,
					showThrobber: false,
					cantEnterLearnMode: false,
				});
			}
			const { id } = data;
			widgetAndroidDisableWidget(id, 'DEVICE');
		}
		if (module === 'sensor' && action === 'removed') {
			const { id } = data;
			widgetAndroidDisableWidget(id, 'SENSOR');
		}
	}
}

handleErrorEnterLearnMode() {
	const { showThrobber, cantEnterLearnMode } = this.state;
	if (showThrobber && cantEnterLearnMode) {
		this.cantEnterExclusionMode();
	} else {
		this.setState({
			showThrobber: true,
			status: '',
			cantEnterLearnMode: true,
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
			cantEnterLearnMode: false,
		});
	} else if (timer === 0) {
		const { onExcludeTimedoutImmediate } = this.props;
		this.clearTimer();
		if (onExcludeTimedoutImmediate) {
			onExcludeTimedoutImmediate();
		} else {
			this.setState({
				timer: null,
				status: 'timed out',
				showThrobber: false,
				cantEnterLearnMode: false,
			});
		}
	}
}

clearTimer() {
	clearInterval(this.exclusionTimer);
}

onPressCancelExclude() {
	const { onPressCancelExclude } = this.props;
	this.clearTimer();
	this.stopRemoveDevice();
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
	const {
		timer,
		status,
		progress,
		excludeSucces,
		showTimer,
		showThrobber,
		cantEnterExclusion,
		exclusionDescription,
	} = this.state;
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

	if (cantEnterExclusion) {
		return (
			<CantEnterInclusionExclusionUI
				infoMessage={formatMessage(i18n.couldNotEnterExclusionInfo)}
				onPressExit={this.onPressCancelExclude}
				appLayout={appLayout}
			/>
		);
	}

	return (
		<View style={{
			flex: 1,
		}}>
			{status === 'timed out' ?
				<InfoBlock
					text={formatMessage(i18n.noDeviceFoundMessageExclude)}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={infoTextStyle}
					infoIconStyle={statusIconStyle}/>
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
						showThrobber={showThrobber}
						actionsDescription={exclusionDescription}/>
					<TouchableButton
						text={excludeSucces ? formatMessage(i18n.defaultPositiveText) : formatMessage(i18n.defaultNegativeText)}
						onPress={excludeSucces ? this.onPressOkay : this.onPressCancelExclude}
						style={{
							marginTop: padding / 2,
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
							marginTop: padding / 2,
						}}/>
					<TouchableButton
						text={formatMessage(i18n.exit)}
						onPress={this.onPressCancelExclude}
						style={{
							marginTop: padding,
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
	const {
		paddingFactor,
		brandDanger,
		fontSizeFactorFour,
		fontSizeFactorNine,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * fontSizeFactorFour;

	return {
		brandDanger,
		padding,
		infoContainer: {
			margin: padding,
			padding: innerPadding,
		},
		statusIconStyle: {
			fontSize: deviceWidth * fontSizeFactorNine,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			flexWrap: 'wrap',
			marginLeft: innerPadding,
		},
	};
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default (connect(null, mapDispatchToProps)(ExcludeDevice): Object);

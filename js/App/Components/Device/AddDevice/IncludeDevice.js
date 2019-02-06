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
import { ScrollView } from 'react-native';
const isEqual = require('react-fast-compare');

import {
	View,
	Image,
} from '../../../../BaseComponents';
import { ZWaveIncludeExcludeUI } from '../Common';

import shouldUpdate from '../../../Lib/shouldUpdate';
import {
	checkInclusionComplete,
	handleCommandClasses,
} from '../../../Lib/DeviceUtils';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
	processWebsocketMessage: (string, string, string, Object) => any,
};

type State = {
	showTimer: boolean,
	timer: number | null,
	status: string | null,
	percent: number,
	showThrobber: boolean,
	deviceAlreadyIncluded: boolean,
	hintMessage: string | null,
	interviewPartialStatusMessage: string | null,
	deviceImage: string,
	isBatteried: boolean,
	cantEnterLearnMode: boolean,
};

class IncludeDevice extends View<Props, State> {
props: Props;
state: State;

setSocketListeners: () => void;

zwaveId: ?number;
deviceId: ?number;
mainNodeDeviceId: ?number;
deviceManufactInfo: Object;
deviceProdInfo: Object;
gatewayId: number;

handleErrorEnterLearnMode: () => void;
runInclusionTimer: (number) => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: null,
		percent: 0,
		showThrobber: false,
		deviceAlreadyIncluded: false,
		hintMessage: props.intl.formatMessage(i18n.messageHint),
		interviewPartialStatusMessage: null,
		deviceImage: 'img_zwave_include',
		isBatteried: false,
		cantEnterLearnMode: false,
	};

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.gatewayId = gateway.id;

	if (this.websocket) {
		this.setSocketListeners();
	}

	this.setSocketListeners = this.setSocketListeners.bind(this);
	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);
	this.runInclusionTimer = this.runInclusionTimer.bind(this);

	this.inclusionTimer = null;
	this.interviewTimer = null;
	this.sleepCheckTimeout = null;
	this.partialInclusionCheckTimeout = null;
	this.zwaveId = null;
	this.mainNodeDeviceId = null;
	this.devices = [];
	this.commandClasses = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.enterInclusionModeTimeout = null;
	this.showThrobberTimeout = null;

	this.hasUnmount = false;
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelInclude), formatMessage(i18n.AddZDIncludeHeaderTwo));
	this.startAddDevice();
	this.devices = [];

	this.startEnterInclusionModeTimeout();
	this.startShowThrobberTimeout();
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (nextProps.currentScreen === 'IncludeDevice') {
		if (shouldUpdate(nextProps, this.props, ['addDevice', 'appLayout'])) {
			return true;
		}
		if (!isEqual(this.state, nextState)) {
			return true;
		}
		return false;
	}
	return false;
}

startEnterInclusionModeTimeout() {
	this.enterInclusionModeTimeout = setTimeout(() => {
		const { timer, percent } = this.state;
		if (timer === null && percent === 0) {
			this.navigateToCantEnter();
		}
	}, 10000);
}

startShowThrobberTimeout() {
	this.showThrobberTimeout = setTimeout(() => {
		const { timer, percent, showThrobber } = this.state;
		if (timer === null && percent === 0 && !showThrobber) {
			this.setState({
				showThrobber: true,
			});
		}
	}, 1000);
}

navigateToCantEnter() {
	const { navigation } = this.props;
	const { params = {}} = navigation.state;
	navigation.navigate({
		routeName: 'CantEnterInclusion',
		key: 'CantEnterInclusion',
		params,
	});

	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.clearTimer();
}

setSocketListeners() {
	const that = this;
	const { intl, processWebsocketMessage, navigation } = this.props;
	const { formatMessage } = intl;
	const gateway = navigation.getParam('gateway', {});
	this.latestInterviewTime = null;

	this.websocket.onmessage = (msg: Object) => {
		let title = '';
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
			title = ` ${msg.data}`;
		}

		const { module, action, data } = message;
		if (module && action && !that.hasUnmount) {
			if (module === 'zwave' && action === 'addNodeToNetworkStartTimeout') {
				clearTimeout(that.enterInclusionModeTimeout);
				clearTimeout(that.showThrobberTimeout);
				if (that.inclusionTimer) {
					clearInterval(that.inclusionTimer);
				}
				that.inclusionTimer = setInterval(() => {
					that.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'addNodeToNetwork') {
				clearTimeout(that.enterInclusionModeTimeout);
				clearTimeout(that.showThrobberTimeout);

				let status = data[0];
				if (status === 1) {
					that.setState({
						status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
						showThrobber: false,
						cantEnterLearnMode: false,
					});
				} else if (status === 2) {

					that.startInterviewPoll();

					that.startSleepCheckTimer();
					that.startPartialInclusionCheckTimer();

					that.setState({
						status: formatMessage(i18n.addNodeToNetworkTwo),
						showTimer: false,
						showThrobber: false,
						hintMessage: null,
						cantEnterLearnMode: false,
					});
				} else if (status === 3 || status === 4) {
					clearInterval(that.inclusionTimer);

					that.startSleepCheckTimer();
					that.startPartialInclusionCheckTimer();

					that.startInterviewPoll();

					that.checkDeviceAlreadyIncluded(data[1], false);

					that.zwaveId = data[1];
					that.commandClasses = {};
					that.commandClasses = handleCommandClasses(action, that.commandClasses, data);

					if (status === 3) {
						that.setState({
							status: formatMessage(i18n.addNodeToNetworkThree),
							showTimer: false,
						});
					} else {
						that.setState({
							status: formatMessage(i18n.addNodeToNetworkFour),
							showTimer: false,
						});
					}
				} else if (status === 5) {
					// Add node protocol done
					clearInterval(that.inclusionTimer);

					that.startSleepCheckTimer();

					that.checkDeviceAlreadyIncluded(data[1], false);

					if (!that.zwaveId) {
						that.zwaveId = data[1];
					}
				} else if (status === 6) {
					// Add node done
					// that.clearTimer();
				} else if (status === 7) {
					that.handleErrorEnterLearnMode();
				} else if (status === 0x23) {
					that.handleErrorEnterLearnMode();
				}
			} else if (module === 'zwave' && action === 'interviewDone' && (that.zwaveId === parseInt(data.node, 10))) {
				clearInterval(that.inclusionTimer);
				clearTimeout(that.showThrobberTimeout);
				clearTimeout(that.enterInclusionModeTimeout);
				that.startSleepCheckTimer();

				// If 'hintMessage' is present(most likely device asleep) then,
				// hide the 'hintMessage' only if 'interviewDone' is received twice within 5secs.
				let hintMessage = that.state.hintMessage;
				if (that.latestInterviewTime && hintMessage) {
					let interval = Date.now() - that.latestInterviewTime;
					if (interval < 5000) {
						hintMessage = null;
					}
				}
				that.latestInterviewTime = Date.now();

				that.commandClasses = handleCommandClasses(action, that.commandClasses, data);

				if (that.zwaveId && that.devices.length === 0 && !that.commandClasses) {
					// nodeId(that.zwaveId) is present but newly added list is empty and not present in already added list.
					// Must be dead node remain.
					const { addDevice } = that.props;
					const alreadyIncluded = addDevice.nodeList[that.zwaveId];
					if (!alreadyIncluded) {
						that.navigateToNext({}, 'IncludeFailed');
					}
				}

				if (data.cmdClass === 114) {
					that.deviceProdInfo = data.data;
					that.getDeviceManufactInfo(null, {});
				}
				if (data.cmdClass === 152) {
					const cmdData = data.data;
					if (cmdData.cmdClasses && cmdData.cmdClasses[114]) {
						that.deviceProdInfo = cmdData.cmdClasses[114];
						that.getDeviceManufactInfo(null, {});
					}
				}

				that.checkDeviceAlreadyIncluded(parseInt(data.node, 10), false);

				const { percent, waiting, status } = checkInclusionComplete(that.commandClasses, formatMessage);

				if (percent) {
					that.startPartialInclusionCheckTimer();
					that.setState({
						status,
						percent,
						hintMessage,
					});
					if (waiting === 0) {
						that.setState({
							timer: null,
							status,
							interviewPartialStatusMessage: !hintMessage ? null : that.state.interviewPartialStatusMessage,
						}, () => {
							that.onInclusionComplete();
						});
						that.clearTimer();
					}
				}
			} else if (module === 'zwave' && action === 'sleeping') {
				clearTimeout(that.sleepCheckTimeout);
				that.startPartialInclusionCheckTimer();
				// Battery connected devices.
				that.setState({
					isBatteried: true,
					hintMessage: formatMessage(i18n.deviceSleptBattery),
					interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompleteBattery)}.`,
				});
			} else if (module === 'zwave' && action === 'nodeInfo') {

				if (that.zwaveId !== parseInt(data.nodeId, 10)) {
					return;
				}

				const { parentDeviceId, listening, deviceId } = data;

				let isBatteried = Boolean(!listening);
				if (isBatteried !== that.state.isBatteried) {
					that.setState({
						isBatteried,
					});
				}

				if (parentDeviceId) {
					that.mainNodeDeviceId = parentDeviceId;
				}
				if (!parentDeviceId && deviceId) {
					that.mainNodeDeviceId = deviceId;
				}

				if (!data.cmdClasses) {
					return;
				}
				const manufactInfoCmd = data.cmdClasses[152];
				if (manufactInfoCmd && manufactInfoCmd.interviewed && manufactInfoCmd.cmdClasses[114]) {
					that.deviceProdInfo = manufactInfoCmd.cmdClasses[114];
					that.getDeviceManufactInfo(null, {});
				}

				that.checkDeviceAlreadyIncluded(parseInt(data.nodeId, 10), false);

				that.commandClasses = handleCommandClasses(action, that.commandClasses, data);
				const { percent, waiting, status } = checkInclusionComplete(that.commandClasses, formatMessage);

				if (percent && (percent !== that.state.percent)) {
					that.startPartialInclusionCheckTimer();
					that.setState({
						status,
						percent,
					});
					if (waiting === 0 && that.state.timer !== null) {
						that.setState({
							timer: null,
							status,
						}, () => {
							that.onInclusionComplete();
						});
						that.clearTimer();
					}
				}

			} else if (module === 'device') {
				if (action === 'added') {
					clearTimeout(that.enterInclusionModeTimeout);
					clearTimeout(that.showThrobberTimeout);

					that.startSleepCheckTimer();
					that.startPartialInclusionCheckTimer();

					clearInterval(that.inclusionTimer);

					const { clientDeviceId, id } = data;
					that.devices.push({
						id,
						clientDeviceId,
					});
				}
			}
		}
		processWebsocketMessage(gateway.id.toString(), message, title, that.websocket);
	};
}

handleErrorEnterLearnMode() {
	const { showThrobber, cantEnterLearnMode } = this.state;
	if (showThrobber && cantEnterLearnMode) {
		this.navigateToCantEnter();
	} else {
		this.setState({
			showThrobber: true,
			status: '',
			isBatteried: false,
			cantEnterLearnMode: true,
		});
		// On error restart the whole process
		this.cleanAllClassVariables();
		this.stopAddRemoveDevice();
		this.startAddDevice();
	}
}

checkDeviceAlreadyIncluded(nodeId: number, forceNavigate: boolean = false) {
	const { addDevice } = this.props;
	const alreadyIncluded = addDevice.nodeList[nodeId];
	const { manufacturerId } = this.deviceProdInfo;

	const letNavigate = ((manufacturerId || forceNavigate) && (!this.state.deviceAlreadyIncluded));

	if (alreadyIncluded && letNavigate) {
		const { name } = alreadyIncluded;
		this.setState({
			timer: null,
			status: '',
			deviceAlreadyIncluded: true,
		}, () => {

			// Clear all timers and socket listener - we do not need any memory leak.
			// Do not clear other class variables, as some are required post-getDeviceManufactInfo!!
			this.clearTimer();
			clearTimeout(this.sleepCheckTimeout);
			clearTimeout(this.partialInclusionCheckTimeout);

			this.getDeviceManufactInfo('AlreadyIncluded', {name});
		});
	}
}

runInclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		this.setState({
			timer: timer ? timer - 1 : data,
			showThrobber: false,
			cantEnterLearnMode: false,
		});
	} else if (timer === 0) {
		this.setState({
			timer: null,
			showThrobber: false,
			cantEnterLearnMode: false,
		}, () => {
			clearTimeout(this.sleepCheckTimeout);
			clearTimeout(this.partialInclusionCheckTimeout);
			this.clearTimer();

			const { navigation } = this.props;
			const { params = {}} = navigation.state;
			navigation.navigate({
				routeName: 'NoDeviceFound',
				key: 'NoDeviceFound',
				params,
			});
		});
	}
}

onInclusionComplete() {
	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.getDeviceManufactInfo('DeviceName', {});
}

getDeviceManufactInfo(routeName: string | null, routeParams?: Object = {}) {
	const { actions } = this.props;
	const { manufacturerId, productTypeId, productId } = this.deviceProdInfo;

	let deviceManufactInfo = {
		...routeParams,
	};
	if (manufacturerId) {
		actions.getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)
			.then((res: Object) => {
				const { Image: deviceImage = null, Name: deviceModel = null, Brand: deviceBrand = null } = res;
				if (routeName) {
					Image.prefetch(deviceImage);
					Image.getSize(deviceImage, (width: number, height: number) => {
						if (width && height) {
							deviceManufactInfo = {
								deviceImage,
								deviceModel,
								deviceBrand,
								imageW: width,
								imageH: height,
								...routeParams,
							};
							this.navigateToNext(deviceManufactInfo, routeName);
						}
					}, (failure: any) => {
						deviceManufactInfo = {
							deviceImage,
							deviceModel,
							deviceBrand,
							...routeParams,
						};
						this.navigateToNext(deviceManufactInfo, routeName);
					});
				} else {
					this.setState({
						deviceImage,
					});
				}
			}).catch(() => {
				if (routeName) {
					deviceManufactInfo = {
						deviceImage: null,
						deviceModel: null,
						deviceBrand: null,
						...routeParams,
					};
					this.navigateToNext(deviceManufactInfo, routeName);
				}
			});
	} else if (routeName) {
		this.navigateToNext(deviceManufactInfo, routeName);
	}
}

prepareStatusMessage(): Object {
	const { navigation, intl } = this.props;
	const { formatMessage } = intl;
	const secure = navigation.getParam('secure', false);

	if (!secure) {
		return {};
	}
	if (this.commandClasses && this.commandClasses[152]) {
		if (this.commandClasses[152].includedSecure) {
			return {
				statusMessage: `${formatMessage(i18n.inclusionStatusSecureSuccess)}.`,
				statusIcon: 'security',
			};
		}
		return {
			statusMessage: `${formatMessage(i18n.inclusionStatusSecureFailUnknown)}. ${formatMessage(i18n.inclusionStatusSecureFailPostScript)}.`,
			statusIcon: 'info',
		};

	}
	return {
		statusMessage: `${formatMessage(i18n.inclusionStatusSecureFail)}. ${formatMessage(i18n.inclusionStatusSecureFailPostScript)}.`,
		statusIcon: 'info',
	};
}

navigateToNext(deviceManufactInfo: Object, routeName: string | null) {
	const { navigation } = this.props;
	const { interviewPartialStatusMessage } = this.state;
	const { params = {}} = navigation.state;
	const { statusMessage = null, statusIcon = null } = this.prepareStatusMessage();

	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.clearTimer();

	navigation.navigate({
		routeName,
		key: routeName,
		params: {
			...params,
			devices: this.devices,
			mainNodeDeviceId: this.mainNodeDeviceId,
			info: {...deviceManufactInfo},
			statusMessage,
			statusIcon,
			interviewPartialStatusMessage,
		},
	});
}

componentWillUnmount() {
	this.cleanAllClassVariables();
	this.hasUnmount = true;
	clearTimeout(this.enterInclusionModeTimeout);
	clearTimeout(this.showThrobberTimeout);
}

startSleepCheckTimer() {
	clearTimeout(this.sleepCheckTimeout);
	const that = this;
	this.sleepCheckTimeout = setTimeout(() => {
		const { intl } = that.props;
		const { formatMessage } = intl;

		// Device has gone to sleep, wake him up!
		if (that.state.isBatteried) {
			that.setState({
				hintMessage: formatMessage(i18n.deviceSleptBattery),
				interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompleteBattery)}.`,
			});
		} else {
			that.setState({
				hintMessage: formatMessage(i18n.deviceSleptPower),
				interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompletePower)}.`,
			});
		}
	}, 10000);
}

cleanAllClassVariables() {
	this.clearTimer();
	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.devices = [];
	this.zwaveId = null;
	this.mainNodeDeviceId = null;
	this.commandClasses = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.latestInterviewTime = null;
}

startPartialInclusionCheckTimer() {
	clearTimeout(this.partialInclusionCheckTimeout);
	const that = this;
	this.partialInclusionCheckTimeout = setTimeout(() => {
		that.setState({
			timer: null,
		}, () => {
			if (that.zwaveId && that.devices.length === 0) {
				// nodeId(that.zwaveId) is present but newly added list is empty and not present in already added list.
				// Must be dead node remain.
				const { addDevice } = that.props;
				const alreadyIncluded = addDevice.nodeList[that.zwaveId];
				if (!alreadyIncluded) {
					that.navigateToNext({}, 'IncludeFailed');
					that.stopAddRemoveDevice();
				}

			} else {
				that.onInclusionComplete();
			}
			that.clearTimer();
		});
	}, 25000);
}

startInterviewPoll() {
	if (this.interviewTimer) {
		return;
	}
	let that = this;
	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.interviewTimer = setInterval(() => {
		for (let i = 0; i < that.devices.length; ++i) {
			actions.sendSocketMessage(gateway.id, 'client', 'forward', {
				'module': 'zwave',
				'action': 'nodeInfo',
				'device': that.devices[i].clientDeviceId,
			});
		}
	}, 5000);
}

stopAddRemoveDevice() {
	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});

	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		'module': 'zwave',
		'action': 'removeNodeFromNetworkStop',
	});
	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		'module': 'zwave',
		'action': 'addNodeToNetworkStop',
	});
}

stopAddDevice() {
	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});

	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		'module': 'zwave',
		'action': 'addNodeToNetworkStop',
	});
}

startAddDevice() {
	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	const module = navigation.getParam('module', '');
	const action = navigation.getParam('action', '');
	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		module,
		action,
	});
}

clearTimer() {
	clearInterval(this.inclusionTimer);
	clearInterval(this.interviewTimer);
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { timer, status, percent, showTimer, showThrobber, hintMessage, deviceImage } = this.state;
	const { formatMessage } = intl;

	const progress = Math.max(percent / 100, 0);
	const statusText = (status !== null) ? `${status} (${percent}% ${intl.formatMessage(i18n.done).toLowerCase()})` : ' ';
	const timerText = (timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' ';

	return (
		<ScrollView>
			<ZWaveIncludeExcludeUI
				progress={progress}
				percent={percent}
				showThrobber={showThrobber}
				status={statusText}
				timer={timerText}
				intl={intl}
				appLayout={appLayout}
				infoText={hintMessage}
				deviceImage={deviceImage}/>
		</ScrollView>
	);
}
}

export default IncludeDevice;

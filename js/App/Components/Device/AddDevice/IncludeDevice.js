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
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);
	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);
	this.runInclusionTimer = this.runInclusionTimer.bind(this);

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.gatewayId = gateway.id;
	if (this.websocket) {
		this.setSocketListeners();
	}

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
	this.hasUnmount = false;
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(`3. ${formatMessage(i18n.labelInclude)}`, formatMessage(i18n.AddZDIncludeHeaderTwo));
	this.startAddDevice();
	this.devices = [];
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

setSocketListeners() {
	const that = this;
	const { intl, actions } = this.props;

	const { formatMessage } = intl;
	this.websocket.onmessage = (msg: Object) => {
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
		}

		const { module, action, data } = message;
		if (module && action && !that.hasUnmount) {
			if (module === 'zwave' && action === 'addNodeToNetworkStartTimeout') {
				that.inclusionTimer = setInterval(() => {
					that.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'addNodeToNetwork') {

				let status = data[0];
				if (status === 1) {
					that.setState({
						status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
						showThrobber: false,
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
					});
				} else if (status === 3 || status === 4) {
					clearInterval(this.inclusionTimer);

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
				that.startSleepCheckTimer();

				that.commandClasses = handleCommandClasses(action, that.commandClasses, data);

				if (data.cmdClass === 114) {
					that.deviceProdInfo = data.data;
				}
				if (data.cmdClass === 152) {
					const cmdData = data.data;
					if (cmdData.cmdClasses && cmdData.cmdClasses[114]) {
						that.deviceProdInfo = cmdData.cmdClasses[114];
					}
				}

				that.checkDeviceAlreadyIncluded(parseInt(data.node, 10), false);

				const { percent, waiting, status } = checkInclusionComplete(that.commandClasses, formatMessage);

				if (percent && (percent !== that.state.percent)) {
					that.startPartialInclusionCheckTimer();
					that.setState({
						status,
						percent,
						hintMessage: null,
					});
					if (waiting === 0) {
						that.setState({
							timer: null,
							status,
							interviewPartialStatusMessage: null,
						}, () => {
							that.onInclusionComplete();
						});
						that.clearTimer();
					}
				}
			} else if (module === 'zwave' && action === 'nodeList') {
				actions.processWebsocketMessageForZWave(action, data, that.gatewayId.toString());
			} else if (module === 'zwave' && action === 'sleeping') {
				clearTimeout(that.sleepCheckTimeout);
				that.startPartialInclusionCheckTimer();
				// Battery connected devices.
				that.setState({
					hintMessage: formatMessage(i18n.deviceSleptBattery),
					interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompleteBattery)}.`,
				});
			} else if (module === 'zwave' && action === 'nodeInfo') {

				if (that.zwaveId !== parseInt(data.nodeId, 10)) {
					return;
				}

				if (data.parentDeviceId) {
					that.mainNodeDeviceId = data.parentDeviceId;
				}
				if (!data.parentDeviceId && data.deviceId) {
					that.mainNodeDeviceId = data.deviceId;
				}

				if (!data.cmdClasses) {
					return;
				}
				const manufactInfoCmd = data.cmdClasses[152];
				if (manufactInfoCmd && manufactInfoCmd.interviewed && manufactInfoCmd.cmdClasses[114]) {
					that.deviceProdInfo = manufactInfoCmd.cmdClasses[114];
				}

				that.checkDeviceAlreadyIncluded(parseInt(data.nodeId, 10), false);

				that.commandClasses = handleCommandClasses(action, that.commandClasses, data);
				const { percent, waiting, status } = checkInclusionComplete(that.commandClasses, formatMessage);

				if (percent && (percent !== that.state.percent)) {
					that.setState({
						status,
						percent,
						hintMessage: null,
					});
					if (waiting === 0 && that.state.timer !== null) {
						that.setState({
							timer: null,
							status,
							interviewPartialStatusMessage: null,
						}, () => {
							that.onInclusionComplete();
						});
						that.clearTimer();
					}
				}

			} else if (module === 'device') {
				if (action === 'added') {
					that.startSleepCheckTimer();
					that.startPartialInclusionCheckTimer();
					clearInterval(that.inclusionTimer);
					const { clientDeviceId, id } = data;

					that.devices.push({
						id,
						clientDeviceId,
					});
				}

				actions.processWebsocketMessageForDevice(action, data);
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
			this.clearTimer();

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
		});
	} else {
		this.setState({
			timer: null,
			showThrobber: false,
		}, () => {
			const { navigation } = this.props;
			const { params = {}} = navigation.state;
			navigation.navigate({
				routeName: 'NoDeviceFound',
				key: 'NoDeviceFound',
				params,
			});
			clearTimeout(this.sleepCheckTimeout);
			clearTimeout(this.partialInclusionCheckTimeout);
			this.clearTimer();
		});
	}
}

onInclusionComplete() {
	this.getDeviceManufactInfo('DeviceName', {});
	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
}

getDeviceManufactInfo(routeName: string, routeParams?: Object = {}) {
	const { actions } = this.props;
	const { manufacturerId, productTypeId, productId } = this.deviceProdInfo;

	let deviceManufactInfo = {
		...routeParams,
	};
	if (manufacturerId) {
		actions.getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)
			.then((res: Object) => {
				const { Image: deviceImage = null, Name: deviceModel = null, Brand: deviceBrand = null } = res;
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
			}).catch(() => {
				deviceManufactInfo = {
					deviceImage: null,
					deviceModel: null,
					deviceBrand: null,
					...routeParams,
				};
				this.navigateToNext(deviceManufactInfo, routeName);
			});
	} else {
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

navigateToNext(deviceManufactInfo: Object, routeName: string) {
	const { navigation } = this.props;
	const { interviewPartialStatusMessage } = this.state;
	const gateway = navigation.getParam('gateway', {});
	const { statusMessage = null, statusIcon = null } = this.prepareStatusMessage();

	navigation.navigate({
		routeName,
		key: routeName,
		params: {
			gateway,
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
	this.clearSocketListeners();
	this.clearTimer();
	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.devices = [];
	this.hasUnmount = true;
}

// sleep check for power connected devices.
startSleepCheckTimer() {
	clearTimeout(this.sleepCheckTimeout);
	const that = this;
	this.sleepCheckTimeout = setTimeout(() => {
		// Device has gone to sleep, wake him up!

		const { intl } = that.props;
		that.setState({
			hintMessage: intl.formatMessage(i18n.deviceSleptPower),
			interviewPartialStatusMessage: `${intl.formatMessage(i18n.interviewNotComplete)}. ${intl.formatMessage(i18n.interviewNotCompletePower)}.`,
		});
	}, 10000);
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
					this.navigateToNext({}, 'IncludeFailed');
				}

			} else {
				that.onInclusionComplete();
			}
			that.clearTimer();
		});
	}, 25000);
}

handleDeadRemains() {

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

clearSocketListeners() {
	this.websocket = null;
}

clearTimer() {
	clearInterval(this.inclusionTimer);
	clearInterval(this.interviewTimer);
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { timer, status, percent, showTimer, showThrobber, hintMessage } = this.state;
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
				infoText={hintMessage}/>
		</ScrollView>
	);
}
}

export default IncludeDevice;

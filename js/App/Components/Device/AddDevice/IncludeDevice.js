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
};

class IncludeDevice extends View<Props, State> {
props: Props;
state: State;

setSocketListeners: () => void;

zwaveId: ?number;
deviceId: ?number;
deviceManufactInfo: Object;
deviceProdInfo: Object;
isDeviceAwake: boolean;
isDeviceBatteried: boolean;
gatewayId: number;

handleErrorEnterLearnMode: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: null,
		percent: 0,
		showThrobber: false,
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);
	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.gatewayId = gateway.id;
	if (this.websocket) {
		this.setSocketListeners();
	}

	this.inclusionTimer = null;
	this.interviewTimer = null;
	this.sleepCheckTimeInterval = null;
	this.sleepCheckTimeout = null;
	this.zwaveId = null;
	this.devices = [];
	this.commandClasses = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.isDeviceAwake = true;
	this.isDeviceBatteried = false;
	this.showToast = true;
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
				this.showToast = true;
				that.inclusionTimer = setInterval(() => {
					that.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'addNodeToNetwork') {
				let status = data[0];
				if (status === 1) {
					this.setState({
						status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
						showThrobber: false,
					});
				} else if (status === 2) {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();

					this.startInterviewPoll();

					this.setState({
						status: formatMessage(i18n.addNodeToNetworkTwo),
						showTimer: false,
						showThrobber: false,
					});
				} else if (status === 3 || status === 4) {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();

					this.startInterviewPoll();

					this.checkDeviceAlreadyIncluded(data[1]);

					this.zwaveId = data[1];
					this.commandClasses = {};
					this.commandClasses = handleCommandClasses(action, this.commandClasses, data);

					if (status === 3) {
						this.setState({
							status: formatMessage(i18n.addNodeToNetworkThree),
							showTimer: false,
						});
					} else {
						this.setState({
							status: formatMessage(i18n.addNodeToNetworkFour),
							showTimer: false,
						});
					}
				} else if (status === 5) {
					// Add node protocol done
					this.isDeviceAwake = true;

					this.checkDeviceAlreadyIncluded(data[1]);

					if (!this.zwaveId) {
						this.zwaveId = data[1];
					}
				} else if (status === 6) {
					this.isDeviceAwake = true;
					// Add node done
					// this.clearTimer();
				} else if (status === 7) {
					that.handleErrorEnterLearnMode();
				} else if (status === 0x23) {
					that.handleErrorEnterLearnMode();
				}
			} else if (module === 'zwave' && action === 'interviewDone' && (this.zwaveId === parseInt(data.node, 10))) {
				this.isDeviceAwake = true;

				this.commandClasses = handleCommandClasses(action, this.commandClasses, data);

				if (data.cmdClass === 114) {
					this.deviceProdInfo = data.data;
				}
				const { percent, waiting, status } = checkInclusionComplete(this.commandClasses, formatMessage);

				if (percent && (percent !== this.state.percent)) {
					this.setState({
						status,
						percent,
					});
					if (waiting === 0) {
						this.setState({
							timer: null,
							status,
						}, () => {
							this.onInclusionComplete();
						});
						this.clearTimer();
					}
				}
			} else if (module === 'zwave' && action === 'nodeList') {
				actions.processWebsocketMessageForZWave(action, data, this.gatewayId.toString());
			} else if (module === 'zwave' && action === 'sleeping') {
				actions.showToast('Please try to wake the device manually');
			} else if (module === 'zwave' && action === 'nodeInfo') {
				if (this.zwaveId !== parseInt(data.nodeId, 10)) {
					return;
				}
				if (!data.cmdClasses) {
					return;
				}
				for (let i in this.commandClasses) {
					if (this.commandClasses[i] !== null) {
						continue;
					}
					if (!data.cmdClasses[i]) {
						delete this.commandClasses[i];
						continue;
					}
					if (data.cmdClasses[i].interviewed === 1) {
						this.commandClasses[i] = data.cmdClasses[i];
					}
				}
				const { percent, waiting, status } = checkInclusionComplete(this.commandClasses, formatMessage);

				if (percent && (percent !== this.state.percent)) {
					this.setState({
						status,
						percent,
					});
					if (waiting === 0 && this.state.percent !== 100) {
						this.setState({
							timer: null,
							status,
						}, () => {
							this.onInclusionComplete();
						});
						this.clearTimer();
					}
				}

			} else if (module === 'device') {
				if (action === 'added') {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();
					const { clientDeviceId, id } = data;
					this.devices.push({
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

checkDeviceAlreadyIncluded(nodeId: number) {
	const { addDevice, actions } = this.props;
	const alreadyIncluded = addDevice.nodeList[nodeId];
	if (alreadyIncluded) {
		const { name } = alreadyIncluded;
		actions.showToast(`Device seem to have already included by the name "${name}". Please exclude and try again.`);
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
		});
		this.props.actions.showToast('Inclusion timed out!');
		this.clearTimer();
	}
}

onInclusionComplete() {
	this.getDeviceManufactInfo();
	clearTimeout(this.sleepCheckTimeout);
}

getDeviceManufactInfo() {
	const { actions } = this.props;
	const { manufacturerId, productTypeId, productId } = this.deviceProdInfo;

	let deviceManufactInfo = {};
	if (manufacturerId) {
		actions.getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)
			.then((res: Object) => {
				const { Image: deviceImage = null, Name: deviceName = null, Brand: deviceBrand = null } = res;
				Image.prefetch(deviceImage);
				Image.getSize(deviceImage, (width: number, height: number) => {
					if (width && height) {
						deviceManufactInfo = {
							deviceImage,
							deviceName,
							deviceBrand,
							imageW: width,
							imageH: height,
						};
						this.navigateToNext(deviceManufactInfo);
					}
				}, (failure: any) => {
					deviceManufactInfo = {
						deviceImage,
						deviceName,
						deviceBrand,
					};
					this.navigateToNext(deviceManufactInfo);
				});
			}).catch(() => {
				deviceManufactInfo = {
					deviceImage: null,
					deviceName: null,
					deviceBrand: null,
				};
				this.navigateToNext(deviceManufactInfo);
			});
	} else {
		this.navigateToNext(deviceManufactInfo);
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

navigateToNext(deviceManufactInfo: Object) {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	const { statusMessage = null, statusIcon = null } = this.prepareStatusMessage();

	navigation.navigate({
		routeName: 'DeviceName',
		key: 'DeviceName',
		params: {
			gateway,
			devices: this.devices,
			info: {...deviceManufactInfo},
			statusMessage,
			statusIcon,
		},
	});
}

componentWillUnmount() {
	this.clearSocketListeners();
	this.clearTimer();
	clearTimeout(this.sleepCheckTimeout);
	this.devices = [];
	this.hasUnmount = true;
}

startSleepCheckTimer(timeout: number = 60000) {
	if (!this.sleepCheckTimeout) {
		this.sleepCheckTimeout = setTimeout(() => {
			// Every 10secs check if device is awake.
			this.sleepCheckTimeInterval = setInterval(() => {
				// Change awake state and wait till the next cycle.
				if (this.isDeviceAwake) {
					this.isDeviceAwake = false;
				}
				// Device has gone to sleep, wake him up!
				if (!this.isDeviceAwake && this.showToast && this.state.timer) {
					// TODO: Need to handle devices with and without battery separate, also translate
					const { actions } = this.props;
					actions.showToast('Please try to wake the device manually');
					this.showToast = false;
				}
			}, 10000);
		}, timeout);
	}
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
	const { timer, status, percent, showTimer, showThrobber } = this.state;
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
				appLayout={appLayout}/>
		</ScrollView>
	);
}
}

export default IncludeDevice;

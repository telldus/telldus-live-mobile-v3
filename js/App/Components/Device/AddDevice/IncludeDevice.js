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
	Image,
	ThemedScrollView,
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
	route: Object,

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
runInclusionTimer: (?number) => void;
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

	const { route } = this.props;
	const {
		gateway = {},
	} = route.params || {};
	this.gatewayId = gateway.id;

	this.handleErrorEnterLearnMode = this.handleErrorEnterLearnMode.bind(this);
	this.runInclusionTimer = this.runInclusionTimer.bind(this);

	this.inclusionTimer = null;
	this.interviewTimer = null;
	this.sleepCheckTimeout = null;
	this.partialInclusionCheckTimeout = null;
	this.zwaveId = null;
	this.mainNodeDeviceId = null;
	this.devices = [];
	this.sensors = [];
	this.commandClasses = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.enterInclusionModeTimeout = null;
	this.showThrobberTimeout = null;

	this.destroyInstanceWebSocket = null;
	this.sendSocketMessageMeth = null;
	this.unsubscribeFocusListener = null;
}

componentDidMount() {
	const { onDidMount, intl, actions, navigation } = this.props;

	this.unsubscribeFocusListener = navigation.addListener('focus', () => {
		const callbacks = {
			callbackOnOpen: this.callbackOnOpen,
			callbackOnMessage: this.callbackOnMessage,
		};

		let {
			sendSocketMessage,
			destroyInstance,
		} = actions.registerForWebSocketEvents(this.gatewayId, callbacks);
		this.sendSocketMessageMeth = sendSocketMessage;
		this.destroyInstanceWebSocket = destroyInstance;

		this.devices = [];

		this.startEnterInclusionModeTimeout();
		this.startShowThrobberTimeout();
	});

	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelInclude), formatMessage(i18n.AddZDIncludeHeaderTwo));
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

getNodesList() {
	this.sendSocketMessage(JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			'module': 'zwave',
			'action': 'nodeList',
		},
	}));
}

callbackOnOpen = () => {
	this.sendFilter('device', 'added');
	this.sendFilter('sensor', 'added');
	this.sendFilter('zwave', 'removeNodeFromNetwork');
	this.sendFilter('zwave', 'removeNodeFromNetworkStartTimeout');
	this.sendFilter('zwave', 'addNodeToNetwork');
	this.sendFilter('zwave', 'addNodeToNetworkStartTimeout');
	this.sendFilter('zwave', 'interviewDone');
	this.sendFilter('zwave', 'nodeInfo');
	this.sendFilter('zwave', 'nodeList');
	this.sendFilter('zwave', 'removeFailedNode');
	this.sendFilter('zwave', 'replaceFailedNode');
	this.sendFilter('zwave', 'replaceFailedNodeStartTimeout');
	this.sendFilter('zwave', 'markNodeAsFailed');
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
	const { navigation, route } = this.props;
	const { params = {}} = route;
	navigation.navigate('CantEnterInclusion', {...params});

	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.clearTimer();
}

callbackOnMessage = (msg: Object) => {
	const { intl, actions } = this.props;
	const { formatMessage } = intl;
	this.latestInterviewTime = null;

	let message = {};
	try {
		message = JSON.parse(msg.data);
	} catch (e) {
		message = msg.data;
	}

	if (typeof message === 'string') {
		if (message === 'validconnection') {
			this.getNodesList();
			this.startAddDevice();
		}
	} else {
		const { module, action, data } = message;
		if (module && action) {
			if (module === 'zwave' && action === 'addNodeToNetworkStartTimeout') {
				clearTimeout(this.enterInclusionModeTimeout);
				clearTimeout(this.showThrobberTimeout);
				if (this.inclusionTimer) {
					clearInterval(this.inclusionTimer);
				}
				this.setState({
					status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
				});
				this.inclusionTimer = setInterval(() => {
					this.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'addNodeToNetwork') {
				clearTimeout(this.enterInclusionModeTimeout);
				clearTimeout(this.showThrobberTimeout);

				let status = data[0];
				if (status === 1) {
					this.setState({
						status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
						showThrobber: false,
						cantEnterLearnMode: false,
					});
				} else if (status === 2) {

					this.startInterviewPoll();

					this.startSleepCheckTimer();
					this.startPartialInclusionCheckTimer();

					this.setState({
						status: formatMessage(i18n.addNodeToNetworkTwo),
						showTimer: false,
						showThrobber: false,
						hintMessage: null,
						cantEnterLearnMode: false,
					});
				} else if (status === 3 || status === 4) {
					clearInterval(this.inclusionTimer);

					this.startSleepCheckTimer();
					this.startPartialInclusionCheckTimer();

					this.startInterviewPoll();

					this.checkDeviceAlreadyIncluded(data[1], false);

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
					clearInterval(this.inclusionTimer);

					this.startSleepCheckTimer();

					this.checkDeviceAlreadyIncluded(data[1], false);

					if (!this.zwaveId) {
						this.zwaveId = data[1];
					}
				} else if (status === 6) {
				// Add node done
				// this.clearTimer();
				} else if (status === 7) {
					this.handleErrorEnterLearnMode();
				} else if (status === 0x23) {
					this.handleErrorEnterLearnMode();
				}
			} else if (module === 'zwave' && action === 'interviewDone' && (this.zwaveId === parseInt(data.node, 10))) {
				clearInterval(this.inclusionTimer);
				clearTimeout(this.showThrobberTimeout);
				clearTimeout(this.enterInclusionModeTimeout);
				this.startSleepCheckTimer();

				// If 'hintMessage' is present(most likely device asleep) then,
				// hide the 'hintMessage' only if 'interviewDone' is received twice within 5secs.
				let hintMessage = this.state.hintMessage;
				if (this.latestInterviewTime && hintMessage) {
					let interval = Date.now() - this.latestInterviewTime;
					if (interval < 5000) {
						hintMessage = null;
					}
				}
				this.latestInterviewTime = Date.now();

				this.commandClasses = handleCommandClasses(action, this.commandClasses, data);

				if (this.zwaveId && this.devices.length === 0 && !this.commandClasses) {
				// nodeId(this.zwaveId) is present but newly added list is empty and not present in already added list.
				// Must be dead node remain.
					const { addDevice } = this.props;
					const alreadyIncluded = addDevice.nodeList[this.zwaveId];
					if (!alreadyIncluded) {
						return this.navigateToNext({}, 'IncludeFailed');
					}
				}

				if (data.cmdClass === 114) {
					this.deviceProdInfo = data.data;
					this.getDeviceManufactInfo(null, {});
				}
				if (data.cmdClass === 152) {
					const cmdData = data.data;
					if (cmdData.cmdClasses && cmdData.cmdClasses[114]) {
						this.deviceProdInfo = cmdData.cmdClasses[114];
						this.getDeviceManufactInfo(null, {});
					}
				}

				this.checkDeviceAlreadyIncluded(parseInt(data.node, 10), false);

				const { percent, waiting, status } = checkInclusionComplete(this.commandClasses, formatMessage);

				if (percent) {
					this.startPartialInclusionCheckTimer();
					this.setState({
						status,
						percent,
						hintMessage,
					});
					if (waiting === 0) {
						this.setState({
							timer: null,
							status,
							interviewPartialStatusMessage: !hintMessage ? null : this.state.interviewPartialStatusMessage,
						}, () => {
							this.onInclusionComplete();
						});
						this.clearTimer();
					}
				}
			} else if (module === 'zwave' && action === 'sleeping') {
				clearTimeout(this.sleepCheckTimeout);
				this.startPartialInclusionCheckTimer();
				// Battery connected devices.
				this.setState({
					isBatteried: true,
					hintMessage: formatMessage(i18n.deviceSleptBattery),
					interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompleteBattery)}.`,
				});
			} else if (module === 'zwave' && action === 'nodeInfo') {

				if (this.zwaveId !== parseInt(data.nodeId, 10)) {
					return;
				}

				const { parentDeviceId, listening, deviceId } = data;

				let isBatteried = Boolean(!listening);
				if (isBatteried !== this.state.isBatteried) {
					this.setState({
						isBatteried,
					});
				}

				if (parentDeviceId) {
					this.mainNodeDeviceId = parentDeviceId;
				}
				if (!parentDeviceId && deviceId) {
					this.mainNodeDeviceId = deviceId;
				}

				if (!data.cmdClasses) {
					return;
				}
				const manufactInfoCmd = data.cmdClasses[152];
				if (manufactInfoCmd && manufactInfoCmd.interviewed && manufactInfoCmd.cmdClasses[114]) {
					this.deviceProdInfo = manufactInfoCmd.cmdClasses[114];
					this.getDeviceManufactInfo(null, {});
				}

				this.checkDeviceAlreadyIncluded(parseInt(data.nodeId, 10), false);

				this.commandClasses = handleCommandClasses(action, this.commandClasses, data);
				const { percent, waiting, status } = checkInclusionComplete(this.commandClasses, formatMessage);

				if (percent && (percent !== this.state.percent)) {
					this.startPartialInclusionCheckTimer();
					this.setState({
						status,
						percent,
					});
					if (waiting === 0 && this.state.timer !== null) {
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
					clearTimeout(this.enterInclusionModeTimeout);
					clearTimeout(this.showThrobberTimeout);

					this.startSleepCheckTimer();
					this.startPartialInclusionCheckTimer();

					clearInterval(this.inclusionTimer);

					const { clientDeviceId, id } = data;
					this.devices.push({
						id,
						clientDeviceId,
					});
					actions.deviceAdded(data);
				}
			} else if (module === 'sensor') {
				if (action === 'added') {
					const { clientDeviceId, id } = data;
					this.sensors.push({
						id,
						clientDeviceId,
					});
					actions.sensorAdded(data);
				}
			}
		}
	}
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

			const { navigation, route } = this.props;
			const { params = {}} = route;
			navigation.navigate('NoDeviceFound', {...params});
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
	const { route, intl } = this.props;
	const { formatMessage } = intl;
	const {
		secure = false,
	} = route.params || {};

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
	const { navigation, route } = this.props;
	const { interviewPartialStatusMessage } = this.state;
	const { params = {}} = route;
	const { statusMessage = null, statusIcon = null } = this.prepareStatusMessage();

	clearTimeout(this.sleepCheckTimeout);
	clearTimeout(this.partialInclusionCheckTimeout);
	this.clearTimer();

	navigation.navigate(routeName, {
		...params,
		devices: this.devices,
		mainNodeDeviceId: this.mainNodeDeviceId,
		info: {...deviceManufactInfo},
		statusMessage,
		statusIcon,
		interviewPartialStatusMessage,
		sensors: this.sensors,
		deviceProdInfo: this.deviceProdInfo,
	});
}

componentWillUnmount() {
	this.cleanAllClassVariables();
	clearTimeout(this.enterInclusionModeTimeout);
	clearTimeout(this.showThrobberTimeout);
	if (this.destroyInstanceWebSocket) {
		this.destroyInstanceWebSocket();
	}
	if (this.unsubscribeFocusListener) {
		this.unsubscribeFocusListener();
	}
}

startSleepCheckTimer = () => {
	clearTimeout(this.sleepCheckTimeout);
	this.sleepCheckTimeout = setTimeout(() => {
		const { intl } = this.props;
		const { formatMessage } = intl;

		// Device has gone to sleep, wake him up!
		if (this.state.isBatteried) {
			this.setState({
				hintMessage: formatMessage(i18n.deviceSleptBattery),
				interviewPartialStatusMessage: `${formatMessage(i18n.interviewNotComplete)}. ${formatMessage(i18n.interviewNotCompleteBattery)}.`,
			});
		} else {
			this.setState({
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
	this.sensors = [];
	this.zwaveId = null;
	this.mainNodeDeviceId = null;
	this.commandClasses = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.latestInterviewTime = null;
}

startPartialInclusionCheckTimer = () => {
	clearTimeout(this.partialInclusionCheckTimeout);
	this.partialInclusionCheckTimeout = setTimeout(() => {
		this.setState({
			timer: null,
		}, () => {
			if (this.zwaveId && this.devices.length === 0) {
				// nodeId(this.zwaveId) is present but newly added list is empty and not present in already added list.
				// Must be dead node remain.
				const { addDevice } = this.props;
				const alreadyIncluded = addDevice.nodeList[this.zwaveId];
				if (!alreadyIncluded) {
					this.navigateToNext({}, 'IncludeFailed');
					this.stopAddRemoveDevice();
				}

			} else {
				this.onInclusionComplete();
			}
			this.clearTimer();
		});
	}, 25000);
}

startInterviewPoll = () => {
	if (this.interviewTimer) {
		return;
	}
	this.interviewTimer = setInterval(() => {
		for (let i = 0; i < this.devices.length; ++i) {
			const message = JSON.stringify({
				module: 'client',
				action: 'forward',
				data: {
					module: 'zwave',
					action: 'nodeInfo',
					'device': this.devices[i].clientDeviceId,
				},
			});
			this.sendSocketMessage(message);
		}
	}, 5000);
}

stopAddRemoveDevice() {
	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			module: 'zwave',
			action: 'removeNodeFromNetworkStop',
		},
	});
	this.sendSocketMessage(message);
	const message2 = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			module: 'zwave',
			action: 'addNodeToNetworkStop',
		},
	});
	this.sendSocketMessage(message2);
}

stopAddDevice() {
	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			module: 'zwave',
			action: 'addNodeToNetworkStop',
		},
	});
	this.sendSocketMessage(message);
}

startAddDevice() {
	const { route } = this.props;
	const {
		module = '',
		action = '',
	} = route.params || {};

	const message = JSON.stringify({
		module: 'client',
		action: 'forward',
		data: {
			module,
			action,
		},
	});
	this.sendSocketMessage(message);
}

sendSocketMessage(message: string) {
	if (this.sendSocketMessageMeth) {
		this.sendSocketMessageMeth(message);
	}
}

clearTimer() {
	clearInterval(this.inclusionTimer);
	clearInterval(this.interviewTimer);
}

onPressCancel = () => {
	this.stopAddDevice();
	this.setState({
		timer: null,
		showThrobber: true,
		cantEnterLearnMode: false,
		status: null,
	}, () => {
		clearTimeout(this.sleepCheckTimeout);
		clearTimeout(this.partialInclusionCheckTimeout);
		this.clearTimer();

		const { navigation, route } = this.props;
		const params = route.params || {};
		navigation.navigate('NoDeviceFound', params);
	});
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { timer, status, percent, showTimer, showThrobber, hintMessage, deviceImage } = this.state;
	const { formatMessage } = intl;

	const progress = Math.max(percent / 100, 0);
	const statusText = (status !== null) ? `${status} (${percent}% ${intl.formatMessage(i18n.done).toLowerCase()})` : ' ';
	const timerText = (timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' ';

	return (
		<ThemedScrollView
			level={3}
			style={{
				flex: 1,
			}}
			contentContainerStyle={{flexGrow: 1}}>
			<ZWaveIncludeExcludeUI
				progress={progress}
				percent={percent}
				showThrobber={showThrobber}
				status={statusText}
				timer={timerText}
				intl={intl}
				appLayout={appLayout}
				infoText={hintMessage}
				deviceImage={deviceImage}
				onPressCancel={timerText === ' ' ? undefined : this.onPressCancel}/>
		</ThemedScrollView>
	);
}
}

export default (IncludeDevice: Object);

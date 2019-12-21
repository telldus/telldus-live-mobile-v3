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
 * Telldus Live! app is distributed in the hope this it will be useful,
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
import {
	ScrollView,
} from 'react-native';

import {
	View,
	FloatingButton,
	InfoBlock,
	FullPageActivityIndicator,
	ProgressBarLinear,
} from '../../../../BaseComponents';
import {
	NumberedBlock,
} from './SubViews';
import {
	LearnButton,
} from '../../TabViews/SubViews';

import {
	prepareDeviceParameters,
	get433DevicePostConfigScreenOptions,
} from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';
import TelldusWebsocket from '../../../Lib/Socket';

import i18n from '../../../Translations/common';
import isEmpty from 'lodash/isEmpty';

type Props = {
	appLayout: Object,
	addDevice: Object,
	sessionId: string,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
	processWebsocketMessage: (string, string, string, Object) => any,
	toggleLeftIconVisibilty: (boolean) => void,
};

type State = {
	deviceId: string | null,
	isLoading: boolean,
	progress: number,
	showProgress: boolean,
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	const { navigation, intl } = props;
	const gateway = navigation.getParam('gateway', {});
	const { id } = gateway;
	this.gatewayId = id.toString();

	this.state = {
		deviceId: null,
		isLoading: true,
		showProgress: false,
		progress: 0,
	};

	this.receivingTimer = null;
	this.noAccept = false;
	this.acceptProtocol = '';
	this.acceptModel = '';
	this.miminimScans = 2;
	this.scanResult = {};
	this.scanTimer = null;

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		postConfig,
	} = deviceInfo;
	this.PostConfigScreenOptions = get433DevicePostConfigScreenOptions(postConfig, intl.formatMessage);

	this.socketKeepAliveInterval = null;
}

componentDidMount() {
	this.hasUnmount = false;

	const {
		onDidMount,
		intl,
		navigation,
		actions,
		toggleLeftIconVisibilty,
		sessionId,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));

	const gateway = navigation.getParam('gateway', {});
	const { transports = '', websocketAddress: { address } } = gateway;
	const transportsArr = transports.split(',');

	const websocketUrl = `wss://${address}/websocket`;
	this.websocket = new TelldusWebsocket(this.gatewayId, websocketUrl);
	const auth = `{"module":"auth","action":"auth","data":{"sessionid":"${sessionId}","clientId":"${this.gatewayId}"}}`;

	if (this.websocket) {
		this.websocket.onopen = () => {
			this.sendSocketMessage(auth);

			this.socketKeepAliveInterval = setInterval(() => {
				this.sendSocketMessage('{}');
			}, 20000);

			const filter = {'module': 'device', 'action': 'added'};
			this.sendSocketMessage(JSON.stringify({module: 'filter', action: 'accept', data: filter}));
		};

		this.websocket.onclose = () => {
			clearInterval(this.socketKeepAliveInterval);
		};

		this.setSocketListeners();
	}

	const {
		progress,
		protocol: protocolSO,
		model: modelSO,
	} = this.PostConfigScreenOptions;

	const widgetParams433Device = navigation.getParam('widgetParams433Device', {});
	const deviceInfo = navigation.getParam('deviceInfo', {});
	const deviceName = navigation.getParam('deviceName', '');
	const { protocol, model, widget } = deviceInfo;

	const parameters = prepareDeviceParameters(parseInt(widget, 10), widgetParams433Device) || {};
	const params = {
		protocol,
		model,
		parameters: JSON.stringify(parameters),
		transport: '433',
	};

	if (transportsArr.indexOf('e433') !== -1) {
		actions.addDeviceAction(this.gatewayId, deviceName, params).then((res: Object) => {
			if (res.id) {
				this.setState({
					deviceId: res.id,
					isLoading: false,
				});
				actions.getDevices();
				if (progress) {
					this.startScan(protocolSO, modelSO);
				}
			} else {
				this.setState({
					isLoading: false,
				});
				toggleLeftIconVisibilty(true);
			}
		}).catch(() => {
			this.setState({
				isLoading: false,
			});
			toggleLeftIconVisibilty(true);
		});
	} else if (transportsArr.indexOf('433') === -1 && transportsArr.indexOf('433tx') === -1) {
		this.setState({
			isLoading: false,
		});
		toggleLeftIconVisibilty(true);
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'Include433';
}

componentWillUnmount() {
	this.hasUnmount = true;
	if (this.websocket && this.websocket.destroy) {
		this.websocket.destroy();
		delete this.websocket;
	}
}

startScan = (protocol: string, model: string) => {
	const { navigation } = this.props;
	this.noAccept = false;
	this.setMinimumScans(1);
	this.accept(protocol, model);

	const gateway = navigation.getParam('gateway', {});
	const { transports = '' } = gateway;
	const transportsArr = transports.split(',');

	const filter = {'module': 'client', 'action': 'rawData'};
	this.sendSocketMessage(JSON.stringify({module: 'filter', action: 'accept', data: filter}));

	this.scanResult = {};

	if (transportsArr.indexOf('433') !== -1) {
		this.sendSocketMessage(JSON.stringify({module: 'client', action: 'forward', data: {
			'module': 'rf433',
			'action': 'rawEnabled',
			'value': 1,
		}}));
	}
}

sendSocketMessage = (message: string) => {
	if (this.websocket) {
		this.websocket.send(message);
	}
}

accept = (protocol: string, model: string) => {
	this.acceptProtocol = protocol;
	if (model.indexOf(':') > 0) {
		model = model.substring(0, model.indexOf(':'));
	}
	if (model === 'selflearning-switch') {
		model = 'selflearning';
	} else if (model === 'selflearning-dimmer') {
		model = 'selflearning';
	} else if (model === 'bell') {
		model = 'codeswitch';
	} else if (model === 'selflearning-bell') {
		model = 'selflearning';
	}
	this.acceptModel = model;
}

setMinimumScans = (minimumScans: number) => {
	this.minimumScans = minimumScans;
}

stopScan = () => {
	const { navigation } = this.props;
	this.noAccept = true;

	const gateway = navigation.getParam('gateway', {});
	const { transports = '' } = gateway;
	const transportsArr = transports.split(',');

	const filter = {'module': 'client', 'action': 'rawData'};
	this.sendSocketMessage(JSON.stringify({module: 'filter', action: 'deny', data: filter}));

	this.scanResult = {};

	if (transportsArr.indexOf('433') !== -1) {
		this.sendSocketMessage(JSON.stringify({module: 'client', action: 'forward', data: {
			'module': 'rf433',
			'action': 'rawEnabled',
			'value': 0,
		}}));
	}
}

setSocketListeners = () => {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	const { transports = '' } = gateway;
	const transportsArr = transports.split(',');

	const that = this;

	const {
		progress,
		protocol: protocolSO,
		model: modelSO,
	} = this.PostConfigScreenOptions;

	this.websocket.onmessage = (msg: Object) => {
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
		}
		console.log('TEST message', message);
		if (typeof message === 'string') {
			if (message === 'validconnection' && that.state.isLoading && transportsArr.indexOf('433') !== -1 || transportsArr.indexOf('433tx') !== -1) {
				this.addDeviceToGen2();
			}
		} else {
			// $FlowFixMe
			const { module, action, data } = message;
			if (module && action && !that.hasUnmount && !that.noAccept) {
				const { id } = data;
				if (id) {
					that.setState({
						deviceId: id,
						isLoading: false,
					});
					if (progress) {
						that.startScan(protocolSO, modelSO);
					}
				}

				if (module === 'client' && action === 'rawData') {
					const found = that.parseRawMessage(data);
					console.log('TEST found', found);
					if (found) {
					// $FlowFixMe
						let scans = Math.min(found.scans, 5);
						let progressValue = Math.round(scans / 5.0 * 100);
						that.setState({
							progress: progressValue,
						});

						if (scans >= 5) {
							that.stopScan();
						}
					}
				}
			}
		}
	};
}

parseRawMessage = (data: Object): any => {
	const that = this;

	let protocol = data.protocol;
	let model = data.model;
	let key = `${protocol}:${model}`;

	if (protocol !== that.acceptProtocol) {
		return;
	}
	if (model !== that.acceptModel) {
		return;
	}

	if (that.receivingTimer !== null) {
		clearTimeout(that.receivingTimer);
	}
	that.receivingTimer = setTimeout(() => {
		that.setState({
			showProgress: false,
		});
		that.receivingTimer = null;
	}, 2000);
	that.setState({
		showProgress: true,
	});

	if (!that.scanResult[key]) {
		that.scanResult[key] = [];
	}

	let found = {};
	for (let i = 0; i < that.scanResult[key].length; ++i) {
		if (that.scanResult[key][i].house !== data.house) {
			continue;
		} else if (that.scanResult[key][i].unit !== data.unit) {
			continue;
		} else if (that.scanResult[key][i].code !== data.code) {
			continue;
		}
		that.scanResult[key][i].scans++;
		that.scanResult[key][i].lastReceived = new Date();
		found = that.scanResult[key][i];
		break;
	}

	if (isEmpty(found)) {
		found = {
			'house': data.house,
			'unit': data.unit,
			'code': data.code,
			'scans': 1,
			'lastReceived': new Date(),
		};
		that.scanResult[key].push(found);
	}
	// Find the one most used
	let now = new Date();
	for (let i = 0; i < that.scanResult[key].length; ++i) {
		if (now - that.scanResult[key][i].lastReceived > 2000) {
			// Hasn't been received in 2 seconds. Ignore
			continue;
		}
		if (that.scanResult[key][i].scans < found.scans) {
			continue;
		}
		found = that.scanResult[key][i];
	}

	if (found.scans < that.minimumScans) {
		// Not enough packets received
		return;
	}

	return found;
}

addDeviceToGen2 = () => {
	const { navigation } = this.props;

	const deviceName = navigation.getParam('deviceName', '');
	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		protocol,
		model,
		widget,
	} = deviceInfo;
	this.sendSocketMessage(JSON.stringify({module: 'client', action: 'forward', data: {
		'module': 'rf433',
		'action': 'addDevice',
		'name': deviceName,
		'protocol': protocol,
		'model': model,
		'parameters': widget,
	}}));
}

onNext = () => {
	const { navigation } = this.props;
	const {
		deviceId,
	} = this.state;
	const deviceName = navigation.getParam('deviceName', '');
	// $FlowFixMe
	let rowData = {[deviceId]: {
		id: deviceId,
		name: deviceName,
		index: 0,
		mainNode: true,
	}};
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
		params: {
			newDevices: rowData,
		},
	});
}

render(): Object {
	const { intl, appLayout, navigation } = this.props;
	const { formatMessage } = intl;

	const {
		deviceId,
		isLoading,
		showProgress,
		progress,
	} = this.state;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
		padding,
		iconStyle,
		progressWidth,
		progressBarStyle,
	} = this.getStyles();

	if (isLoading) {
		return <FullPageActivityIndicator/>;
	}
	if (!isLoading && !deviceId) {
		return <InfoBlock
			text={formatMessage(i18n.messageAdd433Failed)}
			appLayout={appLayout}
			infoContainer={[infoContainer, {
				marginVertical: padding,
			}]}
			textStyle={infoTextStyle}/>;
	}

	const uri = {uri: 'img_zwave_include'};

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
	} = deviceInfo;
	const {
		descriptions,
		info,
		learnButtonIndex,
	} = this.PostConfigScreenOptions;

	const Descriptions = descriptions.map((text: string, i: number): Object => {
		return (<NumberedBlock
			key={i}
			number={`${i + 1}.`}
			text={text}
			img={i === learnButtonIndex ? uri : undefined}
			rightBlockIItemOne={
				i === learnButtonIndex ?
					<LearnButton
						id={deviceId}
						style={buttonStyle}/>
					: undefined
			}
			progress={showProgress && <ProgressBarLinear
				progress={progress}
				height={4}
				width={progressWidth}
				borderWidth={0}
				borderColor="transparent"
				unfilledColor={Theme.Core.inactiveSwitchBackground}
				style={progressBarStyle}/>}/>);
	});

	const Info = (info && info.length > 0) ? info.map((text: string, i: number): Object => {
		return (
			<InfoBlock
				key={i}
				text={text}
				appLayout={appLayout}
				infoContainer={infoContainer}
				textStyle={infoTextStyle}/>
		);
	})
		:
		undefined;

	return (
		<View style={{
			flex: 1,
		}}>
			<ScrollView style={{
				flex: 1,
			}}
			contentContainerStyle={containerStyle}>
				{!!Descriptions && Descriptions}
				{!!Info && Info}
			</ScrollView>
			<FloatingButton
				onPress={this.onNext}
				iconName={'checkmark'}
				iconStyle={iconStyle}/>
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
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;

	return {
		padding,
		progressWidth: width - (padding * 4),
		containerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
		},
		buttonStyle: {
			marginTop: padding,
		},
		infoContainer: {
			flex: 0,
			marginHorizontal: padding,
			marginBottom: padding * 5,
		},
		infoTextStyle: {
			color: rowTextColor,
			fontSize: fontSizeText,
		},
		iconStyle: {
			color: '#fff',
		},
		progressBarStyle: {
			marginBottom: padding,
		},
	};
}
}

export default Include433;

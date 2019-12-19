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
import {
	ScrollView,
} from 'react-native';

import {
	View,
	FloatingButton,
	InfoBlock,
	FullPageActivityIndicator,
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

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,

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
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	const { id } = gateway;
	this.gatewayId = id;

	this.state = {
		deviceId: null,
		isLoading: true,
	};

	this.hasUnmount = false;
}

componentDidMount() {
	const {
		onDidMount,
		intl,
		navigation,
		actions,
		toggleLeftIconVisibilty,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));

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

	const gateway = navigation.getParam('gateway', {});
	const { id, transports = '' } = gateway;
	const transportsArr = transports.split(',');
	if (transportsArr.indexOf('433') !== -1 || transportsArr.indexOf('433tx') !== -1) {
		this.websocket = actions.getSocketObject(id);
		if (this.websocket) {
			this.setSocketListeners();
		}

		this.addDeviceToGen2();
	} else if (transportsArr.indexOf('e433') !== -1) {
		actions.addDeviceAction(this.gatewayId, deviceName, params).then((res: Object) => {
			if (res.id) {
				this.setState({
					deviceId: res.id,
					isLoading: false,
				});
				actions.getDevices();
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
	} else {
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
}

setSocketListeners = () => {
	const that = this;
	const { processWebsocketMessage, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});

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
			const { id } = data;
			this.setState({
				deviceId: id,
				isLoading: false,
			});
		}
		processWebsocketMessage(gateway.id.toString(), message, title, that.websocket);
	};
}

addDeviceToGen2 = () => {
	const { navigation, actions } = this.props;

	const deviceName = navigation.getParam('deviceName', '');
	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		protocol,
		model,
		widget,
	} = deviceInfo;

	actions.sendSocketMessage(this.gatewayId, 'client', 'forward', {
		'module': 'rf433',
		'action': 'addDevice',
		'name': deviceName,
		'protocol': protocol,
		'model': model,
		'parameters': widget,
	});
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
	} = this.state;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
		padding,
		iconStyle,
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
		postConfig,
	} = deviceInfo;
	const {
		descriptions,
		info,
		learnButtonIndex,
	} = get433DevicePostConfigScreenOptions(postConfig, formatMessage);

	const Descriptions = descriptions.map((text: string, i: number): Object => {
		return (<NumberedBlock
			number={`${i + 1}.`}
			text={text}
			img={i === learnButtonIndex ? uri : undefined}
			rightBlockIItemOne={
				i === learnButtonIndex ?
					<LearnButton
						id={deviceId}
						style={buttonStyle}/>
					: undefined
			}/>);
	});

	const Info = (info && info.length > 0) ? info.map((text: string): Object => {
		return (
			<InfoBlock
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
	};
}
}

export default Include433;

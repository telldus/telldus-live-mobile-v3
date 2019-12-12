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
	TouchableButton,
	InfoBlock,
	FullPageActivityIndicator,
} from '../../../../BaseComponents';
import {
	NumberedBlock,
} from './SubViews';

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
};

type State = {
	deviceId: string | null,
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.gatewayId = gateway.id;

	this.hasUnmount = false;

	if (this.websocket) {
		this.setSocketListeners();
	}

	this.state = {
		deviceId: null,
	};
}

componentDidMount() {
	const {
		onDidMount,
		intl,
		navigation,
		actions,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));

	const deviceName = navigation.getParam('deviceName', '');
	const deviceProtocol = navigation.getParam('deviceProtocol', '');
	const deviceModel = navigation.getParam('deviceModel', '');
	actions.addDeviceAction(this.gatewayId, deviceName, deviceProtocol, deviceModel).then((res) => {
		if (res.id) {
			this.setState({
				deviceId: res.id,
			});
		}
	});
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
			console.log('TEST data', data);
		}

		processWebsocketMessage(gateway.id.toString(), message, title, that.websocket);
	};
}

onNext = () => {
}

onPressLearn = () => {
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { formatMessage } = intl;

	const {
		deviceId,
	} = this.state;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
	} = this.getStyles();

	if (!deviceId) {
		return <FullPageActivityIndicator/>;
	}

	const uri = {uri: 'img_zwave_include'};

	return (
		<View style={{
			flex: 1,
		}}>
			<ScrollView style={{
				flex: 1,
			}}
			contentContainerStyle={containerStyle}>
				<NumberedBlock
					number={'1.'}
					text={`${formatMessage(i18n.add433DInfoOne)}.`}/>
				<NumberedBlock
					number={'2.'}
					text={`${formatMessage(i18n.add433DInfoTwo)}.`}/>
				<NumberedBlock
					number={'3.'}
					text={`${formatMessage(i18n.add433DInfoThree)}. (${formatMessage(i18n.add433DInfoFour)}.)`}
					img={uri}
					rightBlockIItemOne={
						<TouchableButton
							text={i18n.learn}
							onPress={this.onPressLearn}
							style={buttonStyle}/>
					}/>
				<NumberedBlock
					number={'4.'}
					text={`${formatMessage(i18n.add433DInfoFive)}.`}/>
				<InfoBlock
					text={`${formatMessage(i18n.add433DInfoOnFail)}.`}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={infoTextStyle}/>
			</ScrollView>
			<FloatingButton
				onPress={this.onNext}
				imageSource={{uri: 'right_arrow_key'}}/>
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
			marginHorizontal: padding,
			marginBottom: padding * 5,
		},
		infoTextStyle: {
			color: rowTextColor,
			fontSize: fontSizeText,
		},
	};
}
}

export default Include433;

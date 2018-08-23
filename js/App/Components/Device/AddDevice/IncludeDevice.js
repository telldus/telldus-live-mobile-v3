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
	View,
	Text,
	Image,
	BlockIcon,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';


type Props = {
	appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
};

type State = {
	timer?: number,
};

class IncludeDevice extends View<Props, State> {
props: Props;
state: State;

setSocketListeners: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		timer: null,
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.setSocketListeners();

	this.inclusionTimer = null;
}

componentDidMount() {
	const { onDidMount, actions, navigation } = this.props;
	onDidMount('3. Include', 'Include your device');

	const gateway = navigation.getParam('gateway', {});
	const module = navigation.getParam('module', '');
	const action = navigation.getParam('action', '');
	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		module,
		action,
	});
}

setSocketListeners() {
	const that = this;
	that.websocket.onmessage = (msg: Object) => {
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
		}
		const { module, action, data } = message;
		if (module && action && module === 'zwave') {
			if (action === 'addNodeToNetworkStartTimeout') {
				that.inclusionTimer = setInterval(() => {
					that.runInclusionTimer(data);
				}, 1000);
			}
		}
	};
}

runInclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		this.setState({
			timer: timer ? timer - 1 : data,
		});
	} else {
		this.setState({
			timer: null,
		});
		clearInterval(this.inclusionTimer);
	}
}

onInclusionComplete() {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	navigation.navigate('DeviceName', {
		gateway,
	});
}

componentWillUnmount() {
	this.clearSocketListeners();
	clearInterval(this.inclusionTimer);
}

clearSocketListeners() {
	delete this.websocket;
}

render(): Object {
	const { timer } = this.state;
	const {
		container,
		progressContainer,
		infoContainer,
		imageType,
		textStyle,
		infoIconStyle,
		blockIcontainerStyle,
		markerTextCover,
		markerText,
		timerStyle,
	} = this.getStyles();

	return (
		<View style={container}>
			<View style={progressContainer}>
				<View style={{
					flexDirection: 'column',
				}}>
					<View style={markerTextCover}>
						<Text style={markerText}>
                            1.
						</Text>
					</View>
					<Image source={{uri: 'icon_location_otio_box'}} resizeMode={'cover'} style={imageType}/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'column',
					flexWrap: 'wrap',
				}}>
					<Text style={textStyle}>
Include device by enabling inclusion mode on the device within 60 seconds.
					</Text>
					<Text style={textStyle}>
When in inclusion mode the device will automatically be included.
					</Text>
					{!!timer && (
						<Text style={timerStyle}>
							{timer} Sec
						</Text>
					)}
				</View>
			</View>
			<View style={infoContainer}>
				<BlockIcon icon={'info'} style={infoIconStyle} containerStyle={blockIcontainerStyle}/>
				<View style={{
					flex: 1,
					flexDirection: 'column',
					flexWrap: 'wrap',
				}}>
					<Text style={textStyle}>
This is usually done by clicking three times on the button on the device. Refer to the manual of your device on how to enter inclusion mode.
					</Text>
				</View>
			</View>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, shadow, rowTextColor, brandSecondary, brandPrimary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const blockIconContainerSize = deviceWidth * 0.26;

	return {
		container: {
			flex: 1,
			paddingTop: padding,
			paddingBottom: padding / 2,
		},
		progressContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: 5 + (fontSizeText * 0.5),
			...shadow,
		},
		infoContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: 5 + (fontSizeText * 0.5),
			...shadow,
		},
		markerTextCover: {
			position: 'absolute',
			left: -(5 + (fontSizeText * 0.5)),
			top: -(5 + (fontSizeText * 0.5)),
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: brandPrimary,
			borderBottomRightRadius: deviceWidth * 0.075,
			height: deviceWidth * 0.075,
			width: deviceWidth * 0.17,
		},
		markerText: {
			fontSize: deviceWidth * 0.045,
			color: '#fff',
		},
		imageType: {
			height: deviceWidth * 0.18,
			width: deviceWidth * 0.26,
		},
		textStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
		},
		infoIconStyle: {
			fontSize: blockIconContainerSize / 2,
			color: brandSecondary,
		},
		blockIcontainerStyle: {
			width: blockIconContainerSize,
			height: undefined,
			borderRadius: 0,
			backgroundColor: '#fff',
		},
		timerStyle: {
			fontSize: deviceWidth * 0.045,
			color: brandSecondary,
		},
	};
}
}

export default IncludeDevice;

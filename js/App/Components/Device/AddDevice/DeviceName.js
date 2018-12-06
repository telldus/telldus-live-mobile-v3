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
	Image,
	KeyboardAvoidingView,
} from 'react-native';

import {
	View,
	EditBox,
	FloatingButton,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

type State = {
	deviceName: string,
	isLoading: boolean,
};

class DeviceName extends View<Props, State> {
props: Props;
state: State;

onChangeName: (string) => void;
submitName: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		deviceName: '',
		isLoading: false,
	};
	this.onChangeName = this.onChangeName.bind(this);
	this.submitName = this.submitName.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(`4. ${formatMessage(i18n.name)}`, formatMessage(i18n.AddZDNameHeaderTwo));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'DeviceName';
}

getImageDimensions(appLayout: Object): Object {
	const {
		imageW,
		imageH,
	} = this.props.navigation.getParam('info', {});
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const imageHeight = deviceWidth * 0.25;
	const imageWidth = deviceWidth * 0.29;
	if (!imageW || !imageH) {
		return { imgWidth: imageWidth, imgHeight: imageHeight };
	}

	let ratioHW = imageH / imageW;
	return { imgWidth: imageHeight / ratioHW, imgHeight: imageHeight };
}

onChangeName(deviceName: string) {
	this.setState({
		deviceName,
	});
}

submitName() {
	const { actions, navigation } = this.props;
	const { deviceName } = this.state;
	const deviceId = navigation.getParam('deviceId', null);
	if (deviceName !== '') {
		this.setState({
			isLoading: true,
		});
		actions.setDeviceName(deviceId, deviceName).then(() => {
			actions.getDevices();
			this.setState({
				isLoading: false,
			});
			navigation.navigate('Devices');
		}).catch(() => {
			actions.getDevices();
			this.setState({
				isLoading: false,
			});
			navigation.navigate('Devices');
		});
	}
}

getDeviceInfo(styles: Object): Object {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	const { deviceImage, deviceType } = navigation.getParam('info', {});

	return (
		<View style={styles.deviceInfoCoverStyle}>
			<Image
				source={{uri: deviceImage}}
				resizeMode={'contain'}
				style={styles.deviceImageStyle}/>
			<View>
				{!!deviceType && (<Text style={styles.deviceTypeStyle}>
					{deviceType}
				</Text>
				)}
				{!!gateway.name && (<Text style={styles.deviceGatewayStyle}>
					{gateway.name}
				</Text>
				)}
			</View>
		</View>
	);
}

render(): Object {
	const { deviceName, isLoading } = this.state;
	const { appLayout, intl } = this.props;
	const {
		container,
		iconSize,
		iconStyle,
		...otherStyles
	} = this.getStyles();
	const header = this.getDeviceInfo(otherStyles);

	return (
		<View style={container}>
			<KeyboardAvoidingView behavior="padding" style={{flex: 1}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center'}}>
				<EditBox
					value={deviceName}
					icon={'device-alt'}
					label={intl.formatMessage(i18n.name)}
					header={header}
					onChangeText={this.onChangeName}
					onSubmitEditing={this.submitName}
					appLayout={appLayout}/>
				<FloatingButton
					onPress={this.submitName}
					iconName={this.state.isLoading ? false : 'checkmark'}
					showThrobber={isLoading}
					iconSize={iconSize}
					iconStyle={iconStyle}
				/>
			</KeyboardAvoidingView>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, eulaContentColor, brandSecondary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const { imgWidth, imgHeight } = this.getImageDimensions(appLayout);

	return {
		container: {
			flex: 1,
			paddingVertical: padding,
		},
		iconSize: deviceWidth * 0.050666667,
		iconStyle: {
			fontSize: deviceWidth * 0.050666667,
			color: '#fff',
		},
		deviceInfoCoverStyle: {
			flexDirection: 'row',
			marginBottom: 4,
			alignItems: 'center',
		},
		deviceImageStyle: {
			width: imgWidth,
			height: imgHeight,
			marginRight: padding,
		},
		deviceTypeStyle: {
			fontSize: deviceWidth * 0.05,
			color: brandSecondary,
		},
		deviceGatewayStyle: {
			fontSize: deviceWidth * 0.04,
			color: eulaContentColor,
		},
	};
}
}

export default DeviceName;

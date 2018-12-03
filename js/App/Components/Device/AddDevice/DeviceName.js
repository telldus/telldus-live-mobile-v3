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
import { Image } from 'react-native';

import {
	View,
	EditBox,
	FloatingButton,
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
	deviceImage: string | null,
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
		deviceImage: null,
	};
	this.onChangeName = this.onChangeName.bind(this);
	this.submitName = this.submitName.bind(this);
}

componentDidMount() {
	const { onDidMount, intl, navigation, actions } = this.props;
	const { formatMessage } = intl;
	onDidMount(`4. ${formatMessage(i18n.name)}`, formatMessage(i18n.AddZDNameHeaderTwo));

	const info = navigation.getParam('info', {});
	const { manufacturerId, productTypeId, productId } = info;
	if (manufacturerId) {
		actions.getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)
			.then((res: Object) => {
				const { Image: deviceImage = null } = res;
				this.setState({
					deviceImage,
				});
			});
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'DeviceName';
}

onChangeName(deviceName: string) {
	this.setState({
		deviceName,
	});
}

submitName() {
	this.setState({
		isLoading: true,
	});
	const { actions, navigation } = this.props;
	const { deviceName } = this.state;
	const deviceId = navigation.getParam('deviceId', null);
	if (deviceName !== '') {
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

render(): Object {
	const { deviceName, isLoading, deviceImage } = this.state;
	const { appLayout, intl } = this.props;
	const {
		container,
		iconSize,
		iconStyle,
	} = this.getStyles();

	return (
		<View style={container}>
			<EditBox
				value={deviceName}
				icon={'device-alt'}
				label={intl.formatMessage(i18n.name)}
				onChangeText={this.onChangeName}
				onSubmitEditing={this.submitName}
				appLayout={appLayout}/>
			{!!deviceImage && (
				<Image
					source={{uri: deviceImage}}
					style={{
						height: '100%',
						width: '100%',
						marginTop: 10,
					}}/>
			)}
			<FloatingButton
				onPress={this.submitName}
				iconName={this.state.isLoading ? false : 'checkmark'}
				showThrobber={isLoading}
				iconSize={iconSize}
				iconStyle={iconStyle}
			/>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
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
	};
}
}

export default DeviceName;

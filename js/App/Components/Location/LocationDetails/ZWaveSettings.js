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
import { ScrollView, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';

import {
	View,
	TabBar,
	TouchableButton,
} from '../../../../BaseComponents';
import { ExcludeDevice } from '../../Device/DeviceDetails/SubViews';

import {
	showToast,
	getSocketObject,
	sendSocketMessage,
	processWebsocketMessageForDevice,
} from '../../../Actions';

import { LayoutAnimations } from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	screenProps: Object,
	location: Object,

	navigation: Object,
	showToast: (?string) => void,
	getSocketObject: (number) => any,
	sendSocketMessage: (number, string, string, Object) => any,
	processWebsocketMessageForDevice: (string, Object) => null,
};

type State = {
	excludeActive: boolean,
};

class ZWaveSettings extends View<Props, State> {

static navigationOptions = ({ navigation }: Object): Object => ({
	tabBarLabel: ({ tintColor }: Object): Object => (
		<TabBar
			icon="settings"
			tintColor={tintColor}
			label={i18n.labelZWave}
			accessibilityLabel={i18n.zWaveSettingsTab}/>
	),
	tabBarOnPress: ({scene, jumpToIndex}: Object) => {
		navigation.navigate({
			routeName: 'ZWaveSettings',
			key: 'ZWaveSettings',
		});
	},
});

props: Props;
state: State;

onPressExcludeDevice: () => void;
onPressCancelExclude: () => void;
goBack: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		excludeActive: false,
	};

	this.onPressExcludeDevice = this.onPressExcludeDevice.bind(this);
	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.goBack = this.goBack.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.screenProps.currentScreen === 'ZWaveSettings';
}

onPressExcludeDevice() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		excludeActive: true,
	});
}

onPressCancelExclude() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		excludeActive: false,
	});
}

goBack() {
	this.props.navigation.goBack();
}

supportZWave(transports: string = ''): boolean {
	const items = transports.split(',');
	return items.indexOf('zwave') !== -1;
}

render(): Object {
	const { excludeActive } = this.state;
	const { screenProps, location } = this.props;
	const { intl, appLayout } = screenProps;

	if (!location || !location.id) {
		return <View style={Theme.Styles.emptyBackgroundFill}/>;
	}

	const { id, online = false, websocketOnline = false, transports = '' } = location;
	const canExclude = online && websocketOnline && this.supportZWave(transports);

	const {
		container,
		brandSecondary,
		btnDisabledBg,
	} = this.getStyles(appLayout);

	return (
		<ScrollView style={container}>
			{excludeActive ?
				<ExcludeDevice
					clientId={id}
					appLayout={appLayout}
					intl={intl}
					sendSocketMessage={this.props.sendSocketMessage}
					getSocketObject={this.props.getSocketObject}
					showToast={this.props.showToast}
					processWebsocketMessageForDevice={this.props.processWebsocketMessageForDevice}
					onExcludeSuccess={this.goBack}
					onPressCancelExclude={this.onPressCancelExclude}/>
				:
				<TouchableButton
					text={intl.formatMessage(i18n.headerExclude).toUpperCase()}
					onPress={this.onPressExcludeDevice}
					style={{
						backgroundColor: canExclude ? brandSecondary : btnDisabledBg,
					}}/>
			}
		</ScrollView>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, appBackground, brandSecondary, btnDisabledBg } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		brandSecondary,
		btnDisabledBg,
		container: {
			flex: 1,
			backgroundColor: appBackground,
			padding,
		},
	};
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		sendSocketMessage: (id: number, module: string, action: string, data: Object): any => dispatch(sendSocketMessage(id, module, action, data)),
		getSocketObject: (id: number): any => dispatch(getSocketObject(id)),
		showToast: (message: string): any => dispatch(showToast(message)),
		processWebsocketMessageForDevice: (action: string, data: Object): any => dispatch(processWebsocketMessageForDevice(action, data)),
		dispatch,
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	let { id } = ownProps.navigation.getParam('location', {id: null});
	return {
		location: store.gateways.byId[id],
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ZWaveSettings);

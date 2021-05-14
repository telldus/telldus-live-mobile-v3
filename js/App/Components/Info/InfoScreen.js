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
import { TouchableOpacity, ScrollView, Platform } from 'react-native';
import { connect } from 'react-redux';

import {
	View,
	Text,
	PosterWithText,
	NavigationHeader,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import capitalize from '../../Lib/capitalize';

import {
	showToast,
	addNewGateway,
	selectDevice,
} from '../../Actions';

type Props = {
	screenProps: Object,
	gateways: Object,
	devices: Object,
	route: Object,
	currentScreen: string,

    navigation: Object,
    dispatch: Function,
};

type State = {
    isLoading: boolean,
};

class InfoScreen extends View<Props, State> {
props: Props;

constructor(props: Props) {
	super(props);

	this.state = {
		isLoading: false,
	};

	const { formatMessage } = props.screenProps.intl;

	this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
	this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { currentScreen } = nextProps;
	return currentScreen === 'InfoScreen';
}

goBack = () => {
	this.props.navigation.goBack();
}

addNewLocation = () => {
	const {
		navigation,
		dispatch,
	} = this.props;
	this.setState({
		isLoading: true,
	});
	dispatch(addNewGateway())
		.then((response: Object) => {
			this.setState({
				isLoading: false,
			});
			if (response.client) {
				navigation.navigate('AddLocation', {
					clients: response.client,
				});
			}
		}).catch((error: Object) => {
			this.setState({
				isLoading: false,
			});
			let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
			dispatch(showToast(message));
		});
}

addNewDevice = () => {
	const { gateways, navigation, route } = this.props;
	const gatewaysLen = Object.keys(gateways).length;

	const { clientId = ''} = route.params || {};
	const client = gateways[clientId];

	if (gatewaysLen > 0) {
		const singleGateway = gatewaysLen === 1 || !!client;
		const gateway = singleGateway ? {
			...gateways[Object.keys(gateways)[0]],
		} : client ? {
			...client,
		} : null;

		if (singleGateway) {
			navigation.navigate('AddDevice', {
				gateway,
				screen: 'SelectDeviceType',
				params: {
					gateway,
					singleGateway,
				},
			});
		} else {
			navigation.navigate('AddDevice', {
				screen: 'SelectLocation',
				params: {
					singleGateway,
				},
			});
		}
	}
}

addNewSchedule = () => {
	const { navigation, dispatch, devices, route } = this.props;

	const { deviceId = '', ...others } = route.params || {};

	const {
		supportedMethods = {},
		id,
	} = devices[deviceId] || {};

	if (id) {
		dispatch(selectDevice(id));

		const screen = supportedMethods.THERMOSTAT ? 'ActionThermostat' : 'Action';

		navigation.navigate('Schedule', {
			editMode: false,
			screen,
			params: {
				...others,
				editMode: false,
			},
		});
	} else {
		navigation.navigate('Schedule', {
			...others,
			editMode: false,
		});
	}
}

getContents = (): Object => {
	const {
		route,
		screenProps,
	} = this.props;
	const {
		formatMessage,
	} = screenProps.intl;

	const { info = ''} = route.params || {};

	const posterH1 = capitalize(formatMessage(i18n.getStarted)),
		cancelLabel = formatMessage(i18n.labelNotNow),
		cancelOnPress = this.goBack;

	switch (info) {
		case 'add_gateway':
			return {
				posterH1,
				posterH2: formatMessage(i18n.gatewayAdd),
				icon: 'location',
				h1: `${formatMessage(i18n.messageTitle)}!`,
				body: Platform.OS === 'android' ? formatMessage(i18n.askAddGatewayInfoAndroid) :
					formatMessage(i18n.askAddGatewayInfo),
				buttonLabel: formatMessage(i18n.gatewayAdd),
				buttonOnPress: this.addNewLocation,
				cancelLabel,
				cancelOnPress,
			};
		case 'add_device':
			return {
				posterH1,
				posterH2: formatMessage(i18n.iconAddPhraseOneD),
				icon: 'outlet',
				h1: formatMessage(i18n.askAddDevice),
				body: formatMessage(i18n.askAddDeviceInfo),
				buttonLabel: formatMessage(i18n.iconAddPhraseOneD),
				buttonOnPress: this.addNewDevice,
				cancelLabel,
				cancelOnPress,
			};
		case 'add_schedule':
			return {
				posterH1,
				posterH2: formatMessage(i18n.scheduleDevice),
				icon: 'time',
				h1: formatMessage(i18n.askAddSchedule),
				body: formatMessage(i18n.askAddScheduleInfo),
				buttonLabel: formatMessage(i18n.scheduleMyDevice),
				buttonOnPress: this.addNewSchedule,
				cancelLabel,
				cancelOnPress,
			};
		case 'add_schedule_another':
			return {
				posterH1,
				posterH2: formatMessage(i18n.scheduleDevice),
				icon: 'time',
				h1: formatMessage(i18n.askAddScheduleAnother),
				body: formatMessage(i18n.askAddScheduleAnotherInfo),
				buttonLabel: formatMessage(i18n.scheduleMyDevice),
				buttonOnPress: this.addNewSchedule,
				cancelLabel,
				cancelOnPress,
			};
		default:
			return {};
	}
}

render(): Object | null {
	const {
		screenProps,
		navigation,
	} = this.props;
	const {
		appLayout,
	} = screenProps;

	const {
		isLoading,
	} = this.state;

	const styles = this.getStyles(appLayout);

	const {
		posterH1,
		posterH2,
		icon,
		h1,
		body,
		buttonLabel,
		buttonOnPress,
		cancelLabel,
		cancelOnPress,
	} = this.getContents();

	return (
		<View
			level={3}
			style={styles.modalContainer}>
			<NavigationHeader
				showLeftIcon={true}
				topMargin={false}
				leftIcon={'close'}
				navigation={navigation}/>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.SVContentContainerStyle}
				nestedScrollEnabled={true}>
				<PosterWithText
					appLayout={appLayout}
					align={'left'}
					h1={posterH1}
					h2={posterH2}
					showLeftIcon={true}
					showBackButton={true}
					leftIcon={'close'}
					scrollableH1={true}
					navigation={navigation}/>
				<View
					level={2}
					style={styles.contentContainerStyle}>
					<IconTelldus
						icon={icon}
						level={23}
						style={styles.iconStyle}/>
					<Text
						level={26}
						style={styles.h1Style}>
						{h1}
					</Text>
					<Text
						level={25}
						style={styles.bodyStyle}>
						{body}
					</Text>
				</View>
				<TouchableButton
					text={buttonLabel}
					onPress={buttonOnPress}
					style={styles.buttonStyle}
					disabled={isLoading}
					showThrobber={isLoading}/>
				<TouchableOpacity
					onPress={cancelOnPress}
					disabled={isLoading}>
					<Text
						level={23}
						style={styles.cancelStyle}>
						{cancelLabel}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		fontSizeFactorFour,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		modalContainer: {
			flex: 1,
		},
		scrollView: {
			flex: 1,
		},
		SVContentContainerStyle: {
			flexGrow: 1,
			alignItems: 'center',
			paddingBottom: padding,
		},
		contentContainerStyle: {
			marginTop: padding,
			marginHorizontal: padding,
			alignItems: 'center',
			...shadow,
			borderRadius: 2,
			padding: padding * 2,
		},
		iconStyle: {
			fontSize: Math.floor(deviceWidth * 0.3),
		},
		h1Style: {
			fontSize: Math.floor(deviceWidth * 0.06),
			fontWeight: '500',
		},
		bodyStyle: {
			marginTop: 10,
			textAlign: 'left',
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
		},
		buttonStyle: {
			marginTop: padding * 2,
			width: width * 0.8,
		},
		cancelStyle: {
			marginTop: padding * 2,
			fontSize: Math.floor(deviceWidth * fontSizeFactorEight),
			fontWeight: '500',
		},
	};
}

noOP() {
}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { byId: gateways = {} } = state.gateways;
	const { byId: devices = {} } = state.devices;

	const {
		screen: currentScreen,
	} = state.navigation;

	return {
		gateways,
		devices,
		currentScreen,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(InfoScreen): Object);

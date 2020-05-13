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
import { NavigationActions } from 'react-navigation';

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

import {
	showToast,
	addNewGateway,
	selectDevice,
} from '../../Actions';

type Props = {
	screenProps: Object,
	gateways: Object,
	devices: Object,

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
	const { currentScreen } = nextProps.screenProps;
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
				// TODO: refactor in app v3.15(RNavigation v5)
				navigation.navigate(
					{
						routeName: 'AddLocation',
						key: 'AddLocation',
						params: {
							clients: response.client,
						},
					}
				);
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
	const { gateways, navigation } = this.props;
	const gatewaysLen = Object.keys(gateways).length;

	const clientId = navigation.getParam('clientId', '');
	const client = gateways[clientId];

	if (gatewaysLen > 0) {
		const singleGateway = gatewaysLen === 1 || !!client;
		const gateway = singleGateway ? {
			...gateways[Object.keys(gateways)[0]],
		} : client ? {
			...client,
		} : null;
		// TODO: refactor in app v3.15(RNavigation v5)
		navigation.navigate(
			{
				routeName: 'AddDevice',
				key: 'AddDevice',
				params: {
					selectLocation: !singleGateway,
					gateway,
				},
			});
	}
}

addNewSchedule = () => {
	const { navigation, dispatch, devices } = this.props;

	const deviceId = navigation.getParam('deviceId', '');
	const {
		supportedMethods = {},
		id,
	} = devices[deviceId] || {};

	// TODO: refactor in app v3.15(RNavigation v5)
	if (id) {
		dispatch(selectDevice(id));

		const routeName = supportedMethods.THERMOSTAT ? 'ActionThermostat' : 'Action';
		const key = supportedMethods.THERMOSTAT ? 'ActionThermostat' : 'Action';

		let navigateAction = NavigationActions.navigate({
			routeName: 'Schedule',
			key: 'Schedule',
			params: { editMode: false },
			action: NavigationActions.navigate({
				routeName,
				key,
				params: { editMode: false },
			}),
		});
		navigation.dispatch(navigateAction);
	} else {
		navigation.navigate({
			routeName: 'Schedule',
			key: 'Schedule',
			params: { editMode: false },
		});
	}
}

getContents = (): Object => {
	const {
		navigation,
		screenProps,
	} = this.props;
	const {
		formatMessage,
	} = screenProps.intl;

	const info = navigation.getParam('info', '');

	const posterH1 = formatMessage(i18n.getStarted),
		cancelLabel = formatMessage(i18n.labelNotNow).toUpperCase(),
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
		<View style={styles.modalContainer}>
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
					align={'right'}
					h1={posterH1}
					h2={posterH2}
					showLeftIcon={true}
					showBackButton={true}
					leftIcon={'close'}
					scrollableH1={true}
					navigation={navigation}/>
				<View style={styles.contentContainerStyle}>
					<IconTelldus
						icon={icon}
						style={styles.iconStyle}/>
					<Text style={styles.h1Style}>
						{h1}
					</Text>
					<Text style={styles.bodyStyle}>
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
					<Text style={styles.cancelStyle}>
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
		appBackground,
		brandSecondary,
		eulaContentColor,
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		modalContainer: {
			flex: 1,
			backgroundColor: appBackground,
		},
		scrollView: {
			flex: 1,
			backgroundColor: appBackground,
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
			backgroundColor: '#fff',
			...shadow,
			borderRadius: 2,
			padding: padding * 2,
		},
		iconStyle: {
			fontSize: Math.floor(deviceWidth * 0.3),
			color: brandSecondary,
		},
		h1Style: {
			fontSize: Math.floor(deviceWidth * 0.06),
			color: eulaContentColor,
			fontWeight: '500',
		},
		bodyStyle: {
			marginTop: 10,
			textAlign: 'left',
			fontSize: Math.floor(deviceWidth * 0.04),
			color: rowTextColor,
		},
		buttonStyle: {
			marginTop: padding * 2,
			width: width * 0.8,
		},
		cancelStyle: {
			marginTop: padding * 2,
			fontSize: Math.floor(deviceWidth * 0.045),
			color: brandSecondary,
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
	return {
		gateways,
		devices,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoScreen);

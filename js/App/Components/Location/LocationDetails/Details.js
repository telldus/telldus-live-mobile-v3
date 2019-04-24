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
	TouchableOpacity,
	TouchableWithoutFeedback,
	Alert,
	NetInfo,
	ScrollView,
	BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import {
	View, Text, TouchableButton, StyleSheet,
	FormattedNumber, Icon, TitledInfoBlock,
	TabBar, Throbber,
} from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';
import Status from '../../TabViews/SubViews/Gateway/Status';

import { getGatewayInfo, getGateways, removeGateway } from '../../../Actions/Gateways';
import { getAppData } from '../../../Actions/AppData';
import { hasTokenExpired } from '../../../Lib';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	location: Object,
	dispatch: Function,
	screenProps: Object,
	pushToken: boolean | string,
};

type State = {
	isLoading: boolean,
	showTestLocalControl: boolean,
};

class Details extends View<Props, State> {
	props: Props;
	state: State;

	onEditName: () => void;
	onEditTimeZone: () => void;
	onEditGeoPosition: () => void;
	onPressRemoveLocation: () => void;

	labelName: string;
	labelTimeZone: string;
	labelGeoPosition: string;
	labelLat: string;
	labelLong: string;
	labelIPPublic: string;
	labelIPLocal: string;
	labelSoftware: string;
	confirmMessage: string;

	onPressGatewayInfo: () => void;
	infoPressCount: number;
	timeoutInfoPress: any;

	labelAutoDetected: string;

	onConfirmRemoveLocation: () => void;

	onPressTestLocalControl: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="home"
				tintColor={tintColor}
				label={i18n.overviewHeader}
				accessibilityLabel={i18n.locationOverviewTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate({
				routeName: 'LOverview',
				key: 'LOverview',
			});
		},
	});

	handleBackPress: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: false,
			showTestLocalControl: false,
		};

		let { formatMessage } = props.screenProps.intl;
		this.labelName = formatMessage(i18n.name);
		this.labelTimeZone = formatMessage(i18n.headerOneTimeZoneCity);
		this.labelGeoPosition = formatMessage(i18n.geoPosition);
		this.labelLat = formatMessage(i18n.latitude);
		this.labelLong = formatMessage(i18n.longitude);
		this.labelIPPublic = formatMessage(i18n.ipPublic);
		this.labelIPLocal = formatMessage(i18n.ipLocal);
		this.labelSoftware = formatMessage(i18n.software);

		this.labelAutoDetected = formatMessage(i18n.hint);

		this.confirmMessage = formatMessage(i18n.confirmDelete);

		this.labelDelete = formatMessage(i18n.delete);

		this.onEditName = this.onEditName.bind(this);
		this.onEditTimeZone = this.onEditTimeZone.bind(this);
		this.onEditGeoPosition = this.onEditGeoPosition.bind(this);
		this.onPressRemoveLocation = this.onPressRemoveLocation.bind(this);

		this.onPressGatewayInfo = this.onPressGatewayInfo.bind(this);
		this.infoPressCount = 0;
		this.timeoutInfoPress = null;

		this.onPressTestLocalControl = this.onPressTestLocalControl.bind(this);

		this.labelModalheaderOnDel = `${formatMessage(i18n.delete)} ${formatMessage(i18n.location)}?`;

		this.onConfirmRemoveLocation = this.onConfirmRemoveLocation.bind(this);
		this.onRemoveLocationError = `${formatMessage(i18n.failureRemoveLocation)}, ${formatMessage(i18n.please).toLowerCase()} ${formatMessage(i18n.tryAgain)}.`;

		this.localControlNotSupportedTellSticks = ['TellStick Net', 'TelldusCenter'];

		this.handleBackPress = this.handleBackPress.bind(this);
	}

	componentDidMount() {
		const { location, navigation, dispatch } = this.props;
		if (location && location.id) {
			let { id } = location, extras = 'timezoneAutodetect';
			dispatch(getGatewayInfo({id}, extras)).then((response: Object) => {
				let { autodetectedTimezone } = response;
				let { params } = navigation.state;
				let newParams = { ...params, autodetectedTimezone };
				navigation.setParams(newParams);
			});
		}
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'LOverview';
	}

	componentWillUnmount() {
		this.infoPressCount = 0;
		clearTimeout(this.timeoutInfoPress);

		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let { navigation, screenProps } = this.props;
		if (screenProps.currentScreen === 'LOverview') {
			navigation.pop();
			return true;
		}
		return false;
	}

	onEditName() {
		const { navigation, location } = this.props;
		navigation.navigate({
			routeName: 'EditName',
			key: 'EditName',
			params: {
				id: location.id,
				name: location.name,
			},
		});
		this.infoPressCount = 0;
	}

	onEditTimeZone() {
		let { navigation, location = {} } = this.props;
		let { params } = navigation.state;
		let newParams = { ...params, id: location.id, timezone: location.timezone };
		navigation.navigate('EditTimeZoneContinent', newParams);
		this.infoPressCount = 0;
	}

	onEditGeoPosition() {
		let { navigation, location = {} } = this.props;
		let { latitude, longitude, id } = location;
		navigation.navigate({
			routeName: 'EditGeoPosition',
			key: 'EditGeoPosition',
			params: {
				id, latitude, longitude,
			},
		});
		this.infoPressCount = 0;
	}

	onPressRemoveLocation() {
		const { screenProps } = this.props;
		const dialogueData = {
			show: true,
			header: this.labelModalheaderOnDel,
			positiveText: this.labelDelete.toUpperCase(),
			showPositive: true,
			showNegative: true,
			onPressPositive: this.onConfirmRemoveLocation,
			closeOnPressPositive: true,
			text: this.confirmMessage,
			showHeader: true,
		};
		screenProps.toggleDialogueBox(dialogueData);
		this.infoPressCount = 0;
	}

	onConfirmRemoveLocation() {
		const { dispatch, navigation, screenProps } = this.props;
		const location = navigation.getParam('location', {id: null});
		this.setState({
			isLoading: true,
		});
		dispatch(removeGateway(location.id)).then((res: Object) => {
			dispatch(getGateways()).then(() => {
				dispatch(getAppData());
			});
			this.setState({
				isLoading: false,
			}, () => {
				navigation.pop();
			});
		}).catch(() => {
			this.setState({
				isLoading: false,
			});
			const dialogueData = {
				show: true,
				showPositive: true,
				text: this.onRemoveLocationError,
				showHeader: true,
				closeOnPressPositive: true,
			};
			screenProps.toggleDialogueBox(dialogueData);
		});
	}

	onPressGatewayInfo() {
		clearTimeout(this.timeoutInfoPress);
		this.infoPressCount++;
		if (this.infoPressCount >= 5) {
			const { location = {}, pushToken } = this.props;
			const { online, websocketOnline, localKey = {} } = location;
			NetInfo.getConnectionInfo().then((connectionInfo: Object) => {
				this.infoPressCount = 0;
				const { type, effectiveType } = connectionInfo;
				const { ttl = null } = localKey;
				const tokenExpired = hasTokenExpired(ttl);
				const deviceName = DeviceInfo.getDeviceName();
				const deviceUniqueID = DeviceInfo.getUniqueID();
				const debugData = {
					online,
					websocketOnline,
					...localKey,
					tokenExpired,
					connectionType: type,
					connectionEffectiveType: effectiveType,
					deviceName,
					deviceUniqueID,
					pushToken,
				};
				Alert.alert('Gateway && Network Info', JSON.stringify(debugData));
			});
		}
		this.timeoutInfoPress = setTimeout(() => {
			this.infoPressCount = 0;
		}, 3000);
	}

	onPressTestLocalControl() {
		const { location, navigation } = this.props;
		navigation.navigate({
			routeName: 'TestLocalControl',
			key: 'TestLocalControl',
			params: {
				location,
			},
		});
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, localKey: Object): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.screenProps.intl} localKey={localKey}/>
		);
	}

	render(): Object | null {
		const { isLoading } = this.state;
		const { location, screenProps } = this.props;
		const { appLayout } = screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSize = Math.floor(deviceWidth * 0.045);
		const iconSize = Math.floor(deviceWidth * 0.08);

		if (!location) {
			return null;
		}

		const {
			name,
			type,
			ip,
			version,
			timezone,
			latitude,
			longitude,
			online,
			websocketOnline,
			localKey = {},
			timezoneAutodetected,
		} = location;
		const { address, key } = localKey;
		const image = getLocationImageUrl(type);
		const {
			locationImage,
			textName,
			locationInfo,
			infoOneContainerStyle,
			boxItemsCover,
			padding,
			container,
			throbberContainer,
			minWidthButton,
		} = this.getStyles(appLayout);

		let info = this.getLocationStatus(online, websocketOnline, localKey);

		const timezoneLabel = timezoneAutodetected ? `${this.labelTimeZone}\n(${this.labelAutoDetected})` : this.labelTimeZone;

		const supportLocalControl = this.localControlNotSupportedTellSticks.indexOf(type) === -1;

		return (
			<ScrollView style={{
				flex: 1,
				backgroundColor: Theme.Core.appBackground,
			}}>
				<View style={container}>
					<LabelBox containerStyle={infoOneContainerStyle} appLayout={appLayout}>
						<Image resizeMode={'contain'} style={locationImage} source={{ uri: image, isStatic: true }} />
						<TouchableWithoutFeedback style={{flex: 1}} onPress={this.onPressGatewayInfo}>
							<View style={boxItemsCover}>
								<Text style={[textName]}>
									{type}
								</Text>
								<Text style={locationInfo}>
									{`${this.labelIPPublic}: ${ip}`}
								</Text>
								{
									(!!address && !!key) && (
										<Text style={locationInfo}>
											{`${this.labelIPLocal}: ${address}`}
										</Text>
									)
								}
								<Text style={locationInfo}>
									{`${this.labelSoftware}: v${version}`}
								</Text>
								{!!info && (info)}
							</View>
						</TouchableWithoutFeedback>
					</LabelBox>
					<TitledInfoBlock
						label={this.labelName}
						value={name}
						icon={'angle-right'}
						iconColor="#A59F9A90"
						blockContainerStyle={{
							marginTop: padding / 2,
							marginBottom: padding / 2,
						}}
						valueTextStyle={{
							marginRight: 20,
						}}
						onPress={isLoading ? null : this.onEditName}
					/>
					<TitledInfoBlock
						label={timezoneLabel}
						value={timezone}
						icon={'angle-right'}
						iconColor="#A59F9A90"
						blockContainerStyle={{
							marginBottom: padding / 2,
						}}
						valueTextStyle={{
							marginRight: 20,
						}}
						onPress={isLoading ? null : this.onEditTimeZone}
					/>
					<TouchableOpacity style={[styles.infoTwoContainerStyle, {
						padding: fontSize,
						marginBottom: padding / 2,
					}]} onPress={isLoading ? null : this.onEditGeoPosition}>
						<Text style={[styles.textLabel, {fontSize}]}>
							{this.labelGeoPosition}
						</Text>
						<View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 20 }}>
							<Text style={[styles.textValue, {fontSize}]}>
								{`${this.labelLat}: `}
								<FormattedNumber value={latitude} maximumFractionDigits={3} style={[styles.textValue, {fontSize}]}/>
							</Text>
							<Text style={[styles.textValue, {fontSize}]}>
								{` ${this.labelLong}: `}
								<FormattedNumber value={longitude} maximumFractionDigits={3} style={[styles.textValue, {fontSize}]}/>
							</Text>
						</View>
						<Icon name="angle-right" size={iconSize} color="#A59F9A90" style={styles.nextIcon}/>
					</TouchableOpacity>
					{supportLocalControl && (
						<TouchableButton text={i18n.labelTestLocalControl} style={{
							marginTop: padding,
							minWidth: minWidthButton,
							backgroundColor: Theme.Core.brandSecondary,
						}} onPress={this.onPressTestLocalControl}/>
					)}
					<View style={styles.buttonCover}>
						<TouchableButton text={this.labelDelete} style={[styles.button, {
							minWidth: minWidthButton,
						}]} onPress={isLoading ? null : this.onPressRemoveLocation}/>
						{isLoading &&
					(
						<Throbber
							throbberContainerStyle={throbberContainer}
						/>
					)}
					</View>
				</View>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const deviceHeight = isPortrait ? height : width;

		const fontSizeName = Math.floor(deviceWidth * 0.053333333);

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const minWidthButton = Math.floor(deviceWidth * 0.6);

		return {
			container: {
				flex: 1,
				padding: padding,
				alignItems: 'stretch',
				justifyContent: 'center',
				backgroundColor: Theme.Core.appBackground,
			},
			infoOneContainerStyle: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-start',
				flex: 0,
				marginBottom: 0,
				marginTop: 0,
				padding: fontSizeName * 0.6,
			},
			boxItemsCover: {
				flex: 1,
				alignItems: 'flex-start',
				padding: fontSizeName * 0.3,
			},
			locationImage: {
				width: deviceWidth * 0.22,
				height: deviceHeight * 0.12,
			},
			textName: {
				color: Theme.Core.brandSecondary,
				fontSize: fontSizeName,
			},
			locationInfo: {
				fontSize: Math.floor(deviceWidth * 0.045),
				color: Theme.Core.rowTextColor,
			},
			throbberContainer: {
				right: (deviceWidth * 0.12),
			},
			padding,
			minWidthButton,
		};
	}
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: Theme.Core.brandDanger,
	},
	buttonCover: {
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	infoTwoContainerStyle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		...Theme.Core.shadow,
	},
	textLabel: {
		color: '#000',
	},
	textValue: {
		color: Theme.Core.rowTextColor,
		textAlign: 'right',
	},
	nextIcon: {
		position: 'absolute',
		right: 10,
	},
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	let { id } = ownProps.navigation.getParam('location', {id: null});
	const { pushToken } = store.user;
	return {
		location: store.gateways.byId[id],
		pushToken,
	};
}

function mapDispatchToProps(dispatch: Function, ownPRops: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Details);

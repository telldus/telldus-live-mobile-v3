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
	TouchableWithoutFeedback,
	BackHandler,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import {
	View,
	Text,
	TouchableButton,
	StyleSheet,
	FormattedNumber,
	Icon,
	TitledInfoBlock,
	ThemedScrollView,
	TouchableOpacity,
} from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';
import Status from '../../TabViews/SubViews/Gateway/Status';

import {
	prepareDeviceId,
} from '../../../Actions/User';
import {
	createSupportInAppDebugData,
} from '../../../Actions/App';
import { getGatewayInfo, getGateways, removeGateway } from '../../../Actions/Gateways';
import { getAppData } from '../../../Actions/AppData';
import {
	hasTokenExpired,
	getRSAKey,
} from '../../../Lib';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	location: Object,
	dispatch: Function,
	screenProps: Object,
	pushToken: boolean | string,
	networkInfo: Object,
	generatePushError: string,
	playServicesInfo: Object,
	deviceId: string,
	route: Object,
	firebaseRemoteConfig: Object,
	currentScreen: string,
	ScreenName: string,
};

type State = {
	isLoading: boolean,
	showTestLocalControl: boolean,
	isContactingSupport: boolean,
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

	handleBackPress: () => boolean;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: false,
			showTestLocalControl: false,
			isContactingSupport: false,
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

		this.ACCEPTABLE = ['ethernet', 'wifi', 'vpn'];

		this.RSAKeysAreGenerated = false;
		this.RSAKeysRetrievableFromLocal = false;
		getRSAKey(true, ({ pemPvt, pemPub }: Object): any => {
			if (pemPvt && pemPub) {
				this.RSAKeysAreGenerated = true;
			} else {
				this.RSAKeysAreGenerated = false;
			}
			getRSAKey(false, ({ pemPvt: pemPvtL, pemPub: pemPubL }: Object): any => {
				if (pemPvtL && pemPubL) {
					this.RSAKeysRetrievableFromLocal = true;
				} else {
					this.RSAKeysRetrievableFromLocal = false;
				}
			});
		});
	}

	componentDidMount() {
		const { location, navigation, dispatch, route } = this.props;
		if (location && location.id) {
			let { id } = location, extras = 'timezoneAutodetect';
			dispatch(getGatewayInfo({id}, extras)).then((response: Object) => {
				let { autodetectedTimezone } = response;
				let { params } = route;
				let newParams = { ...params, autodetectedTimezone };
				navigation.setParams(newParams);
			});
		}
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === nextProps.ScreenName;
	}

	componentWillUnmount() {
		this.infoPressCount = 0;
		clearTimeout(this.timeoutInfoPress);

		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let { navigation, currentScreen, ScreenName } = this.props;
		if (currentScreen === ScreenName) {
			navigation.pop();
			return true;
		}
		return false;
	}

	onEditName() {
		const { navigation, location } = this.props;
		navigation.navigate('EditName',
			{
				id: location.id,
				name: location.name,
			});
		this.infoPressCount = 0;
	}

	onEditTimeZone() {
		let { navigation, location = {}, route } = this.props;
		let { params } = route;
		let newParams = { ...params, id: location.id, timezone: location.timezone };
		navigation.navigate('EditTimeZoneContinent', newParams);
		this.infoPressCount = 0;
	}

	onEditGeoPosition() {
		let { navigation, location = {} } = this.props;
		let { latitude, longitude, id } = location;
		navigation.navigate('EditGeoPosition',
			{
				id, latitude, longitude,
			});
		this.infoPressCount = 0;
	}

	onPressRemoveLocation() {
		const { screenProps } = this.props;
		const dialogueData = {
			show: true,
			header: this.labelModalheaderOnDel,
			positiveText: this.labelDelete,
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
		const { dispatch, navigation, screenProps, route } = this.props;
		const {
			location = {id: null},
		} = route.params || {};
		this.setState({
			isLoading: true,
		});
		dispatch(removeGateway(location.id)).then(async (res: Object) => {
			try {
				await dispatch(getGateways()).then(() => {
					dispatch(getAppData());
				});
			} catch (e) {
				// Ignore
			} finally {
				this.setState({
					isLoading: false,
				}, () => {
					navigation.pop();
				});
			}
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

	prepareDebugData = (data: Object): Object => {

		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		let body = Object.keys(data).map((d: string | Object, index: number): Object => {
			let text = data[d];
			if (typeof text === 'object') {
				text = JSON.stringify(text);
			} else if (typeof text === 'boolean') {
				text = text.toString();
			}
			return (
				<View style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					width: deviceWidth * 0.75,
					paddingHorizontal: 10,
					paddingTop: 2,
				}}
				key={index}>
					<Text
						level={26}
						style={{
							fontSize: 10,
							flexWrap: 'wrap',
						}}>
						{`${d}: `}
					</Text>
					<Text
						level={25}
						style={{
							fontSize: 10,
							flexWrap: 'wrap',
						}}>
						{text}
					</Text>
				</View>
			);
		});
		return (
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					flexGrow: 1,
					paddingVertical: 10,
				}}>
				{body}
			</ThemedScrollView>
		);
	}

	contactSupport = (debugData: Object) => {
		const { dispatch, screenProps } = this.props;
		const { intl } = screenProps;
		const { formatMessage } = intl;
		const { isContactingSupport } = this.state;

		const errorH = formatMessage(i18n.errorCannotCreateTicketH);
		const errorB = formatMessage(i18n.errorCannotCreateTicketB, {url: 'support.telldus.com.'});

		if (!isContactingSupport) {
			this.setState({
				isContactingSupport: true,
			});
			dispatch(createSupportInAppDebugData(debugData)).then((ticketNum: number) => {
				if (ticketNum && typeof ticketNum === 'number') {
					this.showDialogue(formatMessage(i18n.labelSupportTicketCreated), formatMessage(i18n.messageSupportTicket, {ticketNum}));
				} else {
					this.showDialogue(errorH, errorB);
				}
				this.setState({
					isContactingSupport: false,
				});
			}).catch((error: Object) => {
				let errMess = errorB;
				if (error.request && error.request.responseText === 'The request timed out.') {
					errMess = formatMessage(i18n.errorTimeoutCannotCreateTicketB, {url: 'support.telldus.com.'});
				}
				this.showDialogue(errorH, errMess);
				this.setState({
					isContactingSupport: false,
				});
			});
		}
	}

	showDialogue(header: string, text: string) {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;

		const dialogueData = {
			show: true,
			showPositive: true,
			header,
			imageHeader: true,
			text,
			showHeader: true,
			closeOnPressPositive: true,
			capitalizeHeader: false,
		};
		toggleDialogueBox(dialogueData);
	}

	onPressGatewayInfo() {
		clearTimeout(this.timeoutInfoPress);
		this.infoPressCount++;
		if (this.infoPressCount >= 5) {
			const {
				location = {},
				pushToken,
				generatePushError,
				playServicesInfo = {},
				deviceId,
				screenProps,
				firebaseRemoteConfig,
			} = this.props;
			const {
				online,
				websocketOnline,
				localKey = {},
				websocketConnected,
			} = location;
			NetInfo.fetch().then(async (connectionInfo: Object) => {
				this.infoPressCount = 0;
				const { type, effectiveType } = connectionInfo;
				const { ttl = null } = localKey;
				const tokenExpired = hasTokenExpired(ttl);
				const deviceName = await DeviceInfo.getDeviceName();
				const deviceUniqueID = DeviceInfo.getUniqueId();
				const deviceManufacturer = await DeviceInfo.getManufacturer();

				const debugData = {
					online,
					websocketOnline,
					websocketConnected,
					...localKey,
					tokenExpired,
					connectionType: type,
					connectionEffectiveType: effectiveType,
					deviceName,
					deviceUniqueID,
					deviceUniqueIDCached: deviceId,
					preparedDeviceUniqueID: prepareDeviceId(deviceId),
					appVersion: DeviceInfo.getVersion(),
					pushToken,
					generatePushError,
					playServicesInfo,
					RSAKeysAreGenerated: this.RSAKeysAreGenerated,
					RSAKeysRetrievableFromLocal: this.RSAKeysRetrievableFromLocal,
					firebaseRemoteConfig,
					deviceModel: DeviceInfo.getModel(),
					deviceManufacturer,
					systemVersion: DeviceInfo.getSystemVersion(),
				};
				const dialogueData = {
					show: true,
					showPositive: true,
					positiveText: 'SEND TO SUPPORT TEAM',
					negativeText: 'CLOSE',
					showNegative: true,
					header: 'Gateway && Network Info',
					text: ((): Object => {
						return this.prepareDebugData(debugData);
					})(),
					showHeader: true,
					closeOnPressPositive: true,
					closeOnPressNegative: true,
					onPressPositive: () => {
						this.contactSupport(debugData);
					},
					notificationModalFooterStyle: {
						flexDirection: 'column',
						alignItems: 'flex-end',
						justifyContent: 'center',
					},
					notificationModalFooterPositiveTextCoverStyle: {
						paddingRight: 15,
					},
				};
				screenProps.toggleDialogueBox(dialogueData);
			});
		}
		this.timeoutInfoPress = setTimeout(() => {
			this.infoPressCount = 0;
		}, 3000);
	}

	onPressTestLocalControl() {
		const {
			location,
			navigation,
			networkInfo,
			screenProps,
		} = this.props;
		const {
			toggleDialogueBox,
			intl,
		} = screenProps;

		const {
			type: netType,
		} = networkInfo;
		const isAcceptableNetType = this.ACCEPTABLE.indexOf(netType) !== -1;
		if (!isAcceptableNetType) {
			toggleDialogueBox({
				show: true,
				showPositive: true,
				imageHeader: true,
				header: intl.formatMessage(i18n.infoLocalTestFailNotConnectedToSameHeader),
				text: intl.formatMessage(i18n.infoLocalTestFailNotConnectedToSame),
				showHeader: true,
				capitalizeHeader: false,
			});
			return;
		}

		navigation.navigate('TestLocalControl',
			{
				location,
			});
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, localKey: Object): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.screenProps.intl} localKey={localKey}/>
		);
	}

	render(): Object | null {
		const { isLoading, isContactingSupport } = this.state;
		const { location, screenProps, networkInfo } = this.props;
		const { appLayout } = screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			fontSizeFactorEight,
		} = Theme.Core;

		const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
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
			minWidthButton,
		} = this.getStyles(appLayout);

		let info = this.getLocationStatus(online, websocketOnline, localKey);

		const timezoneLabel = timezoneAutodetected ? `${this.labelTimeZone}\n(${this.labelAutoDetected})` : this.labelTimeZone;

		const supportLocalControl = this.localControlNotSupportedTellSticks.indexOf(type) === -1;

		const {
			type: netType,
		} = networkInfo;

		const isAcceptableNetType = this.ACCEPTABLE.indexOf(netType) !== -1;

		const disableButtonContactSup = !isAcceptableNetType || isContactingSupport || isLoading;

		return (
			<ThemedScrollView
				level={3}
				style={{
					flex: 1,
				}}>
				<View style={container}>
					<LabelBox containerStyle={infoOneContainerStyle} appLayout={appLayout}>
						<Image resizeMode={'contain'} style={locationImage} source={{ uri: image, isStatic: true }} />
						<TouchableWithoutFeedback onPress={this.onPressGatewayInfo}>
							<View style={boxItemsCover}>
								<Text
									level={38}
									style={textName}>
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
						blockContainerStyle={{
							marginBottom: padding / 2,
						}}
						valueTextStyle={{
							marginRight: 20,
						}}
						onPress={isLoading ? null : this.onEditTimeZone}
					/>
					<TouchableOpacity
						level={2}
						style={[styles.infoTwoContainerStyle, {
							padding: fontSize,
							marginBottom: padding / 2,
						}]} onPress={isLoading ? null : this.onEditGeoPosition}>
						<Text
							level={3}
							style={{fontSize}}>
							{this.labelGeoPosition}
						</Text>
						<View style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 20 }}>
							<Text
								level={4}
								style={[styles.textValue, {fontSize}]}>
								{`${this.labelLat}: `}
								<FormattedNumber value={latitude} maximumFractionDigits={3} style={[styles.textValue, {fontSize}]}/>
							</Text>
							<Text
								level={4}
								style={[styles.textValue, {fontSize}]}>
								{` ${this.labelLong}: `}
								<FormattedNumber value={longitude} maximumFractionDigits={3} style={[styles.textValue, {fontSize}]}/>
							</Text>
						</View>
						<Icon
							name="angle-right"
							size={iconSize}
							level={21}
							style={styles.nextIcon}/>
					</TouchableOpacity>
					{supportLocalControl && (
						<TouchableButton
							text={i18n.labelTestLocalControl}
							style={{
								marginTop: padding,
								minWidth: minWidthButton,
							}}
							disabled={disableButtonContactSup}
							onPress={this.onPressTestLocalControl}/>
					)}
					<View style={styles.buttonCover}>
						<TouchableButton
							buttonLevel={isContactingSupport || isLoading ? 7 : 10}
							disabled={isContactingSupport || isLoading}
							text={this.labelDelete} style={{
								minWidth: minWidthButton,
							}}
							onPress={isLoading ? null : this.onPressRemoveLocation}
							showThrobber={isLoading}/>
					</View>
				</View>
			</ThemedScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const deviceHeight = isPortrait ? height : width;

		const {
			inactiveSwitchBackground,
			btnPrimaryBg,
			paddingFactor,
			fontSizeFactorEight,
		} = Theme.Core;

		const fontSizeName = Math.floor(deviceWidth * 0.053333333);

		const padding = deviceWidth * paddingFactor;
		const minWidthButton = Math.floor(deviceWidth * 0.6);

		return {
			inactiveSwitchBackground,
			btnPrimaryBg,
			container: {
				flex: 1,
				padding: padding,
				alignItems: 'stretch',
				justifyContent: 'center',
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
				fontSize: fontSizeName,
			},
			locationInfo: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorEight),
				color: Theme.Core.rowTextColor,
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
		...Theme.Core.shadow,
	},
	textValue: {
		textAlign: 'right',
	},
	nextIcon: {
		position: 'absolute',
		right: 10,
	},
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	const {
		location = {id: null},
	} = ownProps.route.params || {};
	const { id } = location;
	const {
		pushToken,
		generatePushError,
		playServicesInfo,
		deviceId,
		firebaseRemoteConfig,
	} = store.user;
	const { networkInfo } = store.app;

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		location: store.gateways.byId[id],
		pushToken,
		networkInfo,
		generatePushError,
		playServicesInfo,
		deviceId,
		firebaseRemoteConfig,
		currentScreen,
	};
}

function mapDispatchToProps(dispatch: Function, ownPRops: Object): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(Details): Object);

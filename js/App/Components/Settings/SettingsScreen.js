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
 */

// @flow

'use strict';

import React from 'react';
import { ScrollView, PushNotificationIOS, Platform } from 'react-native';
import { connect } from 'react-redux';
const DeviceInfo = require('react-native-device-info');
const isEqual = require('react-fast-compare');

import {
	Text,
	View,
	TouchableButton,
	DialogueBox,
	NavigationHeaderPoster,
	TitledInfoBlock,
	DropDown,
} from '../../../BaseComponents';
import { logoutFromTelldus, showToast, changeSortingDB } from '../../Actions';
import { showModal as actionShowModal } from '../../Actions';

import { pushServiceId } from '../../../Config';
import { registerPushToken, unregisterPushToken, showChangeLog } from '../../Actions/User';
import { shouldUpdate } from '../../Lib';

import Theme from '../../Theme';

import i18n from './../../Translations/common';

type Props = {
	validationMessage: string,
	showModal: boolean,
	screenProps: Object,
	pushTokenRegistered: boolean,
	pushToken: string,
	email: string,
	modalExtras: any,
	sortingDB: string,

	navigation: Object,
	dispatch: Function,
	onClose: () => void,
	onLogout: (string) => void,
	onSubmitPushToken: (string) => Promise<any>,
};


type State = {
	isPushSubmitLoading: boolean,
	isLogoutLoading: boolean,
};

class SettingsScreen extends View {
props: Props;
state: State;

logout: () => void;
submitPushToken: () => void;
onConfirmLogout: () => void;
closeModal: () => void;
onPressWhatsNew: () => void;

handleBackPress: () => boolean;

saveSortingDB: (string, number, Array<any>) => void;

constructor(props: Props) {
	super(props);
	this.state = {
		isPushSubmitLoading: false,
		isLogoutLoading: false,
	};

	this.logout = this.logout.bind(this);
	this.onConfirmLogout = this.onConfirmLogout.bind(this);
	this.submitPushToken = this.submitPushToken.bind(this);
	this.closeModal = this.closeModal.bind(this);
	this.onPressWhatsNew = this.onPressWhatsNew.bind(this);

	const { formatMessage } = this.props.screenProps.intl;

	this.confirmMessage = formatMessage(i18n.contentLogoutConfirm);
	this.labelButton = formatMessage(i18n.button);
	this.labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	this.labelLogOut = `${formatMessage(i18n.labelLogOut)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;

	this.titleAppInfo = formatMessage(i18n.titleAppInfo);
	this.titlePush = formatMessage(i18n.titlePush);
	this.titleUserInfo = `${formatMessage(i18n.titleUserInfo)}:`;
	this.labelVersion = formatMessage(i18n.version);
	this.labelPush = formatMessage(i18n.labelPush);
	this.labelLoggedUser = formatMessage(i18n.labelLoggedUser);
	this.valueYes = formatMessage(i18n.yes);
	this.valueNo = formatMessage(i18n.no);

	this.headerOne = formatMessage(i18n.settingsHeader);
	this.headerTwo = formatMessage(i18n.headerTwoSettings);
	this.labelWhatsNew = formatMessage(i18n.labelWhatsNew);

	this.handleBackPress = this.handleBackPress.bind(this);

	this.saveSortingDB = this.saveSortingDB.bind(this);
	this.labelSortingDB = formatMessage(i18n.labelSortingDb);
	this.labelAlpha = formatMessage(i18n.labelAlphabetical);
	this.labelChrono = formatMessage(i18n.labelChronological);
	this.DDOptions = [
		{key: 'Alphabetical', value: this.labelAlpha},
		{key: 'Chronological', value: this.labelChrono},
	];
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { screenProps: screenPropsN, ...othersN } = nextProps;
	if (screenPropsN.currentScreen === 'Settings') {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { screenProps, ...others } = this.props;
		const { appLayout } = screenPropsN;
		if (screenProps.appLayout.width !== appLayout.width) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['showModal', 'sortingDB', 'pushTokenRegistered', 'pushToken', 'email', 'modalExtras']);
		if (propsChange) {
			return true;
		}
		return false;
	}
	return false;
}

logout() {
	this.props.dispatch({
		type: 'REQUEST_MODAL_OPEN',
		payload: {
			data: this.confirmMessage,
		},
	});
}

onConfirmLogout() {
	this.closeModal();
	this.setState({
		isLogoutLoading: true,
	});
	this.props.onLogout(this.props.pushToken);
}

closeModal() {
	this.props.dispatch({
		type: 'REQUEST_MODAL_CLOSE',
	});
}

onPressWhatsNew() {
	this.props.dispatch(showChangeLog());
}

handleBackPress(): boolean {
	this.props.navigation.goBack();
	return true;
}

saveSortingDB(value: string, itemIndex: number, data: Array<any>) {
	const { dispatch } = this.props;
	const { key: sortingDB } = data[itemIndex];
	const settings = { sortingDB };
	dispatch(changeSortingDB(settings));
}

getRelativeData(): Object {
	const { modalExtras, screenProps } = this.props;
	const { formatMessage } = screenProps.intl;

	let notificationHeader = `${formatMessage(i18n.logout)}?`, showPositive = true,
		showNegative = true, positiveText = formatMessage(i18n.logout).toUpperCase(),
		onPressPositive = this.onConfirmLogout, onPressNegative = this.closeModal;
	let submitButText = this.state.isPushSubmitLoading ? `${formatMessage(i18n.pushRegisters)}...` : formatMessage(i18n.pushReRegister);
	let logoutButText = this.state.isLogoutLoading ? formatMessage(i18n.loggingout) : formatMessage(i18n.labelLogOut);
	let version = DeviceInfo.getVersion();

	if (modalExtras && modalExtras === 'PUSH_PERMISSION') {
		notificationHeader = formatMessage(i18n.pushPermissionHeader);
		showPositive = true;
		positiveText = null;
		showNegative = false;
		onPressPositive = this.closeModal;
	}

	return {
		notificationHeader,
		showPositive,
		showNegative,
		positiveText,
		onPressPositive,
		onPressNegative,
		submitButText,
		logoutButText,
		version,
	};
}

render(): Object {
	const {
		notificationHeader,
		showPositive,
		showNegative,
		positiveText,
		onPressPositive,
		onPressNegative,
		submitButText,
		logoutButText,
		version,
	} = this.getRelativeData();
	const {
		screenProps,
		showModal,
		navigation,
		pushTokenRegistered,
		email,
		sortingDB = 'Chronological',
	} = this.props;
	const { appLayout } = screenProps;
	const { isLogoutLoading, isPushSubmitLoading } = this.state;
	const styles = this.getStyles(appLayout);

	const buttonAccessible = !isLogoutLoading && !isPushSubmitLoading && !showModal;
	const importantForAccessibility = showModal ? 'no-hide-descendants' : 'yes';

	return (
		<View style={styles.container}>
			<NavigationHeaderPoster
				h1={this.headerOne} h2={this.headerTwo}
				navigation={navigation}
				align={'right'}
				leftIcon={'close'}
				handleBackPress={this.handleBackPress}
				{...screenProps}/>
			<ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
				<View style={styles.body} importantForAccessibility={importantForAccessibility}>
					<TitledInfoBlock
						title={this.titleAppInfo}
						label={this.labelVersion}
						value={version}
						fontSize={styles.fontSize}
					/>
					<Text onPress={this.onPressWhatsNew} style={styles.buttonResubmit}>
						{this.labelWhatsNew}
					</Text>
					<TitledInfoBlock
						title={this.titlePush}
						label={this.labelPush}
						value={pushTokenRegistered ? this.valueYes : this.valueNo}
						fontSize={styles.fontSize}
					/>
					<Text onPress={this.submitPushToken} style={styles.buttonResubmit}>
						{submitButText}
					</Text>
					<DropDown
						items={this.DDOptions}
						value={sortingDB === this.labelAlpha ? this.labelAlpha : this.labelChrono}
						label={this.labelSortingDB}
						onValueChange={this.saveSortingDB}
						appLayout={appLayout}
						dropDownContainerStyle={styles.dropDownContainerStyle}
						dropDownHeaderStyle={styles.dropDownHeaderStyle}
						baseColor={'#000'}
						fontSize={styles.fontSize}
						accessibilityLabelPrefix={this.labelSortingDB}
					/>
					<TitledInfoBlock
						title={this.titleUserInfo}
						label={this.labelLoggedUser}
						value={email}
						fontSize={styles.fontSize}
					/>
					<TouchableButton
						onPress={this.logout}
						text={logoutButText}
						postScript={this.state.isLogoutLoading ? '...' : null}
						accessibilityLabel={this.labelLogOut}
						accessible={buttonAccessible}
						style={{
							marginTop: styles.fontSize / 2,
						}}
					/>
					<DialogueBox
						showDialogue={this.props.showModal}
						header={notificationHeader}
						text={this.props.validationMessage}
						showPositive={showPositive}
						showNegative={showNegative}
						positiveText={positiveText}
						onPressPositive={onPressPositive}
						onPressNegative={onPressNegative}/>
				</View>
			</ScrollView>
		</View>
	);
}

submitPushToken() {
	if (Platform.OS === 'android') {
		this.confirmTokenSubmit();
	} else {
		PushNotificationIOS.checkPermissions((permissions: Object) => {
			const { alert, badge, sound } = permissions;
			if (alert || badge || sound) {
				this.confirmTokenSubmit();
			} else {
				const { dispatch, screenProps } = this.props;
				const message = screenProps.intl.formatMessage(i18n.pushPermissionContent);
				dispatch(actionShowModal(message, 'PUSH_PERMISSION'));
			}
		});
	}
}

confirmTokenSubmit() {
	this.setState({
		isPushSubmitLoading: true,
	});
	const { formatMessage } = this.props.screenProps.intl;
	this.props.onSubmitPushToken(this.props.pushToken).then((response: Object) => {
		let message = formatMessage(i18n.pushRegisterSuccess);
		this.showToast(message);
	}).catch(() => {
		let message = formatMessage(i18n.pushRegisterFailed);
		this.showToast(message);
	});
}

showToast(message: string) {
	this.props.dispatch(showToast(message));
	this.setState({
		isPushSubmitLoading: false,
	});
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);
	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		fontSize,
		container: {
			flex: 1,
		},
		posterItemsContainer: {
			flex: 1,
			position: 'absolute',
			alignItems: 'flex-end',
			justifyContent: 'center',
			right: isPortrait ? width * 0.124 : height * 0.124,
			top: isPortrait ? width * 0.088 : height * 0.088,
		},
		h: {
			color: '#fff',
		},
		h1: {
			fontSize: Math.floor(deviceWidth * 0.08),
		},
		h2: {
			fontSize: Math.floor(deviceWidth * 0.053333333),
		},
		buttonResubmit: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: Theme.Core.brandSecondary,
			alignSelf: 'center',
			paddingVertical: 5,
			marginBottom: fontSize / 2,
		},
		body: {
			flex: 1,
			justifyContent: 'flex-start',
			alignItems: 'stretch',
			backgroundColor: 'transparent',
			padding: padding,
		},
		dropDownContainerStyle: {
			marginBottom: fontSize / 2,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: '#b5b5b5',
		},
	};
}
}

function mapStateToProps(store: Object): Object {
	const { pushTokenRegistered, userProfile, pushToken } = store.user;
	const { data: validationMessage, openModal: showModal, extras: modalExtras } = store.modal;
	const { defaultSettings = {} } = store.app;
	const { sortingDB } = defaultSettings;
	const { email } = userProfile;

	return {
		validationMessage,
		showModal,
		pushTokenRegistered,
		pushToken,
		email,
		modalExtras,
		sortingDB,
	};
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		onClose: () => {
			dispatch({
				type: 'ERROR',
				message: {
					error: '',
					error_description: false,
				},
			});
			ownProps.onClose();
		},
		onSubmitPushToken: (token: string): Promise<any> => {
			return dispatch(registerPushToken(token, DeviceInfo.getBuildNumber(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getSystemVersion(), DeviceInfo.getUniqueID(), pushServiceId));
		},
		onLogout: (token: string): Promise<any> => {
			return dispatch(unregisterPushToken(token)).then((): Promise<any> => {
				return dispatch(logoutFromTelldus());
			}).catch((): Promise<any> => {
				return dispatch(logoutFromTelldus());
			});
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);

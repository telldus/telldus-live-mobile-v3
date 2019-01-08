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
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');

import {
	Text,
	View,
	TouchableButton,
	TitledInfoBlock,
	DropDown,
} from '../../../BaseComponents';
import { logoutFromTelldus, changeSortingDB } from '../../Actions';

import { unregisterPushToken, showChangeLog } from '../../Actions/User';
import { shouldUpdate } from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	pushTokenRegistered: boolean,
	pushToken: string,
	email: string,
	sortingDB: string,
	currentScreen: string,
	appLayout: Object,
	isPushSubmitLoading: boolean,
	phonesList: Object,

	navigation: Object,
	dispatch: Function,
	onLogout: (string) => void,
	intl: Object,
	onDidMount: (string, string, ?string) => void,
	submitPushToken: () => void,
};


type State = {
	isLogoutLoading: boolean,
};

class MainSettingsScreen extends View {
props: Props;
state: State;

logout: () => void;
submitPushToken: () => void;
onConfirmLogout: () => void;
onPressWhatsNew: () => void;

handleBackPress: () => boolean;

saveSortingDB: (string, number, Array<any>) => void;

onPressPushSettings: () => void;

constructor(props: Props) {
	super(props);
	this.state = {
		isLogoutLoading: false,
	};

	this.logout = this.logout.bind(this);
	this.onConfirmLogout = this.onConfirmLogout.bind(this);
	this.onPressWhatsNew = this.onPressWhatsNew.bind(this);

	const { formatMessage } = this.props.intl;

	this.confirmMessage = formatMessage(i18n.contentLogoutConfirm);
	this.labelButton = formatMessage(i18n.button);
	this.labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	this.labelLogOut = `${formatMessage(i18n.labelLogOut)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;

	this.titleAppInfo = formatMessage(i18n.titleAppInfo);
	this.titlePush = formatMessage(i18n.titlePush);
	this.titleUserInfo = `${formatMessage(i18n.titleUserInfo)}:`;
	this.labelVersion = formatMessage(i18n.version);
	this.labelLoggedUser = formatMessage(i18n.labelLoggedUser);
	this.valueYes = formatMessage(i18n.yes);
	this.valueNo = formatMessage(i18n.no);

	this.headerOne = formatMessage(i18n.settingsHeader);
	this.headerTwo = formatMessage(i18n.headerTwoSettings);
	this.labelWhatsNew = formatMessage(i18n.labelWhatsNew);

	this.handleBackPress = this.handleBackPress.bind(this);

	this.onPressPushSettings = this.onPressPushSettings.bind(this);

	this.saveSortingDB = this.saveSortingDB.bind(this);
	this.labelSortingDB = formatMessage(i18n.labelSortingDb);
	this.labelAlpha = formatMessage(i18n.labelAlphabetical);
	this.labelChrono = formatMessage(i18n.labelChronological);
	this.DDOptions = [
		{key: 'Alphabetical', value: this.labelAlpha},
		{key: 'Chronological', value: this.labelChrono},
	];
}

componentDidMount() {
	this.props.onDidMount(this.headerOne, this.headerTwo);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { appLayout: appLayoutN, currentScreen, ...othersN } = nextProps;
	if (currentScreen === 'MainSettingsScreen') {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const { appLayout, ...others } = this.props;
		if (appLayout.width !== appLayoutN.width) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['isPushSubmitLoading', 'sortingDB', 'pushTokenRegistered', 'pushToken', 'email', 'phonesList']);
		if (propsChange) {
			return true;
		}
		return false;
	}
	return false;
}

logout() {
	const {
		intl,
		toggleDialogueBox,
	} = this.props;
	const { formatMessage } = intl;
	toggleDialogueBox({
		show: true,
		showHeader: true,
		notificationHeader: `${formatMessage(i18n.logout)}?`,
		text: this.confirmMessage,
		showPositive: true,
		showNegative: true,
		positiveText: formatMessage(i18n.logout).toUpperCase(),
		onPressPositive: this.onConfirmLogout,
		closeOnPressPositive: true,
	});
}

onConfirmLogout() {
	this.setState({
		isLogoutLoading: true,
	});
	const { onLogout, dispatch } = this.props;
	onLogout(this.props.pushToken).then(() => {
		this.setState({
			isLogoutLoading: false,
		}, () => {
			dispatch(logoutFromTelldus());
		});
	}).catch(() => {
		this.setState({
			isLogoutLoading: false,
		}, () => {
			dispatch(logoutFromTelldus());
		});
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

onPressPushSettings() {
	this.props.navigation.navigate({
		routeName: 'PushSettings',
		key: 'PushSettings',
	});
}

render(): Object {
	const {
		email,
		appLayout,
		sortingDB = 'Chronological',
		intl,
		isPushSubmitLoading,
		phonesList = {},
	} = this.props;
	const { isLogoutLoading } = this.state;
	const styles = this.getStyles(appLayout);

	const buttonAccessible = !isLogoutLoading && !isPushSubmitLoading;

	const version = DeviceInfo.getVersion();

	const { formatMessage } = intl;
	const submitButText = isPushSubmitLoading ? `${formatMessage(i18n.pushRegisters)}...` : formatMessage(i18n.pushReRegisterPush);
	const logoutButText = isLogoutLoading ? formatMessage(i18n.loggingout) : formatMessage(i18n.labelLogOut);

	const phones = Object.keys(phonesList).length;
	const labelPush = formatMessage(i18n.labelPushRegistered, {value: phones});

	return (
		<View style={styles.container}>
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
				label={labelPush}
				icon={'angle-right'}
				iconStyle={styles.iconStyle}
				fontSize={styles.fontSize}
				onPress={this.onPressPushSettings}
			/>
			{!(phones > 0) && (
				<Text onPress={this.props.submitPushToken} style={styles.buttonResubmit}>
					{submitButText}
				</Text>
			)}
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
				onPress={isLogoutLoading ? null : this.logout}
				text={logoutButText}
				postScript={isLogoutLoading ? '...' : null}
				accessibilityLabel={this.labelLogOut}
				accessible={buttonAccessible}
				style={{
					marginTop: styles.fontSize / 2,
				}}
			/>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

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
		},
		dropDownContainerStyle: {
			marginBottom: fontSize / 2,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: '#b5b5b5',
		},
		iconStyle: {
			color: '#8e8e93',
		},
	};
}
}

function mapStateToProps(store: Object): Object {
	const { pushTokenRegistered, userProfile } = store.user;
	const { defaultSettings = {} } = store.app;
	const { sortingDB } = defaultSettings;
	const { email } = userProfile;

	return {
		pushTokenRegistered,
		email,
		sortingDB,
	};
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		onLogout: (token: string): Promise<any> => {
			return dispatch(unregisterPushToken(token));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(MainSettingsScreen);

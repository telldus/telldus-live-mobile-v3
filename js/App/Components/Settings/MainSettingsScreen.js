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
const isEqual = require('react-fast-compare');

import {
	View,
	TouchableButton,
} from '../../../BaseComponents';
import {
	WhatsNewLink,
	AppVersionBlock,
	PushInfoBlock,
	DBSortControlBlock,
	UserInfoBlock,
} from './SubViews';

import { logoutFromTelldus } from '../../Actions';

import { unregisterPushToken } from '../../Actions/User';
import { shouldUpdate } from '../../Lib';

import i18n from '../../Translations/common';

type Props = {
	pushToken: string,
	currentScreen: string,
	appLayout: Object,
	isPushSubmitLoading: boolean,

	navigation: Object,
	dispatch: Function,
	onLogout: (string) => Promise<any>,
	intl: Object,
	onDidMount: (string, string, ?string) => void,
	submitPushToken: () => void,
	toggleDialogueBox: (Object) => void,
	actions: Object,
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

handleBackPress: () => boolean;

onPressPushSettings: () => void;

constructor(props: Props) {
	super(props);
	this.state = {
		isLogoutLoading: false,
	};

	this.logout = this.logout.bind(this);
	this.onConfirmLogout = this.onConfirmLogout.bind(this);

	const { formatMessage } = this.props.intl;

	this.confirmMessage = formatMessage(i18n.contentLogoutConfirm);
	this.labelButton = formatMessage(i18n.button);
	this.labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	this.labelLogOut = `${formatMessage(i18n.labelLogOut)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;

	this.valueYes = formatMessage(i18n.yes);
	this.valueNo = formatMessage(i18n.no);

	this.headerOne = formatMessage(i18n.settingsHeader);
	this.headerTwo = formatMessage(i18n.headerTwoSettings);

	this.handleBackPress = this.handleBackPress.bind(this);
}

componentDidMount() {
	const { onDidMount, actions } = this.props;
	onDidMount(this.headerOne, this.headerTwo);
	actions.getPhonesList();
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

		const propsChange = shouldUpdate(others, othersN, ['isPushSubmitLoading', 'pushToken']);
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

handleBackPress(): boolean {
	this.props.navigation.goBack();
	return true;
}

render(): Object {
	const {
		appLayout,
		intl,
		isPushSubmitLoading,
		navigation,
		submitPushToken,
	} = this.props;
	const { isLogoutLoading } = this.state;
	const styles = this.getStyles(appLayout);

	const buttonAccessible = !isLogoutLoading && !isPushSubmitLoading;

	const { formatMessage } = intl;
	const logoutButText = isLogoutLoading ? formatMessage(i18n.loggingout) : formatMessage(i18n.labelLogOut);

	return (
		<View style={styles.container}>
			<AppVersionBlock/>
			<WhatsNewLink/>
			<PushInfoBlock
				navigation={navigation}
				isPushSubmitLoading={isPushSubmitLoading}
				submitPushToken={submitPushToken}
			/>
			<DBSortControlBlock/>
			<UserInfoBlock/>
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
		body: {
			flex: 1,
			justifyContent: 'flex-start',
			alignItems: 'stretch',
			backgroundColor: 'transparent',
		},
	};
}
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		onLogout: (token: string): Promise<any> => {
			return dispatch(unregisterPushToken(token));
		},
		dispatch,
	};
}

module.exports = connect(null, mapDispatchToProps)(MainSettingsScreen);

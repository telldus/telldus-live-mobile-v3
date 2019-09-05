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
	LogoutButton,
} from './SubViews';
import { shouldUpdate } from '../../Lib';

import i18n from '../../Translations/common';

type Props = {
	pushToken: string,
	currentScreen: string,
	appLayout: Object,
	isPushSubmitLoading: boolean,

	navigation: Object,
	intl: Object,
	onDidMount: (string, string, ?string) => void,
	submitPushToken: () => void,
	toggleDialogueBox: (Object) => void,
	actions: Object,
};


type State = {
};

class MainSettingsScreen extends View {
props: Props;
state: State;

submitPushToken: () => void;

handleBackPress: () => boolean;

onPressPushSettings: () => void;

constructor(props: Props) {
	super(props);
	this.state = {
	};

	const { formatMessage } = this.props.intl;

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

handleBackPress(): boolean {
	this.props.navigation.goBack();
	return true;
}

render(): Object {
	const {
		appLayout,
		isPushSubmitLoading,
		navigation,
		submitPushToken,
		toggleDialogueBox,
	} = this.props;
	const styles = this.getStyles(appLayout);

	const buttonAccessible = !isPushSubmitLoading;

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
			<LogoutButton
				buttonAccessibleProp={buttonAccessible}
				toggleDialogueBox={toggleDialogueBox}
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

module.exports = MainSettingsScreen;

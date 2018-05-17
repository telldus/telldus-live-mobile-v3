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
import { AccessibilityInfo } from 'react-native';
import { connect } from 'react-redux';
import Platform from 'Platform';
import StatusBar from 'StatusBar';

import {
	PreLoginNavigator,
	AppNavigator,
	Push,
} from './App/Components';
import ChangeLogNavigator from './App/Components/ChangeLog/ChangeLog';
import UserAgreement from './App/Components/UserAgreement/UserAgreement';
import { View } from './BaseComponents';
import {
	setAppLayout,
	setAccessibilityListener,
	setAccessibilityInfo,
} from './App/Actions';

import Theme from './App/Theme';
const changeLogVersion = '3.6';

type Props = {
	dispatch: Function,
	isTokenValid: boolean,
	accessToken: string,
	pushTokenRegistered: boolean,
	prevChangeLogVersion: string,
	eula?: number,
};

class App extends React.Component<Props, null> {
	props: Props;

	onLayout: (Object) => void;

	constructor() {
		super();
		this.onLayout = this.onLayout.bind(this);
	}

	componentDidMount() {
		let { dispatch } = this.props;

		this.pushConf();
		AccessibilityInfo.fetch().done((isEnabled: boolean) => {
			dispatch(setAccessibilityInfo(isEnabled));
			dispatch(setAccessibilityListener(setAccessibilityInfo));
		});

		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(Theme.Core.brandPrimary);
		}
	}

	componentDidUpdate() {
		this.pushConf();
	}

	componentWillUnmount() {
		AccessibilityInfo.removeEventListener(
		  'change',
		  setAccessibilityInfo
		);
	}

	/*
	 * calls the push configuration methods, for logged in users, which will generate push token and listen for local and
	 * remote push notifications.
	 */
	pushConf() {
		if (this.props.accessToken) {
			Push.configure(this.props);
		}
	}

	onLayout(ev: Object) {
		this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
	}

	render(): Object {
		let { prevChangeLogVersion, accessToken, isTokenValid, eula } = this.props;

		let showChangeLog = changeLogVersion !== prevChangeLogVersion;
		if (showChangeLog) {
			// Same 'ChangeLogNavigator' is used as a navigator screen in post-login navigator,
			// So passing a property 'navigation' with key `state', just to reduce the conditional
			// check done inside the 'ChangeLogNavigator' to handle two situations.
			const navigation = {
				state: {
					params: null,
				},
			};
			return (
				<View onLayout={this.onLayout}>
					<ChangeLogNavigator
						changeLogVersion={changeLogVersion}
						navigation={navigation}/>
					<UserAgreement showModal={!eula} onLayout={this.onLayout}/>
				</View>
			);
		}

		let hasNotLoggedIn = ((!accessToken) || (accessToken && !isTokenValid));
		return (
			<View onLayout={this.onLayout}>
				{hasNotLoggedIn ?
					<PreLoginNavigator />
					:
					<View style={{flex: 1}}>
						<AppNavigator {...this.props}/>
						<UserAgreement showModal={!eula} onLayout={this.onLayout}/>
					</View>
				}
			</View>
		);
	}
}

function mapStateToProps(store: Object): Object {
	let {
		accessToken,
		pushToken,
		isTokenValid,
		pushTokenRegistered,
		eula,
	} = store.user;
	return {
		accessToken,
		pushToken,
		isTokenValid,
		pushTokenRegistered,
		eula,
		prevChangeLogVersion: store.App.changeLogVersion,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(App);

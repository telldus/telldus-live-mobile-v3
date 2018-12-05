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
import { AccessibilityInfo, UIManager } from 'react-native';
import { connect } from 'react-redux';
import Platform from 'Platform';
import StatusBar from 'StatusBar';
import { LocaleConfig } from 'react-native-calendars';
import { injectIntl } from 'react-intl';

import {
	PreLoginNavigator,
	AppNavigatorRenderer,
	Push,
} from './App/Components';
import ChangeLogNavigator from './App/Components/ChangeLog/ChangeLog';
import { SafeAreaView } from './BaseComponents';
import {
	setAppLayout,
	setAccessibilityListener,
	setAccessibilityInfo,
} from './App/Actions';
import {
	getTranslatableDayNames,
	getTranslatableMonthNames,
} from './App/Lib';

import Theme from './App/Theme';
const changeLogVersion = '3.8';

type Props = {
	dispatch: Function,
	isTokenValid: boolean,
	accessToken: string,
	pushTokenRegistered: boolean,
	prevChangeLogVersion: string,
	forceShowChangeLog: boolean,
	intl: Object,
	locale: string,
	deviceId?: string,
};

class App extends React.Component<Props, null> {
	props: Props;

	onLayout: (Object) => void;
	onNotification: Function | null;
	setCalendarLocale: () => void;

	constructor(props: Props) {
		super(props);
		this.onLayout = this.onLayout.bind(this);
		this.setCalendarLocale = this.setCalendarLocale.bind(this);

		this.setCalendarLocale();
		if (Platform.OS === 'android') {
			UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		}
		this.onNotification = null;
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

		// sets push notification listeners and returns a method that clears all listeners.
		this.onNotification = Push.onNotification();
	}

	setCalendarLocale() {
		const { intl, locale } = this.props;
		const { formatDate } = intl;
		LocaleConfig.locales[locale] = {
			monthNames: getTranslatableMonthNames(formatDate, 'long'),
			monthNamesShort: getTranslatableMonthNames(formatDate, 'short'),
			dayNames: getTranslatableDayNames(formatDate, 'long'),
			dayNamesShort: getTranslatableDayNames(formatDate, 'short'),
		};
		LocaleConfig.defaultLocale = locale;
	}

	componentDidUpdate() {
		this.pushConf();
	}

	componentWillUnmount() {
		AccessibilityInfo.removeEventListener(
		  'change',
		  setAccessibilityInfo
		);

		if (this.onNotification && typeof this.onNotification === 'function') {
			// Remove Push notification listener.
			this.onNotification();
		}
	}

	/*
	 * calls the push configuration methods, for logged in users, which will generate push token and listen for local and
	 * remote push notifications.
	 */
	pushConf() {
		const { dispatch, ...otherProps } = this.props;
		if (this.props.accessToken) {
			dispatch(Push.configure(otherProps));
		}
	}

	onLayout(ev: Object) {
		this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
	}

	render(): Object {
		let { prevChangeLogVersion, accessToken, isTokenValid, forceShowChangeLog } = this.props;

		let showChangeLog = (changeLogVersion !== prevChangeLogVersion) || forceShowChangeLog;

		let hasNotLoggedIn = ((!accessToken) || (accessToken && !isTokenValid));

		return (
			<SafeAreaView onLayout={this.onLayout}>
				{hasNotLoggedIn ?
					<PreLoginNavigator />
					:
					<AppNavigatorRenderer {...this.props}/>
				}
				<ChangeLogNavigator
					changeLogVersion={changeLogVersion}
					showChangeLog={showChangeLog}
					forceShowChangeLog={forceShowChangeLog}
					onLayout={this.onLayout}/>
			</SafeAreaView>
		);
	}
}

function mapStateToProps(store: Object): Object {
	let {
		accessToken,
		pushToken,
		isTokenValid,
		pushTokenRegistered,
		showChangeLog: forceShowChangeLog,
		deviceId = null,
	} = store.user;
	let {
		changeLogVersion: prevChangeLogVersion,
	} = store.app;

	return {
		accessToken,
		pushToken,
		isTokenValid,
		pushTokenRegistered,
		prevChangeLogVersion,
		forceShowChangeLog,
		deviceId,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(App));

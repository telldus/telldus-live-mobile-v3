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
import { AccessibilityInfo, UIManager, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import Platform from 'Platform';
import StatusBar from 'StatusBar';
import { LocaleConfig } from 'react-native-calendars';
import { injectIntl } from 'react-intl';

import {
	PreLoginNavigator,
	PostLoginNavigatorCommon,
	Push,
} from './App/Components';
import ChangeLogNavigator from './App/Components/ChangeLog/ChangeLog';
import { SafeAreaView, DialogueBox } from './BaseComponents';
import {
	setAppLayout,
	setAccessibilityListener,
	setAccessibilityInfo,
	widgetAndroidConfigure,
} from './App/Actions';
import {
	getTranslatableDayNames,
	getTranslatableMonthNames,
} from './App/Lib';

import Theme from './App/Theme';
const changeLogVersion = '3.11';

type Props = {
	dispatch: Function,
	isTokenValid: boolean,
	accessToken: Object,
	pushTokenRegistered: boolean,
	prevChangeLogVersion: string,
	forceShowChangeLog: boolean,
	intl: Object,
	locale: string,
	deviceId?: string,
};

type State = {
	dialogueData: Object,
	keyboard: boolean,
};

class App extends React.Component<Props, State> {
	props: Props;
	state: State;

	onLayout: (Object) => void;
	onNotification: Function | null;
	setCalendarLocale: () => void;

	toggleDialogueBox: Function;
	closeDialogue: (?() => void, ?number) => void;
	onPressDialoguePositive: () => void;
	onPressDialogueNegative: () => void;
	onPressHeader: () => void;

	_keyboardDidShow: () => void;
	_keyboardDidHide: () => void;
	keyboardDidShowListener: Object;
	keyboardDidHideListener: Object;

	onTokenRefreshListener: null | Function;

	timeoutToCallCallback: any;

	constructor(props: Props) {
		super(props);
		this.onLayout = this.onLayout.bind(this);
		this.setCalendarLocale = this.setCalendarLocale.bind(this);

		this.state = {
			dialogueData: {
				show: false,
			},
			keyboard: false,
		};

		this.setCalendarLocale();
		if (Platform.OS === 'android') {
			UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		}
		this.onNotification = null;

		this.toggleDialogueBox = this.toggleDialogueBox.bind(this);
		this.closeDialogue = this.closeDialogue.bind(this);
		this.onPressDialoguePositive = this.onPressDialoguePositive.bind(this);
		this.onPressDialogueNegative = this.onPressDialogueNegative.bind(this);
		this.onPressHeader = this.onPressHeader.bind(this);

		this._keyboardDidShow = this._keyboardDidShow.bind(this);
		this._keyboardDidHide = this._keyboardDidHide.bind(this);

		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
		this.onTokenRefreshListener = null;

		this.timeoutToCallCallback = null;
	}

	componentDidMount() {
		let { dispatch, accessToken } = this.props;

		if (accessToken) {
			this.pushConf();
		}
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

	componentDidUpdate(prevProps: Object) {
		const { dispatch, accessToken } = this.props;
		const { accessToken: accessTokenPrev = {} } = prevProps;
		if (accessToken) {
			this.pushConf();
			// Update accesstoken at the widget side, when ever it is refreshed at the App.
			if (accessTokenPrev.access_token !== accessToken.access_token) {
				dispatch(widgetAndroidConfigure());// Android.
				// TODO: Do for iOS once widget is implemented.
			}
		}
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
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
		if (this.onTokenRefreshListener) {
			this.onTokenRefreshListener();
			this.onTokenRefreshListener = null;
		}
		clearTimeout(this.timeoutToCallCallback);
	}

	_keyboardDidShow() {
		this.setState({
			keyboard: true,
		});
	  }

	  _keyboardDidHide() {
		this.setState({
			keyboard: false,
		});
	  }

	/*
	 * calls the push configuration methods, for logged in users, which will generate push token and listen for local and
	 * remote push notifications.
	 */
	pushConf() {
		const { dispatch, ...otherProps } = this.props;
		dispatch(Push.configure(otherProps));
		if (!this.onTokenRefreshListener) {
			this.onTokenRefreshListener = dispatch(Push.refreshTokenListener(otherProps));
		}
	}

	onLayout(ev: Object) {
		if (!this.state.keyboard) {
			this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
		}
	}

	toggleDialogueBox(dialogueData: Object) {
		this.setState({
			dialogueData,
		});
	}

	closeDialogue(postClose?: () => void = (): void => undefined, timeout?: number = 0) {
		const { dialogueData } = this.state;
		this.setState({
			dialogueData: {
				...dialogueData,
				show: false,
			},
		}, () => {
			if (this.timeoutToCallCallback) {
				clearTimeout(this.timeoutToCallCallback);
			}
			this.timeoutToCallCallback = setTimeout(() => {
				postClose();
			}, timeout);
		});
	}

	onPressDialoguePositive() {
		const { onPressPositive = this.closeDialogue, closeOnPressPositive = false, timeoutToCallPositive = 0 } = this.state.dialogueData;
		if (closeOnPressPositive) {
			this.closeDialogue(onPressPositive, timeoutToCallPositive);
		} else if (onPressPositive) {
			onPressPositive();
		}
	}

	onPressDialogueNegative() {
		const { onPressNegative = this.closeDialogue, closeOnPressNegative = false, timeoutToCallNegative = 0 } = this.state.dialogueData;
		if (closeOnPressNegative) {
			this.closeDialogue(onPressNegative, timeoutToCallNegative);
		} else if (onPressNegative) {
			onPressNegative();
		}
	}

	onPressHeader() {
		const { onPressHeader, closeOnPressHeader = false } = this.state.dialogueData;
		if (closeOnPressHeader) {
			this.closeDialogue(onPressHeader, 0);
		} else if (onPressHeader) {
			onPressHeader();
		}
	}

	render(): Object {
		let { prevChangeLogVersion, accessToken, isTokenValid, forceShowChangeLog } = this.props;

		let showChangeLog = (changeLogVersion !== prevChangeLogVersion) || forceShowChangeLog;

		let hasNotLoggedIn = ((!accessToken) || (accessToken && !isTokenValid));

		let {
			show = false,
			showHeader = false,
			imageHeader = false,
			...others
		} = this.state.dialogueData;

		return (
			<SafeAreaView onLayout={this.onLayout} backgroundColor={Theme.Core.appBackground}>
				{hasNotLoggedIn ?
					<PreLoginNavigator toggleDialogueBox={this.toggleDialogueBox}/>
					:
					<PostLoginNavigatorCommon {...this.props} toggleDialogueBox={this.toggleDialogueBox}/>
				}
				<ChangeLogNavigator
					changeLogVersion={changeLogVersion}
					showChangeLog={showChangeLog}
					forceShowChangeLog={forceShowChangeLog}
					onLayout={this.onLayout}/>
				<DialogueBox
					{...others}
					showDialogue={show}
					showHeader={showHeader}
					imageHeader={imageHeader}
					onPressNegative={this.onPressDialogueNegative}
					onPressPositive={this.onPressDialoguePositive}
					onPressHeader={this.onPressHeader}
				/>
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

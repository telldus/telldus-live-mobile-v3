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
import DeviceInfo from 'react-native-device-info';

import {
	PreLoginNavigator,
	PostLoginNavigatorCommon,
} from './App/Components';
import ChangeLogNavigator from './App/Components/ChangeLog/ChangeLog';
import { SafeAreaView, DialogueBox } from './BaseComponents';
import {
	setAppLayout,
	setAccessibilityListener,
	setAccessibilityInfo,
	widgetAndroidConfigure,
	networkConnection,
	toggleDialogueBoxState,
} from './App/Actions';
import {
	getTranslatableDayNames,
	getTranslatableMonthNames,
	setGAUserProperty,
} from './App/Lib';

import Theme from './App/Theme';
const changeLogVersion = '3.14';

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
	dialogueData: Object,
};

type State = {
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
	clearListenerNetWorkInfo: any;

	constructor(props: Props) {
		super(props);
		this.onLayout = this.onLayout.bind(this);
		this.setCalendarLocale = this.setCalendarLocale.bind(this);

		this.state = {
			keyboard: false,
		};

		this.setCalendarLocale();
		if (Platform.OS === 'android') {
			UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		}

		this.toggleDialogueBox = this.toggleDialogueBox.bind(this);
		this.closeDialogue = this.closeDialogue.bind(this);
		this.onPressDialoguePositive = this.onPressDialoguePositive.bind(this);
		this.onPressDialogueNegative = this.onPressDialogueNegative.bind(this);
		this.onPressHeader = this.onPressHeader.bind(this);

		this._keyboardDidShow = this._keyboardDidShow.bind(this);
		this._keyboardDidHide = this._keyboardDidHide.bind(this);

		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

		this.timeoutToCallCallback = null;

		this.clearListenerNetWorkInfo = null;
	}

	componentDidMount() {
		let { dispatch, deviceId } = this.props;
		AccessibilityInfo.fetch().done((isEnabled: boolean) => {
			dispatch(setAccessibilityInfo(isEnabled));
			dispatch(setAccessibilityListener(setAccessibilityInfo));
		});

		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(Theme.Core.brandPrimary);
		}

		this.clearListenerNetWorkInfo = dispatch(networkConnection());
		setGAUserProperty('deviceUniqueId', deviceId ? deviceId : DeviceInfo.getUniqueId());
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
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
		clearTimeout(this.timeoutToCallCallback);
		if (this.clearListenerNetWorkInfo) {
			this.clearListenerNetWorkInfo();
		}
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

	onLayout(ev: Object) {
		if (!this.state.keyboard) {
			this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
		}
	}

	toggleDialogueBox(dialogueData: Object) {
		const {
			show,
			...others
		} = dialogueData;
		if (show) {
			this.props.dispatch(toggleDialogueBoxState({
				...others,
				openModal: true,
			}));
		} else {
			this.props.dispatch(toggleDialogueBoxState({
				...others,
				openModal: false,
			}));
		}
	}

	closeDialogue(postClose?: () => void = (): void => undefined, timeout?: number = 0) {
		const { dialogueData } = this.props;
		this.props.dispatch(toggleDialogueBoxState({
			...dialogueData,
			openModal: false,
		}));
		if (this.timeoutToCallCallback) {
			clearTimeout(this.timeoutToCallCallback);
		}
		this.timeoutToCallCallback = setTimeout(() => {
			postClose();
		}, timeout);
	}

	onPressDialoguePositive() {
		const { onPressPositive = this.closeDialogue, closeOnPressPositive = false, timeoutToCallPositive = 0 } = this.props.dialogueData;
		if (closeOnPressPositive) {
			this.closeDialogue(onPressPositive, timeoutToCallPositive);
		} else if (onPressPositive) {
			onPressPositive();
		}
	}

	onPressDialogueNegative() {
		const { onPressNegative = this.closeDialogue, closeOnPressNegative = false, timeoutToCallNegative = 0 } = this.props.dialogueData;
		if (closeOnPressNegative) {
			this.closeDialogue(onPressNegative, timeoutToCallNegative);
		} else if (onPressNegative) {
			onPressNegative();
		}
	}

	onPressHeader() {
		const { onPressHeader, closeOnPressHeader = false } = this.props.dialogueData;
		if (closeOnPressHeader) {
			this.closeDialogue(onPressHeader, 0);
		} else if (onPressHeader) {
			onPressHeader();
		}
	}

	render(): Object {
		let {
			prevChangeLogVersion,
			accessToken,
			isTokenValid,
			forceShowChangeLog,
			dialogueData,
		} = this.props;

		let showChangeLog = (changeLogVersion !== prevChangeLogVersion) || forceShowChangeLog;

		let hasNotLoggedIn = ((!accessToken) || (accessToken && !isTokenValid));

		let {
			openModal = false,
			showHeader = false,
			imageHeader = false,
			...others
		} = dialogueData;

		return (
			<SafeAreaView onLayout={this.onLayout} backgroundColor={Theme.Core.appBackground}>
				{hasNotLoggedIn ?
					<PreLoginNavigator toggleDialogueBox={this.toggleDialogueBox}/>
					:
					<PostLoginNavigatorCommon
						{...this.props}
						toggleDialogueBox={this.toggleDialogueBox}
						showChangeLog={showChangeLog}/>
				}
				<ChangeLogNavigator
					changeLogVersion={changeLogVersion}
					showChangeLog={showChangeLog}
					forceShowChangeLog={forceShowChangeLog}
					onLayout={this.onLayout}/>
				<DialogueBox
					{...others}
					showDialogue={openModal && !showChangeLog}
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
		dialogueData: store.modal,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(App));

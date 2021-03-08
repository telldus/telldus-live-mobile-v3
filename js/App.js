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
	AccessibilityInfo,
	UIManager,
	Platform,
	StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { LocaleConfig } from 'react-native-calendars';
import { injectIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');

import {
	PreLoginNavigator,
	PostLoginNavigatorCommon,
} from './App/Components';
import { SafeAreaView, DialogueBox } from './BaseComponents';
import {
	setAppLayout,
	setAccessibilityListener,
	setAccessibilityInfo,
	widgetConfigure,
	networkConnection,
	toggleDialogueBoxState,
	checkForInAppUpdates,
	addInAppStatusUpdateListener,
} from './App/Actions';
import {
	getTranslatableDayNames,
	getTranslatableMonthNames,
	setGAUserProperty,
} from './App/Lib';

import {
	withTheme,
} from './App/Components/HOC/withTheme';

import Theme from './App/Theme';
const changeLogVersion = '3.18';

type Props = {
	dispatch: Function,
	isTokenValid: boolean,
	accessToken: Object,
	pushTokenRegistered: boolean,
	prevChangeLogVersion: string,
	intl: Object,
	locale: string,
	deviceId?: string,
	dialogueData: Object,
	cachedLayout: Object,
	preventLayoutUpdate: boolean,
	colors: Object,
	colorScheme: string,
	themeInApp: string,
	selectedThemeSet: Object,
};

class App extends React.Component<Props> {
	props: Props;

	onLayout: (Object) => void;
	onNotification: Function | null;
	setCalendarLocale: () => void;

	toggleDialogueBox: Function;
	closeDialogue: (?() => void, ?number) => void;
	onPressDialoguePositive: () => void;
	onPressDialogueNegative: () => void;
	onPressHeader: () => void;

	onTokenRefreshListener: null | Function;

	timeoutToCallCallback: any;
	clearListenerNetWorkInfo: any;
	clearInAppStatusUpdateListener: any;

	constructor(props: Props) {
		super(props);
		this.setCalendarLocale = this.setCalendarLocale.bind(this);

		this.setCalendarLocale();
		if (Platform.OS === 'android') {
			UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		}

		this.closeDialogue = this.closeDialogue.bind(this);
		this.onPressDialoguePositive = this.onPressDialoguePositive.bind(this);
		this.onPressDialogueNegative = this.onPressDialogueNegative.bind(this);
		this.onPressHeader = this.onPressHeader.bind(this);

		this.timeoutToCallCallback = null;

		this.clearListenerNetWorkInfo = null;

		this.clearInAppStatusUpdateListener = null;
	}

	componentDidMount() {
		let { dispatch, deviceId, colors, intl } = this.props;

		this.clearInAppStatusUpdateListener = dispatch(addInAppStatusUpdateListener({
			intl,
		}));
		dispatch(checkForInAppUpdates());

		AccessibilityInfo.isScreenReaderEnabled().then((isEnabled: boolean) => {
			dispatch(setAccessibilityInfo(isEnabled));
			dispatch(setAccessibilityListener(setAccessibilityInfo));
		});

		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(colors.safeAreaBG);
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
		const {
			dispatch,
			accessToken,
			colorScheme,
			themeInApp,
			colors,
			selectedThemeSet,
		} = this.props;
		const {
			accessToken: accessTokenPrev = {},
			colorScheme: colorSchemePrev,
			themeInApp: themeInAppPrev,
			selectedThemeSet: selectedThemeSetPrev,
	 } = prevProps;
		if (accessToken) {
			// Update accesstoken at the widget side, when ever it is refreshed at the App.
			if (accessTokenPrev.access_token !== accessToken.access_token) {
				dispatch(widgetConfigure());
			}
		}
		if ((!isEqual(colorSchemePrev, colorScheme) || !isEqual(themeInAppPrev, themeInApp) || !isEqual(selectedThemeSetPrev, selectedThemeSet)) && Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor(colors.safeAreaBG);
		}
	}

	componentWillUnmount() {
		AccessibilityInfo.removeEventListener(
		  'change',
		  setAccessibilityInfo
		);
		clearTimeout(this.timeoutToCallCallback);
		if (this.clearListenerNetWorkInfo) {
			this.clearListenerNetWorkInfo();
		}

		if (this.clearInAppStatusUpdateListener) {
			this.clearInAppStatusUpdateListener();
		}
	}

	onLayout = (ev: Object) => {
		const { cachedLayout, dispatch, preventLayoutUpdate } = this.props;

		if (preventLayoutUpdate) {
			return;
		}

		const { width, x, y } = cachedLayout;

		const { layout } = ev.nativeEvent;

		if (!layout || !layout.height) {
			return;
		}

		// We use app layout basically for styling, and we need to update
		// Only when orientation changes.
		// This conditional check will prevent layout update when keyboard
		// is shown or any other event.
		if (layout.width !== width || layout.x !== x || layout.y !== y) {
			dispatch(setAppLayout(ev.nativeEvent.layout));
		}
	}

	toggleDialogueBox = (dialogueData: Object) => {
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
			dialogueData,
		} = this.props;

		let showChangeLog = changeLogVersion !== prevChangeLogVersion;

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
					<PreLoginNavigator
						screenProps={{
							source: 'prelogin',
							toggleDialogueBox: this.toggleDialogueBox,
							showChangeLog: showChangeLog,
							changeLogVersion: changeLogVersion,
						}}/>
					:
					<PostLoginNavigatorCommon
						{...this.props}
						toggleDialogueBox={this.toggleDialogueBox}
						showChangeLog={showChangeLog}
						changeLogVersion={changeLogVersion}
						onLayout={this.onLayout}/>
				}
				<DialogueBox
					{...others}
					showDialogue={openModal}
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
		deviceId = null,
	} = store.user;
	let {
		changeLogVersion: prevChangeLogVersion,
		layout = {},
		preventLayoutUpdate = false,
	} = store.app;

	return {
		accessToken,
		pushToken,
		isTokenValid,
		pushTokenRegistered,
		prevChangeLogVersion,
		deviceId,
		dialogueData: store.modal,
		cachedLayout: layout,
		preventLayoutUpdate,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(withTheme((injectIntl(App))));

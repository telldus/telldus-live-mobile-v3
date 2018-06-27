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
import {defineMessages, intlShape, injectIntl} from 'react-intl';

import {
	Text,
	View,
	TouchableButton,
	H1,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import { logoutFromTelldus } from '../../../Actions';
import { unregisterPushToken } from '../../../Actions/User';
import { refreshAccessToken } from '../../../Lib';
import Theme from '../../../Theme';

const messages = defineMessages({
	sessionLockedBodyParaOne: {
		id: 'user.sessionLockedBodyParaOne',
		defaultMessage: 'For some reason we can\'t connect your account right now.',
		description: 'Para One content for Session Locked Screen',
	},
	sessionLockedBodyParaTwo: {
		id: 'user.sessionLockedBodyParaTwo',
		defaultMessage: 'Make sure that your internet connection is working and retry by tapping the retry button below.',
		description: 'Para Two content for Session Locked Screen',
	},
});

type Props = {
	refreshAccessToken: () => void,
	logoutFromTelldus: () => void,
	intl: intlShape.isRequired,
	dispatch: Function,
	pushToken: string,
	onPressLogout: boolean,
	appLayout: Object,
	dialogueOpen: boolean,
	styles: Object,
	headerText: string,
	toggleOnPressLogout: (boolean) => void,
};

type State = {
	logout: boolean,
	isLogginIn: boolean,
};

class SessionLocked extends View {
	props: Props;
	state: State;

	onPressLogout: () => void;
	refreshAccessToken: () => void;

	static getDerivedStateFromProps(props: Object, state: Object): Object | null {
		if (props.onPressLogout !== state.logout) {
			return {
				logout: props.onPressLogout,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);

		this.state = {
			isLogginIn: false,
			logout: props.onPressLogout,
		};

		this.bodyOne = this.props.intl.formatMessage(messages.sessionLockedBodyParaOne);
		this.bodyTwo = this.props.intl.formatMessage(messages.sessionLockedBodyParaTwo);
		this.buttonOne = this.props.intl.formatMessage(i18n.retry);
		this.buttonOneOne = this.props.intl.formatMessage(i18n.loggingin);
		this.buttonTwo = this.props.intl.formatMessage(i18n.logout);
		this.buttonTwoTwo = this.props.intl.formatMessage(i18n.loggingout);
		this.confirmMessage = this.props.intl.formatMessage(i18n.contentLogoutConfirm);

		this.onPressLogout = this.onPressLogout.bind(this);
		this.refreshAccessToken = this.refreshAccessToken.bind(this);
	}

	onPressLogout() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data: this.confirmMessage,
			},
		});
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { toggleOnPressLogout } = this.props;
		const { logout } = this.state;
		const { logout: prevLogout } = prevState;
		if (!prevLogout && logout) {
			this.props.logoutFromTelldus()
				.catch(() => {
					// This is to reset the loading state(logout: props.onPressLogout) and thereby update the
					// button label.
					toggleOnPressLogout(false);
				});
		}
	}

	refreshAccessToken() {
		this.setState({
			isLogginIn: true,
		});
		this.props.refreshAccessToken()
			.catch(() => {
				// This is to reset the loading state(isLogginIn) and thereby update the
				// button label.
				this.setState({
					isLogginIn: false,
				});
			});
	}

	render(): Object {
		let { logout, isLogginIn } = this.state;
		let { appLayout, dialogueOpen, headerText, styles: commonStyles} = this.props;
		let styles = this.getStyles(appLayout);

		let buttonOneLabel = isLogginIn ? `${this.buttonOneOne}...` : this.buttonOne;
		let buttonTwoLabel = logout ? `${this.buttonTwoTwo}...` : this.buttonTwo;

		let butOneAccessibilityLabel = isLogginIn ? this.buttonOneOne : null;
		let butTwoAccessibilityLabel = logout ? this.buttonTwoTwo : null;

		return (
			<View style={styles.bodyCover} accessible={!dialogueOpen}>
				<H1 style={commonStyles.headerTextStyle}>
					{headerText}
				</H1>
				<View accessibilityLiveRegion="assertive">
					<Text style={styles.contentText}>
						{this.bodyOne}
					</Text>
					<Text/>
					<Text style={[styles.contentText, {paddingLeft: 20}]}>
						{this.bodyTwo}
					</Text>
				</View>
				<TouchableButton
					onPress={this.refreshAccessToken}
					text={buttonOneLabel}
					style={{marginTop: 10}}
					accessible={!dialogueOpen}
					accessibilityLabel={butOneAccessibilityLabel}/>
				<TouchableButton
					onPress={this.onPressLogout}
					text={buttonTwoLabel}
					style={{marginTop: 10}}
					accessible={!dialogueOpen}
					accessibilityLabel={butTwoAccessibilityLabel}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		let infoFontSize = Math.floor(deviceWidth * 0.039);
		let maxFontSize = Theme.Core.maxSizeTextButton - 2;
		infoFontSize = infoFontSize > maxFontSize ? maxFontSize : infoFontSize;

		return {
			bodyCover: {
				width: isPortrait ? (width - 50) : (height - 50),
			},
			contentText: {
				color: '#ffffff80',
				textAlign: 'center',
				fontSize: infoFontSize,
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		tab: store.navigation.tab,
		pushToken: store.user.pushToken,
		isTokenValid: store.user.isTokenValid,
		appLayout: store.App.layout,
	};
}
function mapDispatchToProps(dispatch: Function): Object {
	return {
		logoutFromTelldus: (pushToken: string): Promise<any> => {
			return dispatch(unregisterPushToken(pushToken)).then((res: Object): Promise<any> => {
				return dispatch(logoutFromTelldus());
			});
		},
		refreshAccessToken: (): Promise<any> => {
			return refreshAccessToken();
		},
		dispatch,
	};
}
module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(SessionLocked));


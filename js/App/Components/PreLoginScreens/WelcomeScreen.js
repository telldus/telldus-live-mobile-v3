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
import { intlShape, injectIntl } from 'react-intl';

import { FormattedMessage, View, Text, TouchableButton, H1 } from '../../../BaseComponents';

import {
	clearAppData,
} from '../../Actions/AppData';

import {
	getLinkTextFontSize,
} from '../../Lib/styleUtils';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

import {
	updateAccessToken,
} from '../../Actions/Auth';

type Props = {
	accessToken: Object,
	onPressOK: Function,
	registeredCredential: any,
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	navigation: Object,
	screenProps: Object,
	dispatch: Function,
	ScreenName: string,
};

class WelcomeScreen extends View {

	props: Props;

	onPressOK: () => void;

	constructor(props: Props) {
		super(props);
		this.onPressOK = this.onPressOK.bind(this);
	}

	onPressOK() {
		const {
			screenProps,
			registeredCredential,
			onPressOK,
			dispatch,
			navigation,
		} = this.props;

		onPressOK(registeredCredential);

		const { source = 'prelogin' } = screenProps;
		if (source === 'postlogin') {
			dispatch(clearAppData());
			navigation.navigate('Tabs', {
				screen: 'Dashboard',
			});
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.ScreenName === nextProps.screenProps.currentScreen;
	}

	goBack = () => {
		this.props.navigation.pop(2);
	}

	render(): Object {
		let { appLayout, styles: commonStyles, intl } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<View style={{flex: 1, alignItems: 'center'}}>
				<H1 style={commonStyles.headerTextStyle}>
					{intl.formatMessage(i18n.welcomeHeader)}
				</H1>
				<Text style={styles.textBody}><FormattedMessage {...i18n.accountCreated} style={styles.textBody}/></Text>
				<Text style={styles.textBody}><FormattedMessage {...i18n.confirmMessage} style={styles.textBody}/></Text>
				<TouchableButton
					style={styles.button}
					onPress={this.onPressOK}
					buttonLevel={24}
					textLevel={40}
					text={i18n.welcomeButton}
				/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		const {
			baseColorPreloginScreen,
		} = Theme.Core;

		const infoFontSize = getLinkTextFontSize(deviceWidth);

		return {
			textBody: {
				color: baseColorPreloginScreen,
				marginTop: infoFontSize,
				textAlign: 'center',
				fontSize: infoFontSize,
			},
			button: {
				marginVertical: infoFontSize,
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		registeredCredential: store.user.registeredCredential,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onPressOK: (accessToken: string) => {
			dispatch(updateAccessToken(accessToken));
		},
		dispatch,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(injectIntl(WelcomeScreen)): Object);

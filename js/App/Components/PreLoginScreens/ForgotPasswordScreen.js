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
import { TouchableOpacity } from 'react-native';

import {
	FormattedMessage,
	View,
} from '../../../BaseComponents';
import { ForgotPasswordForm } from './SubViews';

import {
	getLinkTextFontSize,
} from '../../Lib/styleUtils';
import Theme from './../../Theme';
import i18n from './../../Translations/common';
import { intlShape, injectIntl } from 'react-intl';

type Props = {
	screenProps: Object,
	navigation: Object,
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	validationMessage?: string,
	validationMessageHeader?: string,
	showModal: boolean,
	ScreenName: string,
};

class ForgotPasswordScreen extends View<Props, null> {

	props: Props;

	goBackToLogin: () => void;

	constructor(props: Props) {
		super(props);

		this.goBackToLogin = this.goBackToLogin.bind(this);

		let { formatMessage } = props.intl;

		this.backToLogin = formatMessage(i18n.backToLogin);

		this.labelLink = formatMessage(i18n.labelLink);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.labelBackToLogin = `${this.labelLink} ${this.backToLogin} ${this.labelButtondefaultDescription}`;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.ScreenName === nextProps.screenProps.currentScreen;
	}

	goBackToLogin() {
		this.props.navigation.navigate('Login');
	}

	openDialogueBox = (body: string, header?: Object) => {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {
			show: true,
			showHeader: true,
			header: header,
			text: body,
			showPositive: true,
			showNegative: false,
			closeOnPressPositive: true,
		};
		toggleDialogueBox(dialogueData);
	}

	render(): Object {
		let { appLayout, intl, styles: commonStyles } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<View style={{flex: 1, alignItems: 'stretch'}}>
				<ForgotPasswordForm
					appLayout={appLayout}
					headerText={intl.formatMessage(i18n.forgotPassword)}
					styles={commonStyles}
					openDialogueBox={this.openDialogueBox}/>
				<View style={{ height: 5 }}/>
				<TouchableOpacity
					onPress={this.goBackToLogin}
					accessibilityLabel={this.labelBackToLogin}
					style={{
						alignSelf: 'center',
					}}>
					<FormattedMessage {...i18n.backToLogin} style={styles.accountExist} />
				</TouchableOpacity>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		const {
			baseColorPreloginScreen,
		} = Theme.Core;

		const infoFontSize = getLinkTextFontSize(deviceWidth);

		return {
			accountExist: {
				fontSize: infoFontSize,
				marginHorizontal: infoFontSize * 0.2,
				marginVertical: infoFontSize * 0.8,
				color: baseColorPreloginScreen,
				padding: 5,
			},
		};
	}
}

export default (injectIntl(ForgotPasswordScreen): Object);

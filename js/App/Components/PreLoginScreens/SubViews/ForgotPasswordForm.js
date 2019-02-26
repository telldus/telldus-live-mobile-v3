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
import { TextInput } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, TouchableButton, H1 } from '../../../../BaseComponents';

import { forgotPassword } from '../../../Actions/User';
import { validateEmail } from '../../../Lib/UserUtils';
import { showModal } from '../../../Actions/Modal';

import i18n from '../../../Translations/common';

type Props = {
	intl: intlShape.isRequired,
	appLayout: Object,
	styles: Object,
	headerText: string,
	forgotPassword: (string) => Promise<any>,
	dispatch: Function,
};

type State = {
	email: string,
	isLoading: boolean,
};

class ForgotPasswordForm extends View<Props, State> {

	props: Props;
	state: State;

	onEmailChange: (string) => void;
	onFormSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			email: '',
			isLoading: false,
		};

		const { formatMessage } = props.intl;

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.onEmailChange = this.onEmailChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
	}

	onEmailChange(email: string) {
		this.setState({
			email,
		});
	}

	onFormSubmit() {
		const { email } = this.state;
		const { dispatch, intl } = this.props;
		const { formatMessage } = intl;

		if (email !== '') {
			const isValid = validateEmail(email);
			if (isValid) {
				this.setState({
					isLoading: true,
				});
				this.props.forgotPassword(email).then((res: Object) => {
					const { status } = res;
					if (status && status === 'success') {
						const message = formatMessage(i18n.successBody, {email});
						const header = formatMessage(i18n.successHeader);
						dispatch(showModal(message, header));
					} else {
						dispatch(showModal(this.unknownError));
					}
					this.setState({
						isLoading: false,
					});
				}).catch((error: Object) => {
					if (error.error && error.error === 'User not found') {
						const message = formatMessage(i18n.failureBody);
						const header = formatMessage(i18n.failureHeader);
						dispatch(showModal(message, header));
					} else {
						const message = !error.error_description && error.message === 'Network request failed' ?
							this.networkFailed : error.error_description ?
								error.error_description : error.error ? error.error : this.unknownError;
						dispatch(showModal(message));
					}
					this.setState({
						isLoading: false,
					});
				});
			} else {
				const message = formatMessage(i18n.emailNotValidBody);
				const header = formatMessage(i18n.emailNotValidHeader);
				dispatch(showModal(message, header));
			}
		} else {
			const message = formatMessage(i18n.emailEmptyBody);
			dispatch(showModal(message));
		}
	}


	render(): Object {
		const { headerText, styles, intl } = this.props;
		const { formatMessage } = intl;
		const buttonLabel = this.state.isLoading ? `${formatMessage(i18n.labelSending)}...` : formatMessage(i18n.sendpassword);

		return (
			<View style={styles.formCover}>
				<H1 style={styles.headerTextStyle}>
					{headerText}
				</H1>
				<View style={styles.fieldsContainerStyle}>
					<View style={styles.fieldsPairContainerStyle}>
						<View style={styles.textFieldIconContainer}>
							<View style={[styles.textFieldIconCover, {justifyContent: 'center'}]}>
								<Icon name="email" style={styles.iconStyle} size={styles.iconSize} color="#ffffff80"/>
								<TextInput
									style={styles.textFieldStyle}
									onChangeText={this.onEmailChange}
									onBlur={this.onEmailBlur}
									placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor="#ffffff80"
									underlineColorAndroid="#ffffff80"
									defaultValue={this.state.email}
								/>
							</View>
						</View>
					</View>
				</View>
				<View style={{ height: 10 }}/>
				<TouchableButton
					onPress={this.onFormSubmit}
					text={buttonLabel}
				/>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		forgotPassword: (email: string): Promise<any> => {
			return dispatch(forgotPassword(email));
		},
		dispatch,
	};
}

export default connect(null, mapDispatchToProps)(injectIntl(ForgotPasswordForm));

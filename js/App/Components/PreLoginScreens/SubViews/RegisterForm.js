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
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, TouchableButton } from 'BaseComponents';

import {RegisterUser} from 'Actions_User';

import i18n from '../../../Translations/common';

import Theme from 'Theme';

const messages = defineMessages({
	emailAddressNotMatchHeader: {
		id: 'user.emailAddressNotMatchHeader',
		defaultMessage: 'EMAILS DON\'T MATCH',
		description: 'Validation Message Header when Emails don\'t match',
	},
	emailNotValidHeader: {
		id: 'user.emailNotValidHeader',
		defaultMessage: 'INVALID EMAIL ADDRESS',
		description: 'Validation Message Header when Email address not Valid',
	},
	emailAddressNotMatchBody: {
		id: 'user.emailAddressNotMatchBody',
		defaultMessage: 'Email addresses don\'t match. Please Check your entered email address.',
		description: 'Validation Message Body when Emails don\'t match',
	},
	emailNotValidBody: {
		id: 'user.emailNotValidBody',
		defaultMessage: 'The email address you entered is not valid. Please check that your email address is entered correctly.',
		description: 'Validation Message Body when Email address not Valid',
	},
	fieldEmptyPostfix: {
		id: 'form.register.fieldEmptyPostfix',
		defaultMessage: 'seems to be missing in your form. Please check that it is entered correctly.',
		description: 'Error message Post-fix on form submitted, with fields empty',
	},
});

type Props = {
	dispatch: Function,
	onFormSubmit: Function,
	validationMessage: string,
	showModal: boolean,
	intl: intlShape.isRequired,
	validationMessageHeader: string,
}

class RegisterForm extends View {

	props: Props;

	onFirstNameChange: (string) => void;
	onLastNameChange: (string) => void;
	onEmailChange: (string) => void;
	onConfirmEmailChange: (string) => void;
	onFormSubmit: () => void;
	postSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			firstName: '',
			lastName: '',
			email: '',
			confirmEmail: '',
			isLoading: false,
		};

		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		this.onEmailChange = this.onEmailChange.bind(this);
		this.onConfirmEmailChange = this.onConfirmEmailChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
		this.postSubmit = this.postSubmit.bind(this);
	}

	postSubmit() {
		this.setState({
			isLoading: false,
		});
	}

	onFirstNameChange(firstName: string) {
		this.setState({
			firstName,
		});
	}

	onLastNameChange(lastName: string) {
		this.setState({
			lastName,
		});
	}

	onEmailChange(email: string) {
		this.setState({
			email,
		});
	}

	onConfirmEmailChange(confirmEmail: string) {
		this.setState({
			confirmEmail,
		});
	}

	onFormSubmit() {
		let fn = this.state.firstName, ln = this.state.lastName, em = this.state.email, cem = this.state.confirmEmail;
		if (fn !== '' && ln !== '' && em !== '' && cem !== '') {
			let isConfirmEmailValid = this.validateEmail(cem);
			let isEmailValid = this.validateEmail(em);
			if (isConfirmEmailValid && isEmailValid) {
				if (em === cem) {
					this.setState({
						isLoading: true,
					});
					this.props.onFormSubmit(em, fn, ln, this.postSubmit);
				} else {
					let message = this.props.intl.formatMessage(messages.emailAddressNotMatchBody);
					let header = this.props.intl.formatMessage(messages.emailAddressNotMatchHeader);
					this.showModal(message, header);
				}
			} else {
				let message = this.props.intl.formatMessage(messages.emailNotValidBody);
				let header = this.props.intl.formatMessage(messages.emailNotValidHeader);
				this.showModal(message, header);
			}
		} else {
			let postF = this.props.intl.formatMessage(messages.fieldEmptyPostfix);
			let message = fn === '' ? `${this.props.intl.formatMessage(i18n.firstName)} ${postF}`
				: ln === '' ? `${this.props.intl.formatMessage(i18n.lastName)} ${postF}`
					: em === '' ? `${this.props.intl.formatMessage(i18n.emailAddress)} ${postF}`
						: cem === '' ? `${this.props.intl.formatMessage(i18n.confirmEmailAddress)} ${postF}`
							: this.props.validationMessage;
			this.showModal(message);
		}
	}

	showModal(data, extras = false) {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data,
				extras,
			},
		});
	}

	validateEmail(email: string) {
		let pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
		let emailValid = pattern.test(email);
		if (!emailValid) {
			this.showModal('Invalid Email');
		}
		return emailValid;
	}

	render() {
		return (
			<View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="account" style={Theme.Styles.iconAccount} size={18} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onFirstNameChange}
						placeholder={this.props.intl.formatMessage(i18n.firstName)}
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						editable={!this.props.showModal}
						defaultValue={this.state.firstName}
					/>
				</View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="account" style={Theme.Styles.iconAccount} size={18} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onLastNameChange}
						placeholder={this.props.intl.formatMessage(i18n.lastName)}
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						editable={!this.props.showModal}
						defaultValue={this.state.lastName}
					/>
				</View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onEmailChange}
						placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						editable={!this.props.showModal}
						defaultValue={this.state.email}
					/>
				</View>
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="email" style={Theme.Styles.iconEmail} size={14} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onConfirmEmailChange}
						placeholder={this.props.intl.formatMessage(i18n.confirmEmailAddress)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor="#ffffff80"
						underlineColorAndroid="#ffffff80"
						editable={!this.props.showModal}
						defaultValue={this.state.confirmEmail}
					/>
				</View>
				<TouchableButton
					style={Theme.Styles.submitButton}
					onPress={this.props.showModal ? null : this.onFormSubmit}
					text={this.state.isLoading ? i18n.registering : i18n.register}
					postScript={this.state.isLoading ? '...' : null}
				/>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		onFormSubmit: (email: string, firstName: string, LastName: string, callback: () => void) => {
			dispatch(RegisterUser(email, firstName, LastName)).then(res => {
				callback();
			});
		},
		dispatch,
	};
}

function mapStateToProps(store) {
	return {
		validationMessage: store.modal.data,
		validationMessageHeader: store.modal.extras,
		showModal: store.modal.openModal,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RegisterForm));

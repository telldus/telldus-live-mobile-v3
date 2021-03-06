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
import { injectIntl } from 'react-intl';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
	View,
	TouchableButton,
	H1,
	MaterialTextInput,
} from '../../../../BaseComponents';

import { registerUser } from '../../../Actions/User';
import { validateEmail } from '../../../Lib/UserUtils';

import i18n from '../../../Translations/common';

type Props = {
	dispatch: Function,
	onFormSubmit: Function,
	validationMessage: string,
	intl: Object,
	appLayout: Object,
	dialogueOpen: boolean,
	styles: Object,
	headerText: string,
	openDialogueBox: (string, ?string) => void,
	socialAuthConfig: Object,
};

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

		const {
			email,
			fullName = {},
		} = props.socialAuthConfig;
		const {
			fn = '',
			ln = '',
		} = fullName;

		this.state = {
			firstName: fn,
			lastName: ln,
			email: email || '',
			confirmEmail: email || '',
			isLoading: false,
		};

		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		this.onEmailChange = this.onEmailChange.bind(this);
		this.onConfirmEmailChange = this.onConfirmEmailChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
		this.postSubmit = this.postSubmit.bind(this);

		let { formatMessage } = props.intl;

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
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
		let { intl, validationMessage, onFormSubmit, openDialogueBox } = this.props;
		let { formatMessage } = intl;

		let fn = this.state.firstName, ln = this.state.lastName, em = this.state.email, cem = this.state.confirmEmail;
		if (fn !== '' && ln !== '' && em !== '' && cem !== '') {
			let isConfirmEmailValid = validateEmail(cem);
			let isEmailValid = validateEmail(em);
			if (isConfirmEmailValid && isEmailValid) {
				if (em === cem) {
					this.setState({
						isLoading: true,
					});
					onFormSubmit(em, fn, ln, this.postSubmit)
						.then((response: Object) => {
							this.postSubmit();
						})
						.catch((err: Object) => {
							this.postSubmit();
							this.handleRegisterError(err);
						});
				} else {
					let message = formatMessage(i18n.emailAddressNotMatchBody);
					let header = formatMessage(i18n.emailAddressNotMatchHeader);
					openDialogueBox(message, header);
				}
			} else {
				let message = formatMessage(i18n.emailNotValidBody);
				let header = formatMessage(i18n.emailNotValidHeader);
				openDialogueBox(message, header);
			}
		} else {
			let postF = formatMessage(i18n.fieldEmptyPostfix);
			let message = fn === '' ? `${formatMessage(i18n.firstName)} ${postF}`
				: ln === '' ? `${formatMessage(i18n.lastName)} ${postF}`
					: em === '' ? `${formatMessage(i18n.emailAddress)} ${postF}`
						: cem === '' ? `${formatMessage(i18n.confirmEmailAddress)} ${postF}`
							: validationMessage;
			openDialogueBox(message);
		}
	}

	handleRegisterError(error: Object) {
		let { openDialogueBox } = this.props;
		let data = !error.error_description && error.message === 'Network request failed' ?
			this.networkFailed : error.error_description ?
				error.error_description : error.error ? error.error : this.unknownError;
		openDialogueBox(data);
	}

	render(): Object {
		let { dialogueOpen, headerText, styles } = this.props;
		let buttonAccessible = !this.state.isLoading && !dialogueOpen;
		let importantForAccessibility = dialogueOpen ? 'no-hide-descendants' : 'yes';

		return (
			<View
				importantForAccessibility={importantForAccessibility}
				style={styles.formCover}>
				<H1 style={styles.headerTextStyle}>
					{headerText}
				</H1>
				<View style={styles.fieldsContainerStyle}>
					<View style={styles.fieldsPairContainerStyle}>
						<View style={styles.textFieldIconContainer}>
							<View style={[styles.textFieldIconCover, styles.textFieldIconCoverOne]}>
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onFirstNameChange}
									placeholder={this.props.intl.formatMessage(i18n.firstName)}
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									editable={!this.props.dialogueOpen}
									defaultValue={this.state.firstName}
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									contentInset={styles.contentInset}
									renderLeftAccessory={
										<Icon
											name="account"
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
								/>
							</View>
						</View>
						<View style={styles.textFieldIconContainer}>
							<View style={styles.textFieldIconCover}>
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onLastNameChange}
									placeholder={this.props.intl.formatMessage(i18n.lastName)}
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									editable={!this.props.dialogueOpen}
									defaultValue={this.state.lastName}
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									contentInset={styles.contentInset}
									renderLeftAccessory={
										<Icon
											name="account"
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
								/>
							</View>
						</View>
					</View>
					<View style={styles.fieldsPairContainerStyle}>
						<View style={styles.textFieldIconContainer}>
							<View style={[styles.textFieldIconCover, styles.textFieldIconCoverOne]}>
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onEmailChange}
									placeholder={this.props.intl.formatMessage(i18n.emailAddress)}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									editable={!this.props.dialogueOpen}
									defaultValue={this.state.email}
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									contentInset={styles.contentInset}
									renderLeftAccessory={
										<Icon
											name="email"
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
								/>
							</View>
						</View>
						<View style={styles.textFieldIconContainer}>
							<View style={styles.textFieldIconCover}>
								<MaterialTextInput
									style={styles.textFieldStyle}
									onChangeText={this.onConfirmEmailChange}
									placeholder={this.props.intl.formatMessage(i18n.confirmEmailAddress)}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									placeholderTextColor={styles.textFieldStyle.color}
									editable={!this.props.dialogueOpen}
									defaultValue={this.state.confirmEmail}
									inputContainerStyle={styles.inputContainerStyle}
									containerStyle={styles.containerStyle}
									contentInset={styles.contentInset}
									renderLeftAccessory={
										<Icon
											name="email"
											size={styles.iconSize}
											color={styles.textFieldStyle.color}
											style={styles.leftAccessoryStyle}/>}
								/>
							</View>
						</View>
					</View>
				</View>
				<TouchableButton
					onPress={this.props.dialogueOpen ? null : this.onFormSubmit}
					text={this.state.isLoading ? i18n.registering : i18n.register}
					postScript={this.state.isLoading ? '...' : null}
					accessible={buttonAccessible}
					buttonLevel={this.state.isLoading ? 7 : 24}
					textLevel={this.state.isLoading ? 13 : 40}
				/>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onFormSubmit: (email: string, firstName: string, LastName: string): Promise<any> => {
			return dispatch(registerUser(email, firstName, LastName));
		},
		dispatch,
	};
}

function mapStateToProps(store: Object): Object {
	const {
		socialAuthConfig = {},
	} = store.user;

	return {
		validationMessage: store.modal.data,
		socialAuthConfig,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(RegisterForm)): Object);

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

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, Text, TouchableButton, Modal } from 'BaseComponents';
import {FormContainerComponent, NotificationComponent} from 'PreLoginScreen_SubViews';

import {RegisterUser} from 'Actions_User';

import i18n from './../../Translations/common';

import StyleSheet from 'StyleSheet';
import Theme from 'Theme';

type Props = {
	navigation: Object,
	dispatch: Function,
	onFormSubmit: Function,
	validationMessage: string,
	showModal: boolean,
	registeredCredential: any,
}

class RegisterScreen extends View {

	props: Props;

	onFirstNameChange: (string) => void;
	onLastNameChange: (string) => void;
	onEmailChange: (string) => void;
	onConfirmEmailChange: (string) => void;
	onFormSubmit: () => void;
	goBackToLogin: () => void;
	closeModal: () => void;
	onModalOpen: () => void;

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

		this.goBackToLogin = this.goBackToLogin.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.onModalOpen = this.onModalOpen.bind(this);
	}

	closeModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
		});
	}

	onModalOpen() {
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
					this.props.onFormSubmit(em, fn, ln);
				} else {
					let message = 'Email addresses don\'t match. Please Check your entered email address.';
					this.showModal(message);
				}
			} else {
				let message = !isConfirmEmailValid && !isEmailValid ? 'Emails not Valid' : !isConfirmEmailValid ? 'Email Not Valid- confirm email' : 'Email not Valid';
				this.showModal(message);
			}
		} else {
			let pf = 'Field can\'t be Empty';
			let message = fn === '' ? `${pf}- first name` : ln === '' ? `${pf}- last name ` : em === '' ? `${pf}- email ` : cem === '' ? `${pf}- confirm email` : this.props.validationMessage;
			this.showModal(message);
		}
	}

	showModal(data) {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: {
				data,
			},
		});
	}

	goBackToLogin() {
		this.closeModal();
		this.props.navigation.navigate('Login');
	}

	validateEmail(email: string) {
		let pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
		let emailValid = pattern.test(email);
		if (!emailValid) {
			this.showModal('Invalid Email');
		}
		return emailValid;
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.registeredCredential && nextProps.screenProps.currentScreen !== 'Welcome') {
			nextProps.navigation.navigate('Welcome');
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object) {
		if (nextProps.navigation.state.routeName !== nextProps.screenProps.currentScreen) {
			return false;
		}
		return true;
	}

	render() {
		return (
			<FormContainerComponent headerText="Create Account">
				<View style={Theme.Styles.textFieldCover}>
					<Icon name="account" style={Theme.Styles.iconAccount} size={18} color="#ffffff80"/>
					<TextInput
						style={Theme.Styles.textField}
						onChangeText={this.onFirstNameChange}
						placeholder="First Name"
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
						placeholder="Last Name"
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
						placeholder="Email Address"
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
						placeholder="Confirm Email Address"
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
				/>
				<Text style={styles.accountExist} onPress={this.goBackToLogin}> I already have an account </Text>
				<Modal
					modalStyle={Theme.Styles.notificationModal}
					entry= "ZoomIn"
					exit= "ZoomOut"
					entryDuration= {300}
					exitDuration= {100}
					onOpen= {this.onModalOpen}
					showModal={this.props.showModal}>
					<NotificationComponent text={this.props.validationMessage} onPress={this.closeModal} />
				</Modal>
			</FormContainerComponent>
		);
	}
}

const styles = StyleSheet.create({
	accountExist: {
		marginTop: 10,
		color: '#bbb',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		onFormSubmit: (email, firstName, LastName) => {
			dispatch(RegisterUser(email, firstName, LastName));
		},
		dispatch,
	};
}

function mapStateToProps(store) {
	return {
		validationMessage: store.modal.data,
		showModal: store.modal.openModal,
		registeredCredential: store.user.registeredCredential,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);

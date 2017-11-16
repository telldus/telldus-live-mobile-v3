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
 *
 */

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { TextInput, KeyboardAvoidingView } from 'react-native';
import { defineMessages, intlShape } from 'react-intl';

import {getGatewayInfo} from 'Actions';
import {View, StyleSheet, FormattedMessage, Dimensions, FloatingButton} from 'BaseComponents';
import { LabelBox } from 'AddNewLocation_SubViews';

let deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	label: {
		id: 'addNewLocation.activateManual.label',
		defaultMessage: 'Activation Code',
		description: 'Label for the field Location Manual Activate Field',
	},
	headerOne: {
		id: 'addNewLocation.activateManual.headerOne',
		defaultMessage: 'Select Location',
		description: 'Main header for the Location Manual Activate Screen',
	},
	headerTwo: {
		id: 'addNewLocation.activateManual.headerTwo',
		defaultMessage: 'Enter Activation Code',
		description: 'Secondary header for the Location Manual Activate Screen',
	},
	invalidActivationCode: {
		id: 'addNewLocation.activateManual.invalidActivationCode',
		defaultMessage: 'Invalid Activation Code',
		description: 'Local Validation text when Activation Code is Invalid',
	},
	bodyContent: {
		id: 'addNewLocation.activateManual.bodyContent',
		defaultMessage: 'Activate your TellStick by typing the activation code. The activation code ' +
		'is written on the label on the bottom of your TellStick.',
		description: 'The body content for the Location Manual Activate Screen',
	},
});
type Props = {
	navigation: Object,
	dispatch: Function,
	onDidMount: Function,
	getGatewayInfo: (param: Object, string) => Promise<any>;
	actions: Object,
	intl: intlShape.isRequired,
}

class LocationActivationManual extends View {
	props: Props;

	onActivationCodeChange: (string) => void;
	onActivationCodeSubmit: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			activationCode: '',
		};

		this.h1 = `1. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.label = props.intl.formatMessage(messages.label);

		this.onActivationCodeChange = this.onActivationCodeChange.bind(this);
		this.onActivationCodeSubmit = this.onActivationCodeSubmit.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'LocationActivationManual';
	}

	onActivationCodeChange(activationCode: string) {
		this.setState({
			activationCode,
		});
	}

	onActivationCodeSubmit() {
		if (this.state.activationCode.length === 10) {
			let param = {code: this.state.activationCode};
			this.props.getGatewayInfo(param, 'timezone').then(response => {
				if (response.id) {
					let clientInfo = {
						clientId: response.id,
						uuid: response.uuid,
						type: response.type,
						timezone: response.timezone,
						autoDetected: true,
					};
					this.props.navigation.navigate('LocationName', {clientInfo});
				} else {
					this.props.actions.showModal(response, 'ERROR');
				}
			});
		} else {
			let message = this.props.intl.formatMessage(messages.invalidActivationCode);
			this.props.actions.showModal(message, 'ERROR');
		}
	}

	render() {

		return (
			<View style={{flex: 1}}>
				<KeyboardAvoidingView behavior="position" contentContainerStyle={{justifyContent: 'center'}}>
					<LabelBox
						containerStyle={{marginBottom: 10}}
						label={this.label}
						showIcon={true}>
						<TextInput
							style={styles.textField}
							onChangeText={this.onActivationCodeChange}
							autoCapitalize="none"
							autoCorrect={false}
							underlineColorAndroid="#e26901"
							defaultValue={this.state.activationCode}
						/>
						<FormattedMessage style={styles.textBody} {...messages.bodyContent}/>
					</LabelBox>
				</KeyboardAvoidingView>
				<View style={styles.buttonCover}>
					<FloatingButton
						buttonStyle={styles.buttonStyle}
						onPress={this.onActivationCodeSubmit}
						imageSource={require('../TabViews/img/right-arrow-key.png')}
						showThrobber={false}
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	textBody: {
		color: '#A59F9A',
		marginTop: 10,
		textAlign: 'left',
		fontSize: 13,
		paddingLeft: 2,
	},
	textField: {
		height: 50,
		width: deviceWidth - 40,
		paddingLeft: 35,
		color: '#A59F9A',
		fontSize: 20,
	},
	locationIcon: {
		position: 'absolute',
		top: 35,
		left: 8,
	},
	buttonStyle: {
		right: deviceWidth * 0.053333333,
		elevation: 10,
		shadowOpacity: 0.99,
	},
	buttonCover: {
		flex: 1,
		borderWidth: 1,
		borderColor: 'transparent',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		getGatewayInfo: (param: Object, extras: string) => {
			return dispatch(getGatewayInfo(param, extras));
		},
		dispatch,
	};
}

export default connect(null, mapDispatchToProps)(LocationActivationManual);

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
import { TextInput, Keyboard } from 'react-native';
import { defineMessages, intlShape } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import {View, FloatingButton} from 'BaseComponents';
import LabelBox from '../Common/LabelBox';

import i18n from '../../../Translations/common';
import { messages as commonMessages } from '../Common/messages';
const messages = defineMessages({
	headerTwo: {
		id: 'addNewLocation.editLocationName.headerTwo',
		defaultMessage: 'Change name for your location',
		description: 'Secondary header Text for the Edit name Screen',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	dialogueOpen: boolean,
}

class LocationName extends View {
	props: Props;

	onLocationNameChange: (string) => void;
	onNameSubmit: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			locationName: '',
			isKeyboardShown: false,
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = `${formatMessage(i18n.name)}`;
		this.h2 = formatMessage(messages.headerTwo);
		this.label = formatMessage(i18n.name);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.onLocationNameChange = this.onLocationNameChange.bind(this);
		this.onNameSubmit = this.onNameSubmit.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentWillReceiveProps(nextProps: Object) {
		let { screenReaderEnabled, currentScreen } = nextProps;
		let shouldAnnounce = currentScreen === 'EditName' && this.props.currentScreen !== 'EditName';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	keyboardDidShow() {
		this.setState({
			isKeyboardShown: true,
		});
	}

	keyboardDidHide() {
		this.setState({
			isKeyboardShown: false,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'EditName';
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onLocationNameChange(locationName) {
		this.setState({
			locationName,
		});
	}

	onNameSubmit() {
		if (this.state.isKeyboardShown) {
			Keyboard.dismiss();
		}
		let { navigation, actions, intl } = this.props;
		let { locationName } = this.state;
		if (locationName !== '') {
			this.setState({
				isLoading: true,
			});
			actions.setName(navigation.state.params.id, locationName).then(() => {
				this.setState({
					isLoading: false,
				});
				actions.getGateways();
				navigation.goBack();
			}).catch(() => {
				this.setState({
					isLoading: false,
				});
				actions.showModal('ERROR');
			});
		} else {
			let message = intl.formatMessage(commonMessages.invalidLocationName);
			actions.showModal(message);
		}
	}

	render() {
		let { appLayout, dialogueOpen, currentScreen } = this.props;
		const styles = this.getStyle(appLayout);

		let importantForAccessibility = !dialogueOpen && currentScreen === 'EditName' ? 'no' : 'no-hide-descendants';

		return (
			<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
				<LabelBox
					containerStyle={{marginBottom: 10}}
					label={this.label}
					showIcon={true}
					appLayout={appLayout}>
					<TextInput
						style={styles.textField}
						onChangeText={this.onLocationNameChange}
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus={true}
						underlineColorAndroid="#e26901"
						defaultValue={this.state.locationName}
					/>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onNameSubmit}
					imageSource={this.state.isLoading ? false : require('../../TabViews/img/right-arrow-key.png')}
					showThrobber={this.state.isLoading}
				/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const padding = width * 0.15;

		return {
			textField: {
				height: 50,
				width: width - padding,
				paddingLeft: 35,
				color: '#A59F9A',
				fontSize: 20,
			},
			buttonStyle: {
				right: isPortrait ? width * 0.053333333 : height * 0.053333333,
				elevation: 10,
				shadowOpacity: 0.99,
			},
		};
	}
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

export default connect(null, mapDispatchToProps)(LocationName);

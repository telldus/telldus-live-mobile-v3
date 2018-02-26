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
import { TextInput, Keyboard } from 'react-native';
import { intlShape } from 'react-intl';

import {View, FloatingButton} from '../../../../BaseComponents';
import LabelBox from './LabelBox';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	dialogueOpen: boolean,
	onSubmit: (string) => void,
	isLoading: boolean,
};

class Name extends View {
	props: Props;

	onLocationNameChange: (string) => void;
	onNameSubmit: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);
		let { params } = props.navigation.state;
		let name = params && params.name ? params.name : '';
		this.state = {
			locationName: name,
			isKeyboardShown: false,
		};

		let { formatMessage } = props.intl;

		this.label = formatMessage(i18n.name);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.onLocationNameChange = this.onLocationNameChange.bind(this);
		this.onNameSubmit = this.onNameSubmit.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
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

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onLocationNameChange(locationName: string) {
		this.setState({
			locationName,
		});
	}

	onNameSubmit() {
		let { onSubmit } = this.props;
		let { locationName } = this.state;
		if (onSubmit) {
			onSubmit(locationName);
		}
	}

	render() {
		let { appLayout, dialogueOpen, currentScreen, isLoading } = this.props;
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
						autoCapitalize="sentences"
						autoCorrect={false}
						autoFocus={true}
						underlineColorAndroid="#e26901"
						defaultValue={this.state.locationName}
					/>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onNameSubmit}
					imageSource={isLoading ? false : require('../../TabViews/img/right-arrow-key.png')}
					showThrobber={isLoading}
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

export default Name;

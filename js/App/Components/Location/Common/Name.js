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
import { Keyboard } from 'react-native';

import {
	View,
	FloatingButton,
	MaterialTextInput,
	IconTelldus,
} from '../../../../BaseComponents';
import LabelBox from './LabelBox';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	navigation: Object,
	intl: Object,
	onDidMount: Function,
	actions: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	dialogueOpen: boolean,
	onSubmit: (string) => void,
	isLoading: boolean,
	route: Object,
};

class Name extends View {
	props: Props;

	onLocationNameChange: (string) => void;
	onNameSubmit: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);
		const {
			name: locationName = '',
		} = props.route.params || {};
		this.state = {
			locationName,
			isKeyboardShown: false,
		};

		const { formatMessage } = props.intl;

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

	render(): Object {
		let {
			appLayout,
			dialogueOpen,
			currentScreen,
			isLoading,
			colors,
		} = this.props;

		const {
			baseColorFour,
		} = colors;

		const styles = this.getStyle(appLayout);

		let importantForAccessibility = !dialogueOpen && currentScreen === 'EditName' ? 'no' : 'no-hide-descendants';

		return (
			<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
				<LabelBox
					containerStyle={{marginBottom: 10}}
					appLayout={appLayout}>
					<MaterialTextInput
						label={this.label}
						style={styles.textField}
						onChangeText={this.onLocationNameChange}
						autoCapitalize="sentences"
						autoCorrect={false}
						autoFocus={true}
						baseColor={baseColorFour}
						tintColor={baseColorFour}
						defaultValue={this.state.locationName}
						labelOffset={{
							x0: 5,
							y0: 0,
							x1: 0,
							y1: -5,
						}}
						renderLeftAccessory={<IconTelldus icon={'location'} size={styles.iconSize} color={'#A59F9A'}/>}
					/>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onNameSubmit}
					imageSource={isLoading ? false : {uri: 'right_arrow_key'}}
					showThrobber={isLoading}
				/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSize = deviceWidth * 0.06;

		const iconSize = Math.floor(deviceWidth * 0.09);

		return {
			textField: {
				width: deviceWidth * 0.8,
				paddingLeft: 5 + fontSize,
				color: '#A59F9A',
				fontSize,
			},
			buttonStyle: {
				right: isPortrait ? width * 0.053333333 : height * 0.053333333,
				elevation: 10,
			},
			iconSize,
		};
	}
}

export default (withTheme(Name): Object);

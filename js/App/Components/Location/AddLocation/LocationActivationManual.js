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
import { Keyboard } from 'react-native';
import { announceForAccessibility } from 'react-native-accessibility';

import {
	View,
	FormattedMessage,
	FloatingButton,
	MaterialTextInput,
	IconTelldus,
} from '../../../../BaseComponents';
import LabelBox from '../Common/LabelBox';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';
import capitalize from '../../../Lib/capitalize';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

type Props = PropsThemedComponent & {
	navigation: Object,
	dispatch: Function,
	onDidMount: Function,
	actions: Object,
	intl: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	currentScreen: string,

	toggleDialogueBox: (Object) => void,
};

class LocationActivationManual extends View {
	props: Props;

	onActivationCodeChange: (string) => void;
	onActivationCodeSubmit: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			activationCode: '',
			isKeyboardShown: false,
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = `1. ${capitalize(formatMessage(i18n.LAMheaderOne))}`;
		this.h2 = formatMessage(i18n.LAMheaderTwo);
		this.label = formatMessage(i18n.label);

		this.invalidActivationCode = formatMessage(i18n.invalidActivationCode);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
		this.messageAlreadyActivated = formatMessage(i18n.messageAlreadyActivated);

		this.onActivationCodeChange = this.onActivationCodeChange.bind(this);
		this.onActivationCodeSubmit = this.onActivationCodeSubmit.bind(this);

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

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'LocationActivationManual' && prevProps.currentScreen !== 'LocationActivationManual';
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
		return nextProps.currentScreen === 'LocationActivationManual';
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onActivationCodeChange(activationCode: string) {
		this.setState({
			activationCode,
		});
	}

	onActivationCodeSubmit() {
		if (this.state.isKeyboardShown) {
			Keyboard.dismiss();
		}
		if (this.state.activationCode.length === 10) {
			this.setState({
				isLoading: true,
			});
			let param = {code: this.state.activationCode};
			this.props.actions.getGatewayInfo(param, 'timezone').then((response: Object) => {
				if (response && response.activated === false) {
					let clientInfo = {
						clientId: response.id,
						uuid: response.uuid,
						type: response.type,
						timezone: response.timezone,
						autoDetected: true,
					};
					this.props.navigation.navigate('LocationName', {clientInfo});
				} else if (response && response.activated === true) {
					this.openDialogueBox({
						text: this.messageAlreadyActivated,
					});
				} else {
					this.openDialogueBox({
						text: response,
					});
				}
				this.setState({
					isLoading: false,
				});
			}).catch((error: Object) => {
				let message = error.message ? (error.message === 'Invalid activation code' ? this.invalidActivationCode : error.message) :
					error.error ? error.error : 'Unknown Error';
				this.openDialogueBox({
					text: message,
				});
				this.setState({
					isLoading: false,
				});
			});
		} else {
			this.openDialogueBox({
				text: this.invalidActivationCode,
			});
		}
	}

	openDialogueBox(otherConfs: Object = {}) {
		const { toggleDialogueBox } = this.props;
		const dialogueData = {
			show: true,
			showHeader: true,
			closeOnPressPositive: true,
			dialogueContainerStyle: {elevation: 0},
			showPositive: true,
			...otherConfs,
		};
		toggleDialogueBox(dialogueData);
	}

	render(): Object {
		let { appLayout, currentScreen, colors } = this.props;
		const styles = this.getStyle(appLayout);

		let importantForAccessibility = currentScreen === 'LocationActivationManual' ? 'no' : 'no-hide-descendants';

		const {
			baseColorFour,
		} = colors;

		return (
			<View style={{flex: 1}} importantForAccessibility={importantForAccessibility}>
				<LabelBox
					containerStyle={{marginBottom: 10}}
					appLayout={appLayout}>
					<MaterialTextInput
						label={this.label}
						style={styles.textField}
						onChangeText={this.onActivationCodeChange}
						autoCapitalize="characters"
						autoCorrect={false}
						autoFocus={true}
						baseColor={baseColorFour}
						tintColor={baseColorFour}
						defaultValue={this.state.activationCode}
						labelOffset={{
							x0: 5,
							y0: 0,
							x1: 0,
							y1: -5,
						}}
						renderLeftAccessory={<IconTelldus icon={'location'} size={styles.iconSize} color={'#A59F9A'}/>}
					/>
					<FormattedMessage
						level={25}
						style={styles.textBody} {...i18n.bodyContent}/>
				</LabelBox>
				<FloatingButton
					buttonStyle={styles.buttonStyle}
					onPress={this.onActivationCodeSubmit}
					imageSource={this.state.isLoading ? false : {uri: 'right_arrow_key'}}
					showThrobber={this.state.isLoading}
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
		const {
			fontSizeFactorEleven,
		} = Theme.Core;

		return {
			textBody: {
				textAlign: 'left',
				fontSize: deviceWidth * fontSizeFactorEleven,
				paddingLeft: 2,
			},
			textField: {
				paddingLeft: 5 + fontSize,
				color: '#A59F9A',
				fontSize,
			},
			locationIcon: {
				position: 'absolute',
				top: 35,
				left: 8,
			},
			buttonStyle: {
				right: isPortrait ? width * 0.053333333 : height * 0.053333333,
				elevation: 10,
			},
			iconSize,
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default (connect(null, mapDispatchToProps)(withTheme(LocationActivationManual)): Object);

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
import {
	TextInput,
	KeyboardAvoidingView,
	Keyboard,
	NetInfo,
} from 'react-native';
const isEqual = require('react-fast-compare');
import startCase from 'lodash/startCase';

import {
	View,
	Text,
	TouchableButton,
} from '../../../../BaseComponents';

import capitalise from '../../../Lib/capitalize';
import shouldUpdate from '../../../Lib/shouldUpdate';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	location: Object,

	toggleDialogueBox: (Object) => void,
	onDidMount: Function,
	intl: Object,
	navigation: Object,
	actions: Object,
};

type State = {
	value: string,
	routerValue: string,
	isLoading: boolean,
};

class RequestSupport extends View<Props, State> {
props: Props;

state: State = {
	value: '',
	isLoading: false,
	routerValue: '',
};

onChangeText: (string) => void;
showDialogue: (string, string) => void;
onSubmitEditing: () => void;
contactSupport: () => void;
onPressPositive: () => void;

constructor(props: Props) {
	super(props);

	this.onChangeText = this.onChangeText.bind(this);
	this.showDialogue = this.showDialogue.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);
	this.contactSupport = this.contactSupport.bind(this);
	this.onPressPositive = this.onPressPositive.bind(this);

	const { formatMessage } = this.props.intl;

	this.h1 = formatMessage(i18n.labelLocalControl);
	this.h2 = formatMessage(i18n.labelContactSupport);
}

componentDidMount() {
	const { h1, h2 } = this;
	this.props.onDidMount(h1, h2);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}
	const propsChange = shouldUpdate(this.props, nextProps, ['appLayout', 'location']);
	if (propsChange) {
		return true;
	}
	return false;
}

contactSupport() {
	const { actions, location, navigation, intl } = this.props;
	const { formatMessage } = intl;
	const { id } = location;
	const { value, isLoading, routerValue } = this.state;

	const errorH = startCase(formatMessage(i18n.errorCannotCreateTicketH));
	const errorB = formatMessage(i18n.errorCannotCreateTicketB, {url: 'support.telldus.com.'});

	Keyboard.dismiss();
	if (!isLoading) {
		this.setState({
			isLoading: true,
		});
		NetInfo.getConnectionInfo().then((connectionInfo: Object) => {
			const { type, effectiveType } = connectionInfo;

			const failedTests = navigation.getParam('failedTests', '');
			actions.createSupportTicketLCT(id, value, failedTests, routerValue, type, effectiveType).then((ticketNum: number) => {
				if (ticketNum && typeof ticketNum === 'number') {
					this.showDialogue(startCase(formatMessage(i18n.labelSupportTicketCreated)), formatMessage(i18n.messageSupportTicket, {ticketNum}));
				} else {
					this.showDialogue(errorH, errorB);
				}
				this.setState({
					isLoading: false,
				});
			}).catch(() => {
				this.showDialogue(errorH, errorB);
				this.setState({
					isLoading: false,
				});
			});
		});
	}
}

showDialogue(header: string, text: string) {
	const { toggleDialogueBox } = this.props;

	const dialogueData = {
		show: true,
		showPositive: true,
		header,
		imageHeader: true,
		text,
		showHeader: true,
		closeOnPressPositive: true,
		onPressPositive: this.onPressPositive,
		capitalizeHeader: false,
	};
	toggleDialogueBox(dialogueData);
}

onPressPositive() {
	const { navigation } = this.props;
	navigation.popToTop();
}

onChangeText(value: string) {
	this.setState({
		value,
	});
}

onSubmitEditing() {
	Keyboard.dismiss();
}

render(testData: Object): Object {
	const {
		appLayout,
		intl,
	} = this.props;
	const {
		value,
	} = this.state;
	const {
		container,
		title,
		body,
		label,
		textField,
		brandSecondary,
		button,
	} = this.getStyles(appLayout);
	const { formatMessage } = intl;

	return (
			<>
				<View style={container}>
					<KeyboardAvoidingView
						behavior="padding">
						<Text style={title}>
							{capitalise(formatMessage(i18n.labelCreateSupportTicket))}
						</Text>
						<Text style={body}>
							{formatMessage(i18n.messageCreateSupportTicket)}
						</Text>
						<Text style={label}>
							{formatMessage(i18n.labelMessage)}
						</Text>
						<TextInput
							value={value}
							style={textField}
							onChangeText={this.onChangeText}
							onSubmitEditing={this.onSubmitEditing}
							autoCapitalize="sentences"
							autoCorrect={false}
							autoFocus={true}
							underlineColorAndroid={brandSecondary}
							returnKeyType={'done'}
							multiline={true}
						/>
					</KeyboardAvoidingView>
				</View>
				<TouchableButton text={i18n.labelSend} style={button} onPress={this.contactSupport}/>
			</>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor, brandSecondary, rowTextColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.045;
	const fontSizeTitle = deviceWidth * 0.05;
	const fontSizeBody = deviceWidth * 0.035;
	const fontSizeLabel = deviceWidth * 0.038;

	return {
		brandSecondary,
		container: {
			backgroundColor: '#fff',
			...shadow,
			marginVertical: padding,
			padding: padding * 2,
		},
		title: {
			color: brandSecondary,
			fontSize: fontSizeTitle,
		},
		body: {
			color: rowTextColor,
			fontSize: fontSizeBody,
			marginTop: 10,
		},
		label: {
			color: brandSecondary,
			fontSize: fontSizeLabel,
			marginTop: 22,
		},
		textField: {
			width: '100%',
			color: '#A59F9A',
			fontSize: fontSizeText,
			marginTop: 8,
		},
		button: {
			marginTop: padding * 1.5,
		},
	};
}
}

export default RequestSupport;

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
} from 'react-native';
const isEqual = require('react-fast-compare');

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

	toggleDialogueBox: (Object) => void,
	onDidMount: Function,
};

type State = {
    value: string,
};

class RequestSupport extends View<Props, State> {
props: Props;

state: State = {
	value: '',
};

onChangeText: (string) => void;
showDialogue: () => void;
onSubmitEditing: () => void;

constructor(props: Props) {
	super(props);

	this.onChangeText = this.onChangeText.bind(this);
	this.showDialogue = this.showDialogue.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);

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
	const propsChange = shouldUpdate(this.props, nextProps, ['appLayout']);
	if (propsChange) {
		return true;
	}
	return false;
}

showDialogue() {
	const { toggleDialogueBox, intl } = this.props;
	const ticketNum = 112233;

	const dialogueData = {
		show: true,
		showPositive: true,
		header: intl.formatMessage(i18n.labelSupportTicketCreated),
		imageHeader: true,
		text: intl.formatMessage(i18n.messageSupportTicket, {ticketNum}),
		showHeader: true,
		closeOnPressPositive: true,
		capitalizeHeader: true,
	};
	toggleDialogueBox(dialogueData);
}

onChangeText(value: string) {
	this.setState({
		value,
	});
}

onSubmitEditing() {
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
				<TouchableButton text={i18n.labelSend} style={button} onPress={this.showDialogue}/>
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

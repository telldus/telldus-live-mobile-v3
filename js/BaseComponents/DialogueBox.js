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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import View from './View';
import Text from './Text';
import Modal from './Modal';
import Theme from 'Theme';
import i18n from '../App/Translations/common';

const messages = defineMessages({
	defaultHeader: {
		id: 'dialogueBox.defaultHeader',
		defaultMessage: 'OOPS',
		description: 'Default Header for the notification component',
	},
	defaultPositiveText: {
		id: 'dialogueBox.defaultPositiveText',
		defaultMessage: 'OK',
		description: 'Default Positive text for the notification component',
	},
	defaultNegativeText: {
		id: 'dialogueBox.defaultNegativeText',
		defaultMessage: 'CANCEL',
		description: 'Default Negative text for the notification component',
	},
});


type Props = {
	showDialogue?: boolean,
	style?: number | Object | Array<any>,
	dialogueContainerStyle?: Array<any> | number | Object,
	entry?: string,
	exit?: string,
	entryDuration?: number,
	exitDuration?: number,
	text: string,
	header?: string,
	showPositive: boolean,
	showNegative: boolean,
	positiveText?: string,
	negativeText?: string,
	onPressPositive?: () => void,
	onPressNegative?: () => void,
	intl: intlShape.isRequired,
	appLayout: Object,
	accessibilityLabel?: string,
};

type defaultProps = {
	showDialogue: false,
	entry: string,
	exit: string,
	entryDuration: number,
	exitDuration: number,
};

class DialogueBox extends Component<Props, null> {

	props: Props;

	static defaultProps: defaultProps = {
		showDialogue: false,
		entry: 'ZoomIn',
		exit: 'ZoomOut',
		entryDuration: 300,
		exitDuration: 100,
	}

	renderHeader: (Object) => void;
	renderBody: (Object) => void;
	renderFooter: (Object) => void;

	onPressPositive: () => void;
	onPressNegative: () => void;
	onModalOpened: () => void;

	defaultHeader: string;
	defaultPositiveText: string;
	defaultNegativeText: string;
	labelPress: string;
	labelToConfirm: string;
	labelToReturn: string;
	labelButtondefaultDescription: string;
	labelButton: string;

	labelDefaultDialoguePhrase: string;

	constructor(props: Props) {
		super(props);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderBody = this.renderBody.bind(this);
		this.renderFooter = this.renderFooter.bind(this);

		this.onPressPositive = this.onPressPositive.bind(this);
		this.onPressNegative = this.onPressNegative.bind(this);
		this.onModalOpened = this.onModalOpened.bind(this);

		this.defaultHeader = `${this.props.intl.formatMessage(messages.defaultHeader)}!`;
		this.defaultPositiveText = `${this.props.intl.formatMessage(messages.defaultPositiveText)}`;
		this.defaultNegativeText = `${this.props.intl.formatMessage(messages.defaultNegativeText)}`;

		this.labelButton = `${this.props.intl.formatMessage(i18n.button)}`;
		this.labelButtondefaultDescription = `${this.props.intl.formatMessage(i18n.defaultDescriptionButton)}`;

		this.labelDefaultDialoguePhrase = `${this.props.intl.formatMessage(i18n.defaultDialoguePhrase)}!`;
		this.labelPress = `${this.props.intl.formatMessage(i18n.labelPress)}!`;
		this.labelToConfirm = `${this.props.intl.formatMessage(i18n.labelToConfirm)}!`;
		this.labelToReturn = `${this.props.intl.formatMessage(i18n.labelToReturn)}!`;
	}

	onPressNegative() {
		let {onPressNegative} = this.props;
		if (onPressNegative) {
			if (typeof onPressNegative === 'function') {
				onPressNegative();
			} else {
				console.warn('Invalid Prop Passed : onPressNegative expects a Function.');
			}
		}
	}

	onPressPositive() {
		let {onPressPositive} = this.props;
		if (onPressPositive) {
			if (typeof onPressPositive === 'function') {
				onPressPositive();
			} else {
				console.warn('Invalid Prop Passed : onPressPositive expects a Function.');
			}
		}
	}

	renderHeader(styles: Object): any {
		let { header } = this.props;
		if (header && typeof header === 'object') {
			return (
				header
			);
		}
		if (!header) {
			header = this.defaultHeader;
		}

		return (
			<View style={styles.notificationModalHeader}>
				<Text style={styles.notificationModalHeaderText}>
					{header}
				</Text>
			</View>
		);
	}

	renderBody(styles: Object): any {
		let { text } = this.props;
		if (text && typeof text === 'object') {
			return (
				text
			);
		}

		return (
			<View style={styles.notificationModalBody}>
				<Text style={styles.notificationModalBodyText}>{text}</Text>
			</View>
		);
	}

	renderFooter(styles: Object): any {
		let positiveText = this.props.positiveText ? this.props.positiveText :
			this.defaultPositiveText;
		let negativeText = this.props.negativeText ? this.props.negativeText :
			this.defaultNegativeText;

		let accessibilityLabelPositive = `${positiveText} ${this.labelButton} ${this.labelButtondefaultDescription}`;
		let accessibilityLabelNegative = `${negativeText} ${this.labelButton} ${this.labelButtondefaultDescription}`;

		return (
			<View style={styles.notificationModalFooter}>
				{this.props.showNegative ?
					<TouchableOpacity style={[styles.notificationModalFooterTextCover, {marginRight: 10}]}
						onPress={this.onPressNegative}
						accessibilityLabel={accessibilityLabelNegative}>
						<Text style={styles.notificationModalFooterNegativeText}>{negativeText}</Text>
					</TouchableOpacity>
					:
					null
				}
				{this.props.showPositive ?
					<TouchableOpacity style={styles.notificationModalFooterTextCover}
						onPress={this.onPressPositive}
						accessibilityLabel={accessibilityLabelPositive}>
						<Text style={styles.notificationModalFooterPositiveText}>{positiveText}</Text>
					</TouchableOpacity>
					:
					null
				}
			</View>
		);
	}

	onModalOpened() {
		this.announceForAccessibility();
	}

	announceForAccessibility() {
		let message = this.getAccessibiltyMessage();
		announceForAccessibility(message);
	}

	getAccessibiltyMessage() {
		let { accessibilityLabel, text, showNegative, showPositive, positiveText, negativeText } = this.props;
		if (accessibilityLabel) {
			return accessibilityLabel;
		}

		let phrase = this.labelDefaultDialoguePhrase;
		let hasMessage = text && typeof text === 'string';

		let PositiveInfo = showPositive ? (positiveText ? `${positiveText} ${this.labelToConfirm}` : `${this.defaultPositiveText} ${this.labelToConfirm}`) : '';
		let NegativeInfo = showNegative ? (negativeText ? `${negativeText} ${this.labelToReturn}` : `${this.defaultNegativeText} ${this.labelToReturn}`) : '';
		let labelButtonInfo = `${this.labelPress}, ${PositiveInfo} ${NegativeInfo}`;
		let buttonInfo = !showPositive && !showNegative ? '' : labelButtonInfo;

		return hasMessage ? `${phrase}. ${text}. ${buttonInfo}` : '';
	}

	render(): Object {
		let {
			showDialogue,
			style,
			dialogueContainerStyle,
			entry,
			exit,
			entryDuration,
			exitDuration,
			appLayout,
		} = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<Modal
				modalStyle={[Theme.Styles.notificationModal, style]}
				modalContainerStyle={dialogueContainerStyle}
				entry={entry}
				exit={exit}
				entryDuration={entryDuration}
				exitDuration={exitDuration}
				showModal={showDialogue}
				onOpened={this.onModalOpened}>
				{this.renderHeader(styles)}
				{this.renderBody(styles)}
				{this.renderFooter(styles)}
			</Modal>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const deviceWidth = isPortrait ? width : height;

		return {
			notificationModalHeader: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 20,
				height: deviceHeight * 0.08,
				width: deviceWidth * 0.75,
				backgroundColor: '#e26901',
			},
			notificationModalHeaderText: {
				color: '#ffffff',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
			},
			notificationModalBody: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 20,
				paddingRight: 10,
				height: deviceHeight * 0.2,
				width: deviceWidth * 0.75,
			},
			notificationModalBodyText: {
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				color: '#6B6969',
			},
			notificationModalFooter: {
				alignItems: 'center',
				justifyContent: 'flex-end',
				flexDirection: 'row',
				paddingRight: 20,
				height: deviceHeight * 0.08,
				width: deviceWidth * 0.75,
			},
			notificationModalFooterTextCover: {
				alignItems: 'flex-end',
				justifyContent: 'center',
				height: deviceHeight * 0.08,
				paddingRight: 5,
				paddingLeft: 5,
			},
			notificationModalFooterNegativeText: {
				color: '#6B6969',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				fontWeight: 'bold',
			},
			notificationModalFooterPositiveText: {
				color: '#e26901',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				fontWeight: 'bold',
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(DialogueBox));

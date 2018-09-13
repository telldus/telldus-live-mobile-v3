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
import Modal from 'react-native-modal';
import { intlShape, injectIntl } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';

import View from './View';
import Text from './Text';

import capitalize from '../App/Lib/capitalize';
import i18n from '../App/Translations/common';


type Props = {
	showDialogue?: boolean,
	appLayout: Object,

	text: string,
	header?: string,
	entryDuration?: number,
	exitDuration?: number,
	showPositive: boolean,
	showNegative: boolean,
	positiveText?: string,
	negativeText?: string,
	onPressPositive?: () => void,
	onPressNegative?: () => void,
	intl: intlShape.isRequired,
	accessibilityLabel?: string,
	style?: number | Object | Array<any>,
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

		this.defaultHeader = `${this.props.intl.formatMessage(i18n.defaultHeader)}!`;
		this.defaultPositiveText = `${this.props.intl.formatMessage(i18n.defaultPositiveText)}`;
		this.defaultNegativeText = `${this.props.intl.formatMessage(i18n.defaultNegativeText)}`;

		this.labelButton = `${this.props.intl.formatMessage(i18n.button)}`;
		this.labelButtondefaultDescription = `${this.props.intl.formatMessage(i18n.defaultDescriptionButton)}`;

		this.labelDefaultDialoguePhrase = `${this.props.intl.formatMessage(i18n.defaultDialoguePhrase)}!`;
		this.labelPress = `${this.props.intl.formatMessage(i18n.labelPress)}!`;
		this.labelToConfirm = `${this.props.intl.formatMessage(i18n.labelToConfirm)}!`;
		this.labelToReturn = `${this.props.intl.formatMessage(i18n.labelToReturn)}!`;
	}

	shouldComponentUpdate(nextProps: Object): boolean {
		const { showDialogue, appLayout } = this.props;
		if (showDialogue !== nextProps.showDialogue) {
			return true;
		}

		if (appLayout.width !== nextProps.appLayout.width) {
			return true;
		}

		return false;
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

		header = typeof header === 'string' ? capitalize(header) : header;
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

	getAccessibiltyMessage(): string {
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
			entryDuration,
			exitDuration,
			appLayout,
		} = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<Modal
				style={styles.modal}
				backdropOpacity={0.60}
				isVisible={showDialogue}
				animationInTiming={entryDuration}
				animationOutTiming={exitDuration}
				hideModalContentWhileAnimating={true}
				onModalShow={this.onModalOpened}
				supportedOrientations={['portrait', 'landscape']}>
				<View style={[styles.container, style]}>
					{this.renderHeader(styles)}
					{this.renderBody(styles)}
					{this.renderFooter(styles)}
				</View>
			</Modal>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSize = Math.floor(deviceWidth * 0.042);

		return {
			modal: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			container: {
				backgroundColor: '#fff',
				alignItems: 'center',
				justifyContent: 'center',
			},
			notificationModalHeader: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 20,
				width: deviceWidth * 0.75,
				backgroundColor: '#e26901',
			},
			notificationModalHeaderText: {
				color: '#ffffff',
				fontSize,
			},
			notificationModalBody: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				padding: 5 + fontSize,
				width: deviceWidth * 0.75,
			},
			notificationModalBodyText: {
				fontSize,
				color: '#6B6969',
			},
			notificationModalFooter: {
				alignItems: 'center',
				justifyContent: 'flex-end',
				flexDirection: 'row',
				paddingRight: 20,
				width: deviceWidth * 0.75,
				paddingBottom: 5 + fontSize,
			},
			notificationModalFooterTextCover: {
				alignItems: 'flex-end',
				justifyContent: 'center',
				paddingRight: 5,
				paddingLeft: 5,
			},
			notificationModalFooterNegativeText: {
				color: '#6B6969',
				fontSize,
				fontWeight: 'bold',
			},
			notificationModalFooterPositiveText: {
				color: '#e26901',
				fontSize,
				fontWeight: 'bold',
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(DialogueBox));

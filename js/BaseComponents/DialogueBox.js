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
import DialogueHeader from './DialogueHeader';

import capitalize from '../App/Lib/capitalize';
import i18n from '../App/Translations/common';
import Theme from '../App/Theme';


type Props = {
	showDialogue?: boolean,
	appLayout: Object,

	backdropOpacity?: number,
	showIconOnHeader?: boolean,
	imageHeader?: boolean,
	text: string,
	header?: string,
	onPressHeader?: () => void,
	onPressHeaderIcon?: () => void,
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
	showHeader?: boolean,
	backdropColor?: string,
	capitalizeHeader?: boolean,
	negTextColor?: string,
	posTextColor?: string,
};

type defaultProps = {
	showDialogue: false,
	entry: string,
	exit: string,
	entryDuration: number,
	exitDuration: number,
	backdropOpacity: number,
	showHeader: boolean,
	capitalizeHeader: boolean,
	negTextColor: string,
	posTextColor: string,
};

class DialogueBox extends Component<Props, null> {

	props: Props;

	static defaultProps: defaultProps = {
		showDialogue: false,
		entry: 'ZoomIn',
		exit: 'ZoomOut',
		entryDuration: 300,
		exitDuration: 100,
		backdropColor: '#000',
		backdropOpacity: 0.60,
		showHeader: true,
		capitalizeHeader: true,
		negTextColor: '#6B6969',
		posTextColor: Theme.Core.brandSecondary,
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

	dialogueImageHeader({
		showIconOnHeader,
		header,
		capitalizeHeader,
		onPressHeader,
		onPressHeaderIcon,
		styles,
	}: Object): Object {
		return (
			<DialogueHeader
				headerText={typeof header === 'string' && capitalizeHeader ? capitalize(header) : header}
				showIcon={showIconOnHeader}
				onPressHeader={onPressHeader}
				headerStyle={styles.dialogueHeaderStyle}
				onPressIcon={onPressHeaderIcon}
				textStyle={styles.notificationModalHeaderText}
				shouldCapitalize={capitalizeHeader}
				headerHeight={styles.headerHeight}
				headerWidth={styles.headerWidth}/>
		);
	}

	renderHeader(styles: Object): any {
		let { header, capitalizeHeader, showIconOnHeader, onPressHeader, onPressHeaderIcon } = this.props;

		if (header && typeof header === 'object') {
			return (
				header
			);
		} else if (!header) {
			header = this.defaultHeader;
		}

		return this.dialogueImageHeader({
			showIconOnHeader,
			header,
			capitalizeHeader,
			onPressHeader,
			onPressHeaderIcon,
			styles,
		});
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
		const { positiveText, negativeText, showNegative, showPositive } = this.props;
		if (!showNegative && !showPositive) {
			return null;
		}
		let pText = positiveText ? positiveText :
			this.defaultPositiveText;
		let nText = negativeText ? negativeText :
			this.defaultNegativeText;

		let accessibilityLabelPositive = `${pText} ${this.labelButton} ${this.labelButtondefaultDescription}`;
		let accessibilityLabelNegative = `${nText} ${this.labelButton} ${this.labelButtondefaultDescription}`;

		return (
			<View style={styles.notificationModalFooter}>
				{showNegative ?
					<TouchableOpacity style={[styles.notificationModalFooterTextCover, {marginRight: 10}]}
						onPress={this.onPressNegative}
						accessibilityLabel={accessibilityLabelNegative}>
						<Text style={styles.notificationModalFooterNegativeText}>{nText}</Text>
					</TouchableOpacity>
					:
					null
				}
				{showPositive ?
					<TouchableOpacity style={styles.notificationModalFooterTextCover}
						onPress={this.onPressPositive}
						accessibilityLabel={accessibilityLabelPositive}>
						<Text style={styles.notificationModalFooterPositiveText}>{pText}</Text>
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
		const {
			showDialogue,
			style,
			entryDuration,
			exitDuration,
			backdropOpacity,
			showHeader,
			backdropColor,
		} = this.props;
		const styles = this.getStyles();

		return (
			<Modal
				style={styles.modal}
				backdropColor={backdropColor}
				backdropOpacity={backdropOpacity}
				isVisible={showDialogue}
				animationInTiming={entryDuration}
				animationOutTiming={exitDuration}
				hideModalContentWhileAnimating={true}
				onModalShow={this.onModalOpened}
				supportedOrientations={['portrait', 'landscape']}>
				<View style={[styles.container, style]}>
					{!!showHeader && this.renderHeader(styles)}
					{this.renderBody(styles)}
					{this.renderFooter(styles)}
				</View>
			</Modal>
		);
	}

	getStyles(): Object {
		const { appLayout, negTextColor, posTextColor } = this.props;
		const { width, height } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSizeHeader = Math.floor(deviceWidth * 0.046);
		const fontSize = Math.floor(deviceWidth * 0.042);

		const headerWidth = deviceWidth * 0.75;
		const borderRadi = 5;

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
				borderRadius: borderRadi,
				overflow: 'hidden',
			},
			notificationModalHeader: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingVertical: fontSize,
				paddingHorizontal: 5 + fontSize,
				width: deviceWidth * 0.75,
				backgroundColor: '#e26901',
			},
			dialogueHeaderStyle: {
				paddingVertical: fontSize,
				paddingHorizontal: 5 + fontSize,
				borderRadiusTopLeft: borderRadi,
				borderRadiusTopRight: borderRadi,
			},
			headerWidth,
			headerHeight: deviceWidth * 0.1,
			notificationModalHeaderText: {
				color: '#ffffff',
				fontSize: fontSizeHeader,
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
				color: negTextColor,
				fontSize,
				fontWeight: 'bold',
				fontFamily: 'Roboto-Regular',
			},
			notificationModalFooterPositiveText: {
				color: posTextColor,
				fontSize,
				fontWeight: 'bold',
				fontFamily: 'Roboto-Regular',
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

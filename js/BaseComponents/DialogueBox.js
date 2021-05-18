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
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { injectIntl } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';
const isEqual = require('react-fast-compare');

import View from './View';
import Text from './Text';
import DialogueHeader from './DialogueHeader';
import Throbber from './Throbber';

import capitalize from '../App/Lib/capitalize';
import i18n from '../App/Translations/common';
import Theme from '../App/Theme';
import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type Props = PropsThemedComponent & {
	showDialogue?: boolean,
	appLayout: Object,
	extraData?: Object,

	showThrobberOnNegative?: boolean,
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
	intl: Object,
	accessibilityLabel?: string,
	style?: Array<any> | Object,
	showHeader?: boolean,
	backdropColor?: string,
	capitalizeHeader?: boolean,
	negTextColor?: string,
	posTextColor?: string,
	notificationModalFooterPositiveTextCoverStyle: Object | Array<any>,
	notificationModalFooterStyle: Array<any> | Object,
	negTextColorLevel?: number,
	posTextColorLevel?: number,
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
	extraData: Object,
	showThrobberOnNegative: boolean,
	backdropColor: string,
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
		extraData: {},
		showThrobberOnNegative: false,
	};

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
		this.defaultNegativeText = `${capitalize(this.props.intl.formatMessage(i18n.defaultNegativeText))}`;

		this.labelButton = `${this.props.intl.formatMessage(i18n.button)}`;
		this.labelButtondefaultDescription = `${this.props.intl.formatMessage(i18n.defaultDescriptionButton)}`;

		this.labelDefaultDialoguePhrase = `${this.props.intl.formatMessage(i18n.defaultDialoguePhrase)}!`;
		this.labelPress = `${this.props.intl.formatMessage(i18n.labelPress)}!`;
		this.labelToConfirm = `${this.props.intl.formatMessage(i18n.labelToConfirm)}!`;
		this.labelToReturn = `${this.props.intl.formatMessage(i18n.labelToReturn)}!`;
	}

	shouldComponentUpdate(nextProps: Object): boolean {
		const { showDialogue, appLayout, extraData } = this.props;
		if (showDialogue !== nextProps.showDialogue) {
			return true;
		}

		if (appLayout.width !== nextProps.appLayout.width) {
			return true;
		}

		if (!isEqual(nextProps.extraData, extraData)) {
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
				onPressIcon={onPressHeaderIcon}
				textStyle={styles.notificationModalHeaderText}
				iconStyle={styles.notificationModalHeaderIcon}
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
			<View style={styles.notificationModalBody} accessible={true} importantForAccessibility={'yes'} accessibilityLabel={text}>
				<Text
					level={4}
					style={styles.notificationModalBodyText}>{text}</Text>
			</View>
		);
	}

	renderFooter(styles: Object): any {
		const {
			positiveText,
			negativeText,
			showNegative,
			showPositive,
			notificationModalFooterStyle,
			notificationModalFooterPositiveTextCoverStyle,
			negTextColorLevel,
			posTextColorLevel,
			showThrobberOnNegative = false,
		} = this.props;
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
			<View style={[styles.notificationModalFooterDef, notificationModalFooterStyle]}>
				{showNegative ?
					<TouchableOpacity style={[styles.notificationModalFooterTextCover, {
						marginRight: showPositive ? 5 : 0,
						paddingRight: showPositive ? 10 : 30,
					}]}
					onPress={this.onPressNegative}
					accessibilityLabel={accessibilityLabelNegative}>
						{showThrobberOnNegative ?
							<Throbber
								throbberContainerStyle={{
									position: 'relative',
								}}/>
							:
							<Text
								level={negTextColorLevel}
								style={styles.notificationModalFooterNegativeText}>{nText}</Text>
						}
					</TouchableOpacity>
					:
					null
				}
				{showPositive ?
					<TouchableOpacity style={[styles.notificationModalFooterTextCover, {
						paddingRight: 30,
					}, notificationModalFooterPositiveTextCoverStyle]}
					onPress={this.onPressPositive}
					accessibilityLabel={accessibilityLabelPositive}>
						<Text
							level={posTextColorLevel}
							style={styles.notificationModalFooterPositiveText}>{pText}</Text>
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

	renderCustomBackdrop = ({
		backdropColor,
		backdropOpacity,
	}: Object): Object => {
		return (
			<TouchableWithoutFeedback accessible={false}>
				<View accessible={false} style={{
					flex: 1,
					backgroundColor: backdropColor,
					opacity: backdropOpacity,
				}}/>
			</TouchableWithoutFeedback>
		);
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

		const customBackdrop = this.renderCustomBackdrop({
			backdropColor,
			backdropOpacity,
		});

		return (
			<Modal
				accessible={false}
				style={styles.modal}
				isVisible={showDialogue}
				animationInTiming={entryDuration}
				animationOutTiming={exitDuration}
				hideModalContentWhileAnimating={true}
				onModalShow={this.onModalOpened}
				supportedOrientations={['portrait', 'landscape']}
				customBackdrop={customBackdrop}>
				<View
					level={2}
					style={[styles.container, style]}>
					{!!showHeader && this.renderHeader(styles)}
					{this.renderBody(styles)}
					{this.renderFooter(styles)}
				</View>
			</Modal>
		);
	}

	getStyles(): Object {
		const {
			appLayout,
			negTextColor,
			posTextColor,
			colors,
			negTextColorLevel,
			posTextColorLevel,
		} = this.props;
		const { width, height } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			fontSizeFactorTwelve,
		} = Theme.Core;

		const fontSizeHeader = Math.floor(deviceWidth * 0.046);
		const fontSize = Math.floor(deviceWidth * fontSizeFactorTwelve);

		const headerWidth = Math.ceil(deviceWidth * 0.75);
		const headerHeight = Math.ceil(deviceWidth * 0.12);
		const borderRadi = 5;

		const {
			inAppBrandSecondary,
			dialogueBoxNegativeTextColor,
		} = colors;

		const _negTextColor = negTextColor || dialogueBoxNegativeTextColor;
		const _posTextColor = posTextColor || inAppBrandSecondary;

		return {
			modal: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			container: {
				flex: 0,
				alignItems: 'stretch',
				justifyContent: 'space-between',
				borderRadius: borderRadi,
				overflow: 'hidden',
			},
			headerWidth,
			headerHeight,
			notificationModalHeaderText: {
				color: '#ffffff',
				fontSize: fontSizeHeader,
				left: 5 + fontSize,
			},
			notificationModalHeaderIcon: {
				color: '#ffffff',
				fontSize: fontSizeHeader,
				right: 5 + fontSize,
			},
			notificationModalBody: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				padding: 5 + fontSize,
				width: deviceWidth * 0.75,
			},
			notificationModalBodyText: {
				fontSize,
			},
			notificationModalFooterDef: {
				alignItems: 'center',
				justifyContent: 'flex-end',
				flexDirection: 'row',
				width: deviceWidth * 0.75,
			},
			notificationModalFooterTextCover: {
				alignItems: 'flex-end',
				justifyContent: 'center',
				paddingLeft: 10,
				paddingBottom: 5 + fontSize,
			},
			notificationModalFooterNegativeText: {
				color: negTextColorLevel ? undefined : _negTextColor,
				fontSize,
				fontWeight: 'bold',
			},
			notificationModalFooterPositiveText: {
				color: posTextColorLevel ? undefined : _posTextColor,
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

export default (connect(mapStateToProps, null)(withTheme(injectIntl(DialogueBox))): Object);

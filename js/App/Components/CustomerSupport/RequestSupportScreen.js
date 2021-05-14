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
	Keyboard,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
const isEqual = require('react-fast-compare');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
	View,
	Text,
	TouchableButton,
	ScrollableNavigationHeaderPoster,
	DropDown,
	MaterialTextInput,
	InfoBlock,
} from '../../../BaseComponents';

import shouldUpdate from '../../Lib/shouldUpdate';
import capitalize from '../../Lib/capitalize';
import {
	createSupportTicketGeneral,
} from '../../Actions/App';
import {
	withTheme,
	PropsThemedComponent,
} from '../HOC/withTheme';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = PropsThemedComponent & {
	byId: Object,
	email: string,
	screenProps: Object,
	currentScreen: string,
	ScreenName: string,

	toggleDialogueBox: (Object) => void,
	onDidMount: Function,
	navigation: Object,
	actions: Object,
};

type State = {
	value: string,
	isLoading: boolean,
	emailValue: string,
	gatewayId?: string,
};

class RequestSupportScreen extends View<Props, State> {
props: Props;

state: State = {
	value: '',
	isLoading: false,
	emailValue: this.props.email,
	gatewayId: undefined,
};

onChangeText: (string) => void;
showDialogue: (string, string) => void;
onSubmitEditing: () => void;
contactSupport: () => void;
onPressPositive: () => void;

onChangeTextEmail: (string) => void;

constructor(props: Props) {
	super(props);

	this.onChangeText = this.onChangeText.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);
	this.contactSupport = this.contactSupport.bind(this);

	this.onChangeTextEmail = this.onChangeTextEmail.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (nextProps.currentScreen === nextProps.ScreenName) {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}
		const screenPropsChange = shouldUpdate(this.props.screenProps, nextProps.screenProps,
			['appLayout', 'screenReaderEnabled']);
		if (screenPropsChange) {
			return true;
		}
		const propsChange = shouldUpdate(this.props, nextProps, ['byId']);
		if (propsChange) {
			return true;
		}
	}
	return false;
}

onChangeTextEmail(emailValue: string) {
	this.setState({
		emailValue,
	});
}

contactSupport() {
	const { actions, screenProps } = this.props;
	const { intl } = screenProps;
	const { formatMessage } = intl;
	const { value, isLoading, emailValue, gatewayId } = this.state;

	const errorH = formatMessage(i18n.errorCannotCreateTicketH);
	const errorB = formatMessage(i18n.errorCannotCreateTicketB, {url: 'support.telldus.com.'});

	Keyboard.dismiss();
	if (!isLoading) {
		this.setState({
			isLoading: true,
		});
		NetInfo.fetch().then((connectionInfo: Object) => {
			const { type } = connectionInfo;
			const ticketData = {
				message: value,
				phoneConnection: type,
				email: emailValue,
			};
			actions.createSupportTicketGeneral(gatewayId, ticketData).then((ticketNum: number) => {
				if (ticketNum && typeof ticketNum === 'number') {
					this.showDialogue(
						formatMessage(i18n.labelSupportTicketCreated),
						formatMessage(i18n.messageSupportTicket, {ticketNum}),
						{
							onPressPositive: this.onPressPositive,
						});
				} else {
					this.showDialogue(errorH, errorB);
				}
				this.setState({
					isLoading: false,
				});
			}).catch((error: Object) => {
				let errMess = errorB;
				if (error.request && error.request.responseText === 'The request timed out.') {
					errMess = formatMessage(i18n.errorTimeoutCannotCreateTicketB, {url: 'support.telldus.com.'});
				}
				this.showDialogue(errorH, errMess);
				this.setState({
					isLoading: false,
				});
			});
		});
	}
}

showDialogue = (header: string, text: string, {
	onPressPositive,
}: Object = {}) => {
	const { screenProps } = this.props;
	const { toggleDialogueBox } = screenProps;

	const dialogueData = {
		show: true,
		showPositive: true,
		header,
		imageHeader: true,
		text,
		showHeader: true,
		closeOnPressPositive: true,
		capitalizeHeader: false,
		onPressPositive,
		timeoutToCallPositive: 200,
	};
	toggleDialogueBox(dialogueData);
}

onPressPositive = () => {
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

onChoosegateway = (value: string, itemIndex: number, data: Array<any>) => {
	const { key: gatewayId } = data[itemIndex];
	this.setState({
		gatewayId,
	});
}

render(testData: Object): Object {
	const {
		screenProps,
		navigation,
		byId,
	} = this.props;
	const {
		intl,
		appLayout,
	} = screenProps;
	const {
		value,
		emailValue,
		isLoading,
		gatewayId,
	} = this.state;
	const {
		container,
		title,
		body,
		label,
		textField,
		baseColorFour,
		button,
		fontSizeText,
		rowTextColor,
		dropDownContainerStyle,
		pickerContainerStyle,
		pickerBaseCoverStyle,
		infoContainer,
		statusIconStyle,
		infoTextStyle,
		textFieldMessage,
		textFieldContainerStyle,
		pickerStyle,
	} = this.getStyles(appLayout);
	const { formatMessage } = intl;

	let LIST = Object.keys(byId).map((gId: string): Object => {
		const { id, name } = byId[gId];
		return {
			key: id,
			value: name,
		};
	});
	const v = formatMessage(i18n.noSpecificGateway);
	const k = 'frank8';
	LIST.push({
		key: k,
		value: v,
	});

	const valueDD = gatewayId && gatewayId !== k ? byId[gatewayId].name : v;

	const descLen = value.trim().length;

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior="padding"
			keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>

			<ScrollableNavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.labelHelpAndSupport))}
				h2={formatMessage(i18n.weCanHelpYou)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}>
				<View
					level={2}
					style={container}>
					<Text style={title}>
						{capitalize(formatMessage(i18n.labelCreateSupportTicket))}
					</Text>
					<Text
						level={25}
						style={body}>
						{formatMessage(i18n.contactSupportDescription)}
					</Text>
					<Text style={label}>
						{formatMessage(i18n.emailAddress)}
					</Text>
					<MaterialTextInput
						value={emailValue}
						style={textField}
						onChangeText={this.onChangeTextEmail}
						autoCapitalize="none"
						autoCorrect={false}
						autoFocus={true}
						baseColor={baseColorFour}
						tintColor={baseColorFour}
						returnKeyType={'done'}
					/>
					<Text style={label}>
						{`${capitalize(formatMessage(i18n.gateway))}`}
					</Text>
					<DropDown
						items={LIST}
						value={valueDD}
						onValueChange={this.onChoosegateway}
						appLayout={appLayout}
						intl={intl}
						dropDownContainerStyle={dropDownContainerStyle}
						pickerStyle={pickerStyle}
						pickerContainerStyle={pickerContainerStyle}
						baseColor={rowTextColor}
						fontSize={fontSizeText}
						accessibilityLabelPrefix={formatMessage(i18n.gateway)}
						textColor={rowTextColor}
						pickerBaseCoverStyle={pickerBaseCoverStyle}
					/>
					<View>
						<Text style={label}>
							{formatMessage(i18n.labelMessage)}
						</Text>
						<MaterialTextInput
							value={value}
							style={[textField, textFieldMessage]}
							containerStyle={textFieldContainerStyle}
							onChangeText={this.onChangeText}
							onSubmitEditing={this.onSubmitEditing}
							autoCapitalize="sentences"
							autoCorrect={false}
							autoFocus={false}
							baseColor={baseColorFour}
							tintColor={baseColorFour}
							returnKeyType={'done'}
							multiline={true}
						/>
					</View>
				</View>
				{descLen < 50 && (
					<InfoBlock
						text={formatMessage(i18n.supportTicketDescriptionInfo)}
						appLayout={appLayout}
						infoContainer={infoContainer}
						textStyle={infoTextStyle}
						infoIconStyle={statusIconStyle}/>
				)}
				<TouchableButton
					text={i18n.labelSend}
					style={button}
					onPress={this.contactSupport}
					disabled={isLoading || descLen < 50}
					showThrobber={isLoading}/>
			</ScrollableNavigationHeaderPoster>
		</KeyboardAvoidingView>
	);
}

getStyles(appLayout: Object): Object {
	const {
		colors,
	} = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		shadow,
		paddingFactor,
		rowTextColor,
		eulaContentColor,
		fontSizeFactorFive,
		fontSizeFactorEight,
		fontSizeFactorNine,
		fontSizeFactorTen,
		fontSizeFactorEleven,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * fontSizeFactorEight;
	const fontSizeTitle = deviceWidth * fontSizeFactorFive;
	const fontSizeBody = deviceWidth * fontSizeFactorTen;
	const fontSizeLabel = deviceWidth * fontSizeFactorEleven;

	const {
		baseColorFour,
	} = colors;

	return {
		baseColorFour,
		rowTextColor,
		container: {
			...shadow,
			marginVertical: padding,
			padding: padding * 2,
			marginHorizontal: padding,
			marginTop: padding * 2,
			borderRadius: 2,
		},
		title: {
			color: baseColorFour,
			fontSize: fontSizeTitle,
			alignSelf: 'center',
		},
		body: {
			fontSize: fontSizeBody,
			marginTop: 10,
		},
		label: {
			color: baseColorFour,
			fontSize: fontSizeLabel,
			marginTop: 22,
		},
		textFieldContainerStyle: {
			height: fontSizeText * 8,
			width: '100%',
			justifyContent: 'flex-end',
		},
		textFieldMessage: {
			height: fontSizeText * 8,
			textAlignVertical: 'top',
		},
		textField: {
			width: '100%',
			color: '#A59F9A',
			fontSize: fontSizeText,
			marginTop: 4,
		},
		button: {
			marginVertical: padding * 1.5,
		},
		dropDownContainerStyle: {
			marginTop: 8,
			marginBottom: fontSizeText / 2,
		},
		pickerStyle: {
		},
		pickerBaseCoverStyle: {
			padding: 0,
		},
		pickerContainerStyle: {
			elevation: 0,
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
			backgroundColor: 'transparent',
		},
		fontSizeText,
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			marginBottom: padding,
			marginHorizontal: padding,
			padding: padding,
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * fontSizeFactorNine,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: fontSizeBody,
			color: eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: padding,
		},
	};
}
}

const mapStateToProps = (store: Object, ownProps: Object): Object => {

	const { userProfile = {} } = store.user;
	const { email } = userProfile;

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		byId: store.gateways.byId,
		email,
		currentScreen,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				createSupportTicketGeneral,
			}, dispatch),
		},
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(withTheme(RequestSupportScreen)): Object);

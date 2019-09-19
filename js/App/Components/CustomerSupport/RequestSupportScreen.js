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
	Keyboard,
	ScrollView,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
const isEqual = require('react-fast-compare');
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
	View,
	Text,
	TouchableButton,
	NavigationHeaderPoster,
	DropDown,
} from '../../../BaseComponents';

import shouldUpdate from '../../Lib/shouldUpdate';
import capitalize from '../../Lib/capitalize';
import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';
import {
	createSupportTicketGlobal,
} from '../../Actions/App';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	byId: Object,
	email: string,
	screenProps: Object,

	toggleDialogueBox: (Object) => void,
	onDidMount: Function,
	navigation: Object,
	actions: Object,
};

type State = {
	value: string,
	routerValue: string,
	isLoading: boolean,
	emailValue: string,
	gatewayId?: string,
};

class RequestSupportScreen extends View<Props, State> {
props: Props;

state: State = {
	value: '',
	isLoading: false,
	routerValue: '',
	emailValue: this.props.email,
	gatewayId: undefined,
};

onChangeText: (string) => void;
showDialogue: (string, string) => void;
onSubmitEditing: () => void;
contactSupport: () => void;
onPressPositive: () => void;

onChangeTextRouter: (string) => void;
onChangeTextEmail: (string) => void;

constructor(props: Props) {
	super(props);

	this.onChangeText = this.onChangeText.bind(this);
	this.showDialogue = this.showDialogue.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);
	this.contactSupport = this.contactSupport.bind(this);
	this.onPressPositive = this.onPressPositive.bind(this);

	const { formatMessage } = this.props.screenProps.intl;

	this.h1 = formatMessage(i18n.labelLocalControl);
	this.h2 = formatMessage(i18n.labelContactSupport);

	this.onChangeTextRouter = this.onChangeTextRouter.bind(this);
	this.onChangeTextEmail = this.onChangeTextEmail.bind(this);
}

componentDidMount() {
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}
	const screenPropsChange = shouldUpdate(this.props.screenProps, nextProps.screenProps,
		['appLayout', 'currentScreen', 'screenReaderEnabled']);
	if (screenPropsChange) {
		return true;
	}
	const propsChange = shouldUpdate(this.props, nextProps, ['byId']);
	if (propsChange) {
		return true;
	}
	return false;
}

onChangeTextRouter(routerValue: string) {
	this.setState({
		routerValue,
	});
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
	const { value, isLoading, routerValue, emailValue, gatewayId } = this.state;

	const errorH = formatMessage(i18n.errorCannotCreateTicketH);
	const errorB = formatMessage(i18n.errorCannotCreateTicketB, {url: 'support.telldus.com.'});

	Keyboard.dismiss();
	if (!isLoading) {
		this.setState({
			isLoading: true,
		});
		NetInfo.getConnectionInfo().then((connectionInfo: Object) => {
			const { type, effectiveType } = connectionInfo;

			const failedTests = 0;
			const testCount = 0;
			const ticketData = {
				message: value,
				failedTests,
				router: routerValue,
				email: emailValue,
				connectionType: type,
				connectionEffectiveType: effectiveType,
				testCount,
			};
			actions.createSupportTicketGlobal(gatewayId, ticketData).then((ticketNum: number) => {
				if (ticketNum && typeof ticketNum === 'number') {
					this.showDialogue(formatMessage(i18n.labelSupportTicketCreated), formatMessage(i18n.messageSupportTicket, {ticketNum}));
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
		timeoutToCallPositive: 200,
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
		brandSecondary,
		button,
		fontSizeText,
		rowTextColor,
		dropDownContainerStyle,
		pickerContainerStyle,
		scrollView,
		pickerBaseCoverStyle,
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

	return (
		<ScrollView style={scrollView}>
			<NavigationHeaderPoster
				h1={formatMessage(i18n.labelHelpAndSupport)} h2={formatMessage(i18n.weCanHelpYou)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<View style={container}>
				<Text style={title}>
					{capitalizeFirstLetterOfEachWord(formatMessage(i18n.labelCreateSupportTicket))}
				</Text>
				<Text style={body}>
					{formatMessage(i18n.contactSupportDescription)}
				</Text>
				<Text style={label}>
					{formatMessage(i18n.emailAddress)}
				</Text>
				<TextInput
					value={emailValue}
					style={textField}
					onChangeText={this.onChangeTextEmail}
					autoCapitalize="none"
					autoCorrect={false}
					autoFocus={false}
					underlineColorAndroid={brandSecondary}
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
					dropDownContainerStyle={dropDownContainerStyle}
					pickerContainerStyle={pickerContainerStyle}
					baseColor={rowTextColor}
					fontSize={fontSizeText}
					accessibilityLabelPrefix={formatMessage(i18n.gateway)}
					textColor={rowTextColor}
					pickerBaseCoverStyle={pickerBaseCoverStyle}
				/>
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
			</View>
			<TouchableButton
				text={i18n.labelSend}
				style={button}
				onPress={this.contactSupport}
				disabled={isLoading}
				showThrobber={isLoading}/>
		</ScrollView>
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
		rowTextColor,
		scrollView: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		container: {
			backgroundColor: '#fff',
			...shadow,
			marginVertical: padding,
			padding: padding * 2,
			marginHorizontal: padding,
			marginTop: padding * 2,
			borderRadius: 2,
		},
		title: {
			color: brandSecondary,
			fontSize: fontSizeTitle,
			alignSelf: 'center',
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
			marginVertical: padding * 1.5,
		},
		dropDownContainerStyle: {
			marginTop: 8,
			marginBottom: fontSizeText / 2,
		},
		pickerBaseCoverStyle: {
			padding: 0,
			paddingVertical: 8,
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
			backgroundColor: '#fff',
		},
		fontSizeText,
	};
}
}

const mapStateToProps = (store: Object, ownProps: Object): Object => {

	const { userProfile = {} } = store.user;
	const { email } = userProfile;

	return {
		byId: store.gateways.byId,
		email,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				createSupportTicketGlobal,
			}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(RequestSupportScreen);

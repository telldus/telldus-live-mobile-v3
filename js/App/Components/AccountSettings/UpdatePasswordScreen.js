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
 */

// @flow

'use strict';

import React, { useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	TouchableButton,
} from '../../../BaseComponents';
import {
	changePassword,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const UpdatePasswordScreen = (props: Object): Object => {
	const {
		screenProps: {toggleDialogueBox, ...others },
		navigation,
		textFieldStyleCurrent,
		textFieldStyleNew,
		textFieldStyleConfirm,
	} = props;
	const { app: {layout} } = useSelector((state: Object): Object => state);

	const { formatMessage } = useIntl();

	const [ loadingAndChangePassStatus, setLoadingAndChangePassStatus ] = useState({
		isLoading: false,
		changePassWordSuccess: false,
	});
	const {
		isLoading,
	} = loadingAndChangePassStatus;
	const [ currentPas, setCurrentPas ] = useState('');
	const [ newPass, setNewPass ] = useState('');
	const [ newPassConf, setNewPassConf ] = useState('');

	const {
		container,
		body,
		textFieldStyle,
		titleStyle,
		bodyStyle,
		currentLabelStyle,
		buttonStyle,
	} = getStyles(layout);

	const dispatch = useDispatch();
	function onSubmit() {
		if (currentPas.trim() === '' || newPass.trim() === '' || newPassConf.trim() === '') {
			let postScript = 'confirm password';
			if (newPass.trim() === '') {
				postScript = 'new password';
			}
			if (currentPas.trim() === '') {
				postScript = 'current password';
			}
			const message = `${postScript} ${formatMessage(i18n.fieldEmptyPostfix)}`;
			showDialogue(message);
			return;
		}
		if (newPass !== newPassConf) {
			showDialogue('confirm password does not match the new password.');
			return;
		}
		setLoadingAndChangePassStatus({
			isLoading: true,
			changePassWordSuccess: false,
		});
		dispatch(changePassword(currentPas, newPass)).then(() => {
			// TODO: translate
			dispatch(showToast('Password has been changed successfully.'));
			props.navigation.goBack();
		}).catch((err: any) => {
			// TODO: translate
			const defaultMessage = 'Sorry something went wrong while changing the password. Please try later.';
			dispatch(showToast(err.message || defaultMessage));
			setLoadingAndChangePassStatus({
				isLoading: false,
				changePassWordSuccess: false,
			});
		});
	}

	function showDialogue(message: string) {
		toggleDialogueBox({
			show: true,
			showHeader: true,
			text: message, // TODO: translate
			showPositive: true,
			closeOnPressPositive: true,
		});
	}

	function onChangeTextCurrent(text: string) {
		setCurrentPas(text);
	}

	function onChangeTextNew(text: string) {
		setNewPass(text);
	}

	function onChangeTextConf(text: string) {
		setNewPassConf(text);
	}

	return (
<>
<NavigationHeaderPoster
	h1={'Change password'} h2={'Enter new password below'}
	align={'right'}
	showLeftIcon={true}
	leftIcon={'close'}
	navigation={navigation}
	{...others}/>
<ScrollView style={container}>
	<View style={body}>
		<Text style={titleStyle}>
            Change Password
		</Text>
		<Text style={bodyStyle}>
            Please confirm your current password below and enter the new password that you would like to change to.
		</Text>
		<Text style={currentLabelStyle}>
           Current password
		</Text>
		<TextInput
			value={currentPas}
			style={[textFieldStyle, textFieldStyleCurrent]}
			onChangeText={onChangeTextCurrent}
			autoCorrect={false}
			autoFocus={true}
			underlineColorAndroid={Theme.Core.brandSecondary}
			returnKeyType={'done'}
			secureTextEntry={true}
		/>
		<TextInput
			value={newPass}
			style={[textFieldStyle, textFieldStyleNew]}
			onChangeText={onChangeTextNew}
			autoCorrect={false}
			autoFocus={false}
			underlineColorAndroid={Theme.Core.inactiveGray}
			returnKeyType={'done'}
			placeholder={'New password'}
			placeholderTextColor={Theme.Core.inactiveGray}
			secureTextEntry={true}
		/>
		<TextInput
			value={newPassConf}
			style={[textFieldStyle, textFieldStyleConfirm]}
			onChangeText={onChangeTextConf}
			autoCorrect={false}
			autoFocus={false}
			underlineColorAndroid={Theme.Core.inactiveGray}
			returnKeyType={'done'}
			placeholder={'Confirm new password'}
			placeholderTextColor={Theme.Core.inactiveGray}
			secureTextEntry={true}
		/>
	</View>
	<TouchableButton
		onPress={onSubmit}
		text={isLoading ? 'Sending...' : 'Change password'}
		postScript={isLoading ? '...' : null}
		accessible={true}
		style={buttonStyle}
	/>
</ScrollView>
</>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.04);

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 0,
			padding: padding * 2,
			alignItems: 'center',
			justifyContent: 'center',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			backgroundColor: '#fff',
		},
		titleStyle: {
			fontSize: fontSize * 1.6,
			color: Theme.Core.brandSecondary,
		},
		bodyStyle: {
			fontSize,
			color: Theme.Core.rowTextColor,
			marginTop: 20,
		},
		textFieldStyle: {
			fontSize: fontSize * 1.3,
			marginTop: 20,
			width: '100%',
			color: '#000',
		},
		currentLabelStyle: {
			alignSelf: 'flex-start',
			color: Theme.Core.brandSecondary,
			fontSize,
			marginTop: 20,
		},
		buttonStyle: {
			marginBottom: padding * 2,
		},
	};
};

export default UpdatePasswordScreen;

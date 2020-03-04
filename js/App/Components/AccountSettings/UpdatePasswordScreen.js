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
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	TouchableButton,
	MaterialTextInput,
} from '../../../BaseComponents';
import {
	changePassword,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';

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
			let postF = formatMessage(i18n.fieldEmptyPostfix);
			let preS = formatMessage(i18n.newPasswordConfirm);
			if (newPass.trim() === '') {
				preS = formatMessage(i18n.newPassword);
			}
			if (currentPas.trim() === '') {
				preS = formatMessage(i18n.currentPassword);
			}
			const message = `${preS} ${postF}`;
			showDialogue(message);
			return;
		}
		if (newPass !== newPassConf) {
			showDialogue(formatMessage(i18n.errorPassWordNotSame));
			return;
		}
		setLoadingAndChangePassStatus({
			isLoading: true,
			changePassWordSuccess: false,
		});
		dispatch(changePassword(currentPas, newPass)).then(() => {
			dispatch(showToast(formatMessage(i18n.successPassUpdate)));
			props.navigation.goBack();
		}).catch((err: any) => {
			const defaultMessage = formatMessage(i18n.errorPassUpdate);
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
			text: message,
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
				h1={capitalizeFirstLetterOfEachWord(formatMessage(i18n.changePassword))} h2={formatMessage(i18n.enterNewPassBelow)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...others}/>
			<ScrollView style={container}>
				<View style={body}>
					<Text style={titleStyle}>
						{capitalizeFirstLetterOfEachWord(formatMessage(i18n.changePassword))}
					</Text>
					<Text style={bodyStyle}>
						{formatMessage(i18n.changePassDescription)}
					</Text>
					<Text style={currentLabelStyle}>
						{formatMessage(i18n.currentPassword)}
					</Text>
					<MaterialTextInput
						value={currentPas}
						style={[textFieldStyle, textFieldStyleCurrent]}
						onChangeText={onChangeTextCurrent}
						autoCorrect={false}
						autoFocus={true}
						baseColor={Theme.Core.brandSecondary}
						tintColor={Theme.Core.brandSecondary}
						returnKeyType={'done'}
						secureTextEntry={true}
					/>
					<MaterialTextInput
						value={newPass}
						style={[textFieldStyle, textFieldStyleNew]}
						onChangeText={onChangeTextNew}
						autoCorrect={false}
						autoFocus={false}
						baseColor={Theme.Core.inactiveGray}
						tintColor={Theme.Core.inactiveGray}
						returnKeyType={'done'}
						placeholder={formatMessage(i18n.newPassword)}
						placeholderTextColor={Theme.Core.inactiveGray}
						secureTextEntry={true}
					/>
					<MaterialTextInput
						value={newPassConf}
						style={[textFieldStyle, textFieldStyleConfirm]}
						onChangeText={onChangeTextConf}
						autoCorrect={false}
						autoFocus={false}
						baseColor={Theme.Core.inactiveGray}
						tintColor={Theme.Core.inactiveGray}
						returnKeyType={'done'}
						placeholder={formatMessage(i18n.newPasswordConfirm)}
						placeholderTextColor={Theme.Core.inactiveGray}
						secureTextEntry={true}
					/>
				</View>
				<TouchableButton
					onPress={onSubmit}
					text={isLoading ? `${formatMessage(i18n.labelSending)}...` : formatMessage(i18n.changePassword)}
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
			marginTop: 16,
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

export default React.memo<Object>(UpdatePasswordScreen);

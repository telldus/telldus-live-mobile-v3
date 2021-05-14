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

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	TouchableButton,
	MaterialTextInput,
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	changePassword,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import capitalize from '../../Lib/capitalize';
import {
	useAppTheme,
} from '../../Hooks/Theme';

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

	const {
		colors,
	} = useAppTheme();
	const {
		baseColorFour,
	} = colors;

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
	} = getStyles({
		colors,
		layout,
	});

	const dispatch = useDispatch();
	const onSubmit = useCallback((): Function => {
		function onSubmitCallback() {
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
		onSubmitCallback();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPas, newPass, newPassConf]);

	function showDialogue(message: string) {
		toggleDialogueBox({
			show: true,
			showHeader: true,
			text: message,
			showPositive: true,
			closeOnPressPositive: true,
		});
	}

	const onChangeTextCurrent = useCallback((text: string) => {
		setCurrentPas(text);
	}, []);

	const onChangeTextNew = useCallback((text: string): Function => {
		setNewPass(text);
	}, []);

	const onChangeTextConf = useCallback((text: string): Function => {
		setNewPassConf(text);
	}, []);

	return (
		<>
			<NavigationHeaderPoster
				h1={capitalize(formatMessage(i18n.changePassword))} h2={formatMessage(i18n.enterNewPassBelow)}
				align={'left'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...others}/>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={2}
					style={body}>
					<Text style={titleStyle}>
						{capitalize(formatMessage(i18n.changePassword))}
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
						baseColor={baseColorFour}
						tintColor={baseColorFour}
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
			</ThemedScrollView>
		</>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	const {
		textThree,
		baseColorFour,
	} = colors;

	return {
		container: {
			flex: 1,
		},
		body: {
			flex: 0,
			padding: padding * 2,
			alignItems: 'center',
			justifyContent: 'center',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
		},
		titleStyle: {
			fontSize: fontSize * 1.6,
			color: baseColorFour,
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
			color: textThree,
		},
		currentLabelStyle: {
			alignSelf: 'flex-start',
			color: baseColorFour,
			fontSize,
			marginTop: 20,
		},
		buttonStyle: {
			marginBottom: padding * 2,
		},
	};
};

export default (React.memo<Object>(UpdatePasswordScreen): Object);

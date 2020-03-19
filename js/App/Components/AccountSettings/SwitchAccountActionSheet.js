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

import React from 'react';
import {
	StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
const gravatar = require('gravatar-api');
import { RadioButtonInput } from 'react-native-simple-radio-button';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	ActionSheet,
	Image,
	Throbber,
	EmptyView,
	RippleButton,
	CachedImage,
} from '../../../BaseComponents';
import Theme from '../../Theme';

import {
	onSwitchAccount,
	getUserProfile,
	unregisterPushToken,
	logoutSelectedFromTelldus,
	showToast,
} from '../../Actions';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	navigate,
} from '../../Lib/NavigationService';

import i18n from '../../Translations/common';

const SwitchAccountActionSheet = (props: Object, ref: Object): Object => {
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		accounts = {},
		userId = '',
		pushToken,
	} = useSelector((state: Object): Object => state.user);

	const intl = useIntl();

	const actionSheetRef = React.useRef();

	function showActionSheet() {
		if (actionSheetRef.current) {
			actionSheetRef.current.show();
		}
	}

	React.useImperativeHandle(ref, (): Object => ({
		show: () => {
			showActionSheet();
		},
	}));

	const dispatch = useDispatch();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const [ showAddNewAccount, setShowAddNewAccount ] = React.useState(false);
	const [ switchingId, setSwitchingId ] = React.useState(null);
	const [ isLoggingOut, setIsLoggingOut ] = React.useState(false);

	const {
		formatMessage,
	} = intl;

	const {
		actionSheetTitle,
		actionSheetTitleCover,
		actionSheetOverlay,
		actionSheetTitleBox,
		actionSheetMessageBox,
		actionSheetButtonBox,
		actionSheetButtonOne,
		actionSheetButtonTwo,
		actionSheetButtonOneCover,
		actionSheetButtonTwoCover,
		actionSheetButtonAccCover,
		actionSheetButtonAccText,
		addIconStyle,
		addIconCoverStyle,
		gravatarStyle,
		brandSecondary,
		rbSize,
		rbOuterSize,
		throbberContainerStyle,
		throbberStyle,
		actionSheetButtonAccEmailText,
		actionSheetTextCover,
	} = getStyles(layout, {
		showAddNewAccount,
		isLoggingOut,
	});

	function closeActionSheet(index?: number, callback?: Function) {
		if (actionSheetRef.current) {
			actionSheetRef.current.hide(index, callback);
		}
	}

	function onSelectActionSheet(index: number) {
		if (switchingId) {
			return;
		}
		if (showAddNewAccount) {
			setShowAddNewAccount(false);
			if (index === 0) {
				navigate('LoginScreen');
			} else if (index === 1) {
				navigate('RegisterScreen');
			}
		} else {
			const addNewIndex = Object.keys(accounts).length;
			if (index === addNewIndex) {
				setShowAddNewAccount(true);
				if (actionSheetRef.current) {
					actionSheetRef.current.show();
				}
			} else {
				if (index === -1) {
					setIsLoggingOut(false);
				}
				let userIdKey = Object.keys(accounts)[index];
				if (userIdKey) {
					userIdKey = userIdKey.trim().toLowerCase();
					setSwitchingId(userIdKey);
					const {
						accessToken,
					} = accounts[userIdKey];

					dispatch(getUserProfile(accessToken, true, false)).then((res: Object = {}) => {
						closeActionSheet(undefined, () => {
							// Timeout required to wait for the actions sheet modal to close compeletly. Else toast will disappear
							setTimeout(() => {
								const messageOnSuccesSwitch = `Switched to ${res.firstname} ${res.lastname}`;
								dispatch(showToast(messageOnSuccesSwitch));
							}, 200);
						});
						setSwitchingId(null);
						dispatch(onSwitchAccount({
							userId: userIdKey,
						}));

						if (isLoggingOut) {
							dispatch(unregisterPushToken(pushToken));
							setIsLoggingOut(false);
							dispatch(logoutSelectedFromTelldus({
								userId,
							}));
						}
					}).catch((err: Object) => {
						closeActionSheet();
						setSwitchingId(null);
						setIsLoggingOut(false);
						toggleDialogueBoxState({
							show: true,
							showHeader: true,
							imageHeader: true,
							text: err.message || formatMessage(i18n.unknownError),
							showPositive: true,
						});
					});
				}
			}
		}
	}

	let ACCOUNTS = [];
	const disabledButtonIndexes = [];
	Object.keys(accounts).map((un: string, index: number) => {
		if (!showAddNewAccount) {
			disabledButtonIndexes.push(index);
		}
		const {
			email,
			firstname = '',
			lastname = '',
			accessToken = {},
		} = accounts[un];
		const nameInfo = `${firstname} ${lastname}`;

		let options = {
			email,
			parameters: { 'size': '200', 'd': 'mm' },
			secure: true,
		};
		let avatar = gravatar.imageUrl(options);

		const uid = accessToken.userId || '';
		const isSelected = uid.trim().toLowerCase() === userId.trim().toLowerCase();

		function onPressRB() {
			if (isSelected) {
				return;
			}
			onSelectActionSheet(index);
		}
		if (isLoggingOut && isSelected) {
			return;
		}
		ACCOUNTS.push(
			<RippleButton onPress={onPressRB} style={actionSheetButtonAccCover}>
				<CachedImage
					resizeMode={'cover'}
					useQueryParamsInCacheKey={true}
					sourceImg={avatar}
					style={gravatarStyle}/>
				<View style={actionSheetTextCover}>
					<Text style={actionSheetButtonAccText}>
						{nameInfo.trim()}
					</Text>
					<Text style={actionSheetButtonAccEmailText}>
						{email}
					</Text>
				</View>
				{
					switchingId === uid.trim().toLowerCase() ?
						<Throbber
							throbberContainerStyle={throbberContainerStyle}
							throbberStyle={throbberStyle}/>
						:
						isLoggingOut ?
							<EmptyView/>
							:
							<RadioButtonInput
								isSelected={isSelected}
								buttonSize={rbSize}
								buttonOuterSize={rbOuterSize}
								borderWidth={3}
								buttonInnerColor={brandSecondary}
								buttonOuterColor={brandSecondary}
								onPress={onPressRB}
								obj={{userId: accessToken.userId}}
								index={index}/>
				}
			</RippleButton>
		);
	});

	const moreButtons = isLoggingOut ? []
		:
		[<View style={actionSheetButtonAccCover}>
			<View style={addIconCoverStyle}>
				<Image source={{uri: 'icon_plus'}} style={addIconStyle}/>
			</View>
			<Text style={actionSheetButtonAccText}>
	Add Account
			</Text>
		</View>];

	return (
		<ActionSheet
			ref={actionSheetRef}
			extraData={{
				showAddNewAccount,
				items: Object.keys(accounts),
				isLoggingOut,
			}}
			disabledButtonIndexes={disabledButtonIndexes}
			styles={{
				overlay: actionSheetOverlay,
				body: actionSheetOverlay,
				titleBox: actionSheetTitleBox,
				messageBox: actionSheetMessageBox,
				buttonBox: actionSheetButtonBox,
			}}
			title={showAddNewAccount ?
				<View style={actionSheetTitleCover}>
					<Text style={actionSheetTitle} onPress={closeActionSheet}>
							Add Account
					</Text>
				</View>
				:
				isLoggingOut ?
					<View style={actionSheetTitleCover}>
						<Text style={actionSheetTitle} onPress={closeActionSheet}>
							Choose account to switch to
						</Text>
					</View>
					:
					undefined
			}
			options={showAddNewAccount ?
				[
					<View style={actionSheetButtonOneCover}>
						<Text style={actionSheetButtonOne}>
							Log Into Existing Account
						</Text>
					</View>,
					<View style={actionSheetButtonTwoCover}>
						<Text style={actionSheetButtonTwo}>
						Create New Account
						</Text>
					</View>,
				]
				:
				[
					...ACCOUNTS,
					...moreButtons,
				]
			}
			onPress={onSelectActionSheet}/>
	);
};

const getStyles = (appLayout: Object, {showAddNewAccount, isLoggingOut}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		brandSecondary,
		rowTextColor,
		eulaContentColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);
	const fontSizeActionSheetTitle = Math.floor(deviceWidth * 0.05);

	const addIconSize = Math.floor(deviceWidth * 0.07);
	const addIconCoverSize = addIconSize + 15;

	const butBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSize * 2.2) + (padding * 2) : addIconCoverSize * 2;
	const titleBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSizeActionSheetTitle * 3) + 8 : undefined;

	const rbOuterSize = Math.floor(deviceWidth * 0.055);
	const rbSize = rbOuterSize * 0.5;

	return {
		rbOuterSize,
		rbSize,
		brandSecondary,
		actionSheetOverlay: {
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8,
			overflow: 'hidden',
		},
		actionSheetTitleCover: {
			paddingHorizontal: padding,
		},
		actionSheetTitle: {
			fontSize: fontSizeActionSheetTitle,
			color: '#000',
		},
		actionSheetMessageBox: {
			height: undefined,
		},
		actionSheetButtonBox: {
			height: butBoxHeight,
			paddingHorizontal: padding,
			alignItems: 'stretch',
			justifyContent: 'center',
			backgroundColor: '#fff',
		},
		actionSheetTitleBox: {
			height: titleBoxHeight,
			marginBottom: StyleSheet.hairlineWidth,
		},
		actionSheetButtonOneCover: {
			flex: 1,
			backgroundColor: brandSecondary,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 8,
			marginTop: 8,
		},
		actionSheetButtonTwoCover: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
		},
		actionSheetButtonOne: {
			fontSize,
			color: '#fff',
			textAlignVertical: 'center',
			textAlign: 'center',
		},
		actionSheetButtonTwo: {
			fontSize,
			color: brandSecondary,
			textAlignVertical: 'center',
			textAlign: 'center',
		},
		actionSheetButtonAccCover: {
			padding,
			flexDirection: 'row',
			alignItems: 'center',
		},
		actionSheetButtonAccText: {
			fontSize,
			color: '#000',
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
			flex: 1,
			fontWeight: 'bold',
		},
		actionSheetButtonAccEmailText: {
			fontSize: fontSize * 0.9,
			color: '#000',
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
		},
		actionSheetTextCover: {
			flex: 1,
			alignItems: 'flex-start',
			justifyContent: 'center',
		},
		addIconCoverStyle: {
			borderRadius: addIconCoverSize / 2,
			height: addIconCoverSize,
			width: addIconCoverSize,
			borderWidth: 0.5,
			borderColor: rowTextColor,
			alignItems: 'center',
			justifyContent: 'center',
		},
		gravatarStyle: {
			borderRadius: addIconCoverSize / 2,
			height: addIconCoverSize,
			width: addIconCoverSize,
			borderWidth: 0.5,
			borderColor: rowTextColor,
		},
		addIconStyle: {
			height: addIconSize,
			width: addIconSize,
			tintColor: eulaContentColor,
		},
		throbberContainerStyle: {
			backgroundColor: 'transparent',
			position: 'relative',
		},
		throbberStyle: {
			fontSize: rbOuterSize,
			color: brandSecondary,
		},
	};
};

export default React.memo<Object>(React.forwardRef<Object, Object>(SwitchAccountActionSheet));

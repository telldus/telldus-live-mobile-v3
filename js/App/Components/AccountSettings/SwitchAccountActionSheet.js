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

import React, {
	useCallback,
	useMemo,
} from 'react';
import {
	StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
const gravatar = require('gravatar-api');
import { RadioButtonInput } from 'react-native-simple-radio-button';
import { useIntl } from 'react-intl';
import orderBy from 'lodash/orderBy';

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
	toggleVisibilitySwitchAccountAS,
} from '../../Actions';
import capitalize from '../../Lib/capitalize';

import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';
import {
	navigate,
} from '../../Lib/NavigationService';
import {
	useAppTheme,
} from '../../Hooks/Theme';
import {
	useNonHiddenMainTabs,
} from '../../Hooks/Navigation';

import i18n from '../../Translations/common';

const SwitchAccountActionSheet = (props: Object, ref: Object): Object => {

	const {
		colors,
	} = useAppTheme();
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		accounts: _accounts = {},
		userId,
		pushToken,
		switchAccountConf = {},
	} = useSelector((state: Object): Object => state.user);
	const {
		accounts,
		actionSheetItems,
	 } = useMemo((): Object => {
		const one = orderBy(_accounts, [(item: Object): any => {
			const {
				firstname = '',
				lastname = '',
				email,
			} = item;
			const nameInfo = `${firstname} ${lastname}`;
			return `${nameInfo} ${email}`;
		}], ['asc']);
		const two = one.map((o: Object): string => (o && o.accessToken) ? o.accessToken.userId : '');
		return {
			accounts: one,
			actionSheetItems: two,
		};
	}, [_accounts]);

	const {
		isLoggingOut = false,
	} = switchAccountConf;

	const intl = useIntl();

	const actionSheetRef: Object = React.useRef();

	const {
		firstVisibleTab,
	} = useNonHiddenMainTabs();

	function showActionSheet() {
		if (actionSheetRef.current) {
			actionSheetRef.current.show();
		}
	}

	function closeActionSheet(index?: number, callback?: Function) {
		if (actionSheetRef.current) {
			actionSheetRef.current.hide(index, () => {
				if (callback) {
					callback();
					dispatch(toggleVisibilitySwitchAccountAS({
						showAS: false,
						isLoggingOut: false,
					}));
				}
			});
		}
	}

	React.useImperativeHandle(ref, (): Object => ({
		show: () => {
			showActionSheet();
		},
		close: () => {
			showActionSheet();
		},
	}));

	const dispatch = useDispatch();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const [ showAddNewAccount, setShowAddNewAccount ] = React.useState(false);
	const [ switchingId, setSwitchingId ] = React.useState(null);

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
		inAppBrandSecondary,
		rbSize,
		rbOuterSize,
		throbberContainerStyle,
		throbberStyle,
		actionSheetButtonAccEmailText,
		actionSheetTextCover,
		containerStyle,
	} = getStyles(layout, {
		showAddNewAccount,
		isLoggingOut,
		colors,
	});

	const onSelectActionSheet = useCallback((index: number) => {
		if (switchingId) {
			return;
		}
		if (showAddNewAccount) {
			dispatch(toggleVisibilitySwitchAccountAS({
				showAS: false,
				isLoggingOut: false,
			}));
			setShowAddNewAccount(false);
			if (index === 0) {
				navigate('LoginScreen', {
					isSwitchingAccount: true,
				});
			} else if (index === 1) {
				navigate('RegisterScreen');
			}
		} else {
			const addNewIndex = accounts.length;
			if (index === addNewIndex) {
				setShowAddNewAccount(true);
				if (actionSheetRef.current) {
					actionSheetRef.current.show();
				}
			} else {
				if (index === -1) {
					dispatch(toggleVisibilitySwitchAccountAS({
						showAS: false,
						isLoggingOut: false,
					}));
				}
				let account = accounts[index];
				if (account && account.accessToken) {
					const {
						accessToken,
					} = account;
					let { userId: _userId } = accessToken;
					setSwitchingId(_userId);

					dispatch(getUserProfile(accessToken, {
						cancelAllPending: true,
						activeAccount: false,
						performPostSuccess: true,
					})).then((res: Object = {}) => {
						closeActionSheet(undefined, () => {
							// Timeout required to wait for the actions sheet modal to close compeletly. Else toast will disappear
							setTimeout(() => {
								const messageOnSuccesSwitch = formatMessage(i18n.switchedToAccount, {
									value: `${res.firstname} ${res.lastname}`,
								});
								dispatch(showToast(messageOnSuccesSwitch));
							}, 200);
						});
						setSwitchingId(null);
						dispatch(onSwitchAccount({
							userId: _userId,
						}));

						if (isLoggingOut) {
							dispatch(unregisterPushToken(pushToken));
							dispatch(logoutSelectedFromTelldus({
								userId,
							}));
						}
						navigate('Tabs', {
							screen: firstVisibleTab,
						});
					}).catch((err: Object) => {
						closeActionSheet();
						setSwitchingId(null);
						toggleDialogueBoxState({
							show: true,
							showHeader: true,
							imageHeader: true,
							text: err.message || formatMessage(i18n.unknownError),
							showPositive: true,
						});
					});
				} else {
					closeActionSheet();
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		accounts,
		isLoggingOut,
		pushToken,
		showAddNewAccount,
		switchingId,
		userId,
		firstVisibleTab,
	]);

	let ACCOUNTS = [];
	const disabledButtonIndexes = [];
	accounts.map((account: Object, index: number) => {
		if (!showAddNewAccount) {
			disabledButtonIndexes.push(index);
		}
		const {
			email,
			firstname = '',
			lastname = '',
			accessToken = {},
		} = account;
		const nameInfo = `${firstname} ${lastname}`;

		let options = {
			email,
			parameters: { 'size': '200', 'd': 'mm' },
			secure: true,
		};
		let avatar = gravatar.imageUrl(options);

		const uid = accessToken.userId;
		const isSelected = uid === userId;

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
					switchingId === uid ?
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
								buttonInnerColor={inAppBrandSecondary}
								buttonOuterColor={inAppBrandSecondary}
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
				{capitalize(formatMessage(i18n.addAccount))}
			</Text>
		</View>];

	return (
		<ActionSheet
			ref={actionSheetRef}
			containerStyle={containerStyle}
			extraData={{
				showAddNewAccount,
				items: actionSheetItems,
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
						{capitalize(formatMessage(i18n.addAccount))}
					</Text>
				</View>
				:
				isLoggingOut ?
					<View style={actionSheetTitleCover}>
						<Text style={actionSheetTitle} onPress={closeActionSheet}>
							{formatMessage(i18n.chooseAccToSwitch)}
						</Text>
					</View>
					:
					undefined
			}
			options={showAddNewAccount ?
				[
					<View style={actionSheetButtonOneCover}>
						<Text style={actionSheetButtonOne}>
							{capitalize(formatMessage(i18n.logIntoExisting))}
						</Text>
					</View>,
					<View style={actionSheetButtonTwoCover}>
						<Text style={actionSheetButtonTwo}>
							{capitalize(formatMessage(i18n.createNewAccount))}
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

const getStyles = (appLayout: Object, {
	showAddNewAccount,
	isLoggingOut,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		card,
		textThree,
		textFive,
		textSix,
		inAppBrandSecondary,
		screenBackground,
	} = colors;

	const {
		paddingFactor,
		fontSizeFactorFive,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const fontSizeActionSheetTitle = Math.floor(deviceWidth * fontSizeFactorFive);

	const addIconSize = Math.floor(deviceWidth * 0.07);
	const addIconCoverSize = addIconSize + 15;

	const butBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSize * 2.2) + (padding * 2) : addIconCoverSize * 2;
	const titleBoxHeight = (showAddNewAccount || isLoggingOut) ? (fontSizeActionSheetTitle * 3) + 8 : undefined;

	const rbOuterSize = Math.floor(deviceWidth * 0.055);
	const rbSize = rbOuterSize * 0.5;

	return {
		rbOuterSize,
		rbSize,
		inAppBrandSecondary,
		containerStyle: {
			backgroundColor: card,
		},
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
			color: textThree,
		},
		actionSheetMessageBox: {
			height: undefined,
		},
		actionSheetButtonBox: {
			height: butBoxHeight,
			paddingHorizontal: padding,
			alignItems: 'stretch',
			justifyContent: 'center',
			backgroundColor: card,
		},
		actionSheetTitleBox: {
			height: titleBoxHeight,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderColor: screenBackground,
			backgroundColor: card,
		},
		actionSheetButtonOneCover: {
			flex: 1,
			backgroundColor: inAppBrandSecondary,
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
			color: textThree,
			textAlignVertical: 'center',
			textAlign: 'center',
		},
		actionSheetButtonTwo: {
			fontSize,
			color: inAppBrandSecondary,
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
			color: textThree,
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
			flex: 1,
			fontWeight: 'bold',
		},
		actionSheetButtonAccEmailText: {
			fontSize: fontSize * 0.9,
			color: textThree,
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
			borderColor: textSix,
			alignItems: 'center',
			justifyContent: 'center',
		},
		gravatarStyle: {
			borderRadius: addIconCoverSize / 2,
			height: addIconCoverSize,
			width: addIconCoverSize,
			borderWidth: 0.5,
			borderColor: textSix,
		},
		addIconStyle: {
			height: addIconSize,
			width: addIconSize,
			tintColor: textFive,
		},
		throbberContainerStyle: {
			backgroundColor: 'transparent',
			position: 'relative',
		},
		throbberStyle: {
			fontSize: rbOuterSize,
			color: inAppBrandSecondary,
		},
	};
};

export default (React.memo<Object>(React.forwardRef<Object, Object>(SwitchAccountActionSheet)): Object);

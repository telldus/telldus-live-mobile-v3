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
} from 'react';
import {
	useColorScheme,
	Linking,
} from 'react-native';
import {
	useMemo,
} from 'react';
import {
	createIntl,
	createIntlCache,
} from 'react-intl';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import * as RNLocalize from 'react-native-localize';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';

import {
	useDialogueBox,
} from './Dialoguebox';
import {
	campaignVisited,
	toggleVisibilitySwitchAccountAS,
} from '../Actions';
import {
	getPremiumAccounts,
} from '../Lib/appUtils';

import {
	CAMPAIGNS_URL,
} from '../../Constants';

import i18n from '../Translations/common';

import Theme from '../Theme';

import * as Translations from '../Translations';

const useRelativeIntl = (gatewayTimezone?: string = RNLocalize.getTimeZone()): Object => {
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	let { language = {} } = defaultSettings;
	let locale = language.code;

	return useMemo((): Object => {
		const cache = createIntlCache();
		return createIntl({
			locale,
			timeZone: gatewayTimezone,
			messages: Translations[locale] || Translations.en,
		}, cache);
	}, [
		locale,
		gatewayTimezone,
	]);
};

const useAppTheme = (): Object => {
	const colorScheme = useColorScheme();
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		themeInApp,
	} = defaultSettings;
	return React.useMemo((): Object => {
		if (colorScheme === 'dark') {
			return {
				colorScheme,
				dark: true,
				...getThemeData(themeInApp),
			};
		}
		return {
			colorScheme,
			dark: false,
			...getThemeData(themeInApp),
		};
	}, [
		colorScheme,
		themeInApp,
	]);
};

const getThemeData = (themeInApp: string | null): Object => {
	const {
		brandPrimary,
		textColorOneThemeGray,
		borderColorOneThemeGray,
		backgroundColorOneThemeGray,
		activeTintOneThemeGray,
		inActiveTintOneThemeGray,
		screenBackgroundThemeGray,
		textColorTwoThemeGray,

		textColorOneThemeBlue,
		borderColorOneThemeBlue,
		backgroundColorOneThemeBlue,
		screenBackgroundThemeBlue,
		activeTintOneThemeBlue,
		inActiveTintOneThemeBlue,
		textColorTwoThemeBlue,
	} = Theme.Core;
	switch (themeInApp) {
		case 'Gray': {
			return {
				colors: {
					primary: brandPrimary,
					text: textColorOneThemeGray,
					textTwo: textColorTwoThemeGray,
					border: borderColorOneThemeGray,
					background: backgroundColorOneThemeGray,
					card: backgroundColorOneThemeGray,
					screenBackground: screenBackgroundThemeGray,
					activeTintOne: activeTintOneThemeGray,
					inActiveTintOne: inActiveTintOneThemeGray,
				},
			};
		}
		case 'Blue': {
			return {
				colors: {
					primary: brandPrimary,
					text: textColorOneThemeBlue,
					textTwo: textColorTwoThemeBlue,
					border: borderColorOneThemeBlue,
					background: backgroundColorOneThemeBlue,
					card: backgroundColorOneThemeBlue,
					screenBackground: screenBackgroundThemeBlue,
					activeTintOne: activeTintOneThemeBlue,
					inActiveTintOne: inActiveTintOneThemeBlue,
				},
			};
		}
		default: {
			return {
				colors: {
					primary: brandPrimary,
					text: textColorOneThemeGray,
					textTwo: textColorTwoThemeGray,
					border: borderColorOneThemeGray,
					background: backgroundColorOneThemeGray,
					card: backgroundColorOneThemeGray,
					screenBackground: screenBackgroundThemeGray,
					activeTintOne: activeTintOneThemeGray,
					inActiveTintOne: inActiveTintOneThemeGray,
				},
			};
		}
	}
};

const useNoInternetDialogue = (): Object => {

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	return {
		showDialogue: (dialogueHeaderIntl: string) => {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.contentCannotAccessInfo),
				header: formatMessage(dialogueHeaderIntl),
				showPositive: true,
			});
		},
	};
};

const useCampaignAction = (): Object => {

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const dispatch = useDispatch();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const navigateToCampaign = useCallback(() => {

		const showDialogue = (text: string) => {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				text,
				showPositive: true,
			});
		};

		(() => {
			let url = CAMPAIGNS_URL;
			const defaultMessage = formatMessage(i18n.errorMessageOpenCampaign);
			Linking.canOpenURL(url)
				.then((supported: boolean): any => {
					if (!supported) {
						showDialogue(defaultMessage);
					} else {
						dispatch(campaignVisited(true));
						return Linking.openURL(url);
					}
				})
				.catch((err: any) => {
					const message = err.message || defaultMessage;
					showDialogue(message);
				});
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		navigateToCampaign,
	};
};

const useSwitchOrAddAccountAction = (): Object => {
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const dispatch = useDispatch();

	const { accounts = {} } = useSelector((state: Object): Object => state.user);
	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	const navigation = useNavigation();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const performAddOrSwitch = useCallback(() => {
		const showPurchacePremiumDialogue = () => {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				header: formatMessage(i18n.upgradeToPremium),
				text: formatMessage(i18n.switchAccountBasicInfo),
				showPositive: true,
				showNegative: true,
				positiveText: formatMessage(i18n.upgrade).toUpperCase(),
				onPressPositive: () => {
					navigation.navigate('PremiumUpgradeScreen');
				},
				closeOnPressPositive: true,
				timeoutToCallPositive: 200,
			});
		};

		if (hasAPremAccount) {
			dispatch(toggleVisibilitySwitchAccountAS({
				showAS: true,
				isLoggingOut: false,
			}));
		} else {
			showPurchacePremiumDialogue();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasAPremAccount]);

	return {
		performAddOrSwitch,
	};
};

module.exports = {
	useRelativeIntl,
	useAppTheme,
	useNoInternetDialogue,
	useCampaignAction,
	useSwitchOrAddAccountAction,
};

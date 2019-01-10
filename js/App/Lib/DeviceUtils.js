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

import { Linking } from 'react-native';

import { utils } from 'live-shared-data';
const { deviceUtils, addDeviceUtils } = utils;
import i18n from '../Translations/common';
import Theme from '../Theme';

function prepareNoZWaveSupportDialogueData(formatMessage: (Object) => string = (): string => '', locale: string): Object {
	return {
		show: true,
		showHeader: true,
		imageHeader: true,
		header: formatMessage(i18n.noZWaveDialogueHeader),
		capitalizeHeader: false,
		text: formatMessage(i18n.noZWaveDialogueContent),
		showPositive: true,
		showNegative: true,
		negativeText: formatMessage(i18n.labelGoToWebshop).toUpperCase(),
		onPressNegative: () => {
			goToWebShop(locale);
		},
		negTextColor: Theme.Core.brandSecondary,
	};
}

function goToWebShop(locale: string): any {
	const linkEN = 'http://telld.us/buyznetlitev2';
	const linkSWE = 'http://telld.us/kopznetlitev2';
	if (locale === 'sv') {
		return openURL(linkSWE);
	}
	return openURL(linkEN);
}

function openURL(url: string): any {
	Linking.canOpenURL(url).then((supported: boolean): any => {
		if (!supported) {
		  console.log(`Can't handle url: ${url}`);
		} else {
		  return Linking.openURL(url);
		}
	  }).catch((err: Object) => {
		  console.error('An error occurred', err);
	  });
}

module.exports = {
	...deviceUtils,
	...addDeviceUtils,
	prepareNoZWaveSupportDialogueData,
	openURL,
	goToWebShop,
};

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
const { deviceUtils, addDeviceUtils, addDevice433MHz } = utils;
import i18n from '../Translations/common';

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
		negativeText: formatMessage(i18n.labelGoToWebshop),
		onPressNegative: () => {
			goToWebShop(locale);
		},
		negTextColorLevel: 23,
	};
}

function prepareNo433MHzSupportDialogueData(formatMessage: (Object) => string = (): string => '', locale: string): Object {
	return {
		show: true,
		showHeader: true,
		imageHeader: true,
		header: 'No 433MHz Gateways header',
		capitalizeHeader: false,
		text: 'No 433MHz Gateways body',
		showPositive: true,
		showNegative: true,
		negativeText: formatMessage(i18n.labelGoToWebshop),
		onPressNegative: () => {
			goToWebShop(locale);
		},
		negTextColorLevel: 23,
	};
}

function goToWebShop(locale: string): any {
	const linkEN = 'https://telld.us/buyznetlitev2';
	const linkSWE = 'https://telld.us/kopznetlitev2';
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

const prepare433ModelName = (locale: string, lang: Array<Object> = [], modelNameDef: string): string => {
	let name = modelNameDef;
	for (let i = 0; i < lang.length; i++) {
		if (lang[i].lang === locale) {
			name = lang[i].modelName;
		}
	}
	return name;
};

module.exports = {
	...deviceUtils,
	...addDeviceUtils,
	...addDevice433MHz,
	prepareNoZWaveSupportDialogueData,
	prepareNo433MHzSupportDialogueData,
	openURL,
	goToWebShop,
	prepare433ModelName,
};

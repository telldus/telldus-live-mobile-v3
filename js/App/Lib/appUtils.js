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
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout';
import * as RNLocalize from 'react-native-localize';

import { forceLocale } from '../../Config';
import Theme from '../Theme';

import { utils } from 'live-shared-data';
const { appUtils } = utils;

function supportRSA(): boolean {
	const systemVersion = DeviceInfo.getSystemVersion();
	return Platform.OS === 'android' || (Platform.OS === 'ios' && parseFloat(systemVersion) >= 10);
}

function getLocale(short: boolean = true): string {
	if (forceLocale) {
		return forceLocale;
	}

	const locales = RNLocalize.getLocales();
	let { languageTag } = locales[0];

	if (!short) {
		return languageTag.replace('_', '-');
	}
	let parts = languageTag.includes('-') ? languageTag.split('-') : languageTag.split('_');
	if (parts.length === 0) {
		return parts;
	}
	return parts[0];
}

function capitalizeFirstLetterOfEachWord(string: string): string {
	const words = string.split(' ');
	let newString = '';
	words.map((word: string) => {
		newString += `${word.charAt(0).toUpperCase() + word.slice(1)} `;
	});
	return newString;
}

function isDeviceLanguageAndHasChanged(currentLanguageInfo: Object): boolean {
	const { key } = currentLanguageInfo;
	const [ localeC, device ] = key.split('-');
	const isDeviceLang = device && device === 'device';
	if (!isDeviceLang) {
		return false;
	}
	const locale = getLocale();
	if (locale.trim() !== localeC.trim()) {
		return true;
	}
	return false;
}

function isDeviceLanguage(currentLanguageInfo: Object): boolean {
	const { key = '' } = currentLanguageInfo;
	const device = key.split('-')[1];
	return !!device && device === 'device';
}

function hasTellStickNetGetOne(gatewaysById: Object): boolean {
	const match = 'TellStick Net';
	let flag = false;
	for (let id in gatewaysById) {
		const { type } = gatewaysById[id];
		if (type && type.trim().toLowerCase() === match.trim().toLowerCase()) {
			flag = true;
			break;
		}
	}
	return flag;
}

const getItemLayout = (appLayout: Object): any => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		rowHeight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return sectionListGetItemLayout({
		// The height of the row with rowData at the given sectionIndex and rowIndex
		getItemHeight: (): number => rowHeight + (padding / 2),

		// These four properties are optional
		getSeparatorHeight: (): number => 0, // The height of your separators
		getSectionHeaderHeight: (): number => getSectionHeaderHeight(getSectionHeaderFontSize(deviceWidth)) + (padding / 2), // The height of your section headers
		getSectionFooterHeight: (): number => padding, // The height of your section footers
		listHeaderHeight: 0, // The height of your list header
	});
};

const getSectionHeaderFontSize = (deviceWidth: number): number => {
	const {
		maxSizeRowTextOne,
		fontSizeFactorTwo,
	} = Theme.Core;

	let sectionHeaderFontSize = Math.floor(deviceWidth * fontSizeFactorTwo);
	return sectionHeaderFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : sectionHeaderFontSize;
};

const getSectionHeaderHeight = (sectionHeaderFontSize: number): number => sectionHeaderFontSize * 1.8;

const getDefaultMapCoordinates = (): Object => {
	return {
		region: {
			latitude: 55.70584,
			longitude: 13.19321,
			latitudeDelta: 0.24442,
			longitudeDelta: 0.24442,
		},
		latitude: 55.70584,
		longitude: 13.19321,
		latitudeDelta: 0.24442,
		longitudeDelta: 0.24442,
	};
};

const getThemeSetOptions = (): Array<Object> => {
	return [
		{
			key: 1,
			value: 'Johannes on road trip',
		},
		{
			key: 2,
			value: 'Fred on vacation',
		},
	];
};

const showBatteryStatus = ({
	percentage,
	batteryStatus,
}: Object): boolean => {
	switch (batteryStatus) {
		case 'always': {
			return true;
		}
		case 'never': {
			return false;
		}
		default:
			return percentage < 10;
	}
};

module.exports = {
	supportRSA,
	getLocale,
	capitalizeFirstLetterOfEachWord,
	isDeviceLanguageAndHasChanged,
	isDeviceLanguage,
	...appUtils,
	hasTellStickNetGetOne,
	getItemLayout,
	getSectionHeaderFontSize,
	getSectionHeaderHeight,
	getDefaultMapCoordinates,
	getThemeSetOptions,
	showBatteryStatus,
};

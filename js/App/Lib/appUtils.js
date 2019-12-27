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
import moment from 'moment';

import { forceLocale } from '../../Config';

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
	let localeIdentifier = DeviceInfo.getDeviceLocale();
	if (!short) {
		return localeIdentifier.replace('_', '-');
	}
	let parts = localeIdentifier.includes('-') ? localeIdentifier.split('-') : localeIdentifier.split('_');
	if (parts.length === 0) {
		return 'en';
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
	const { key } = currentLanguageInfo;
	const device = key.split('-')[1];
	return device && device === 'device';
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

function getRandom(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
	supportRSA,
	getLocale,
	capitalizeFirstLetterOfEachWord,
	isDeviceLanguageAndHasChanged,
	isDeviceLanguage,
	...appUtils,
	hasTellStickNetGetOne,
	getRandom,
};

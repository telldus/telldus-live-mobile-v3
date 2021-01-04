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

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
import { Linking } from 'react-native';

import { utils } from 'live-shared-data';
const { deviceUtils, addDeviceUtils, addDevice433MHz } = utils;

import {
	methods,
} from '../../Constants';

import { hasTokenExpired } from '../Lib/LocalControl';
import Theme from '../Theme';
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

const prepareDevicesWithNewStateValues = (devices: Object, selectedDevices: Object = {}): Object => {
	const updatedDevices = {};
	Object.keys(selectedDevices).forEach((dId: string) => {
		const { deviceId, stateValues, method } = selectedDevices[dId];
		if (devices[deviceId]) {
			const { stateValues: stateValuesP, ...others } = devices[deviceId] || {};
			let newStateValues = {...stateValuesP} || {};
			if (stateValues) {
				Object.keys(stateValues).forEach((k: string) => {
					const methodS = methods[k];
					if (methodS === 'THERMOSTAT') {
						const { setpoint, mode } = stateValues[k];
						const { setpoint: sp = {} } = newStateValues[methodS];
						let newSetpoint = {
							...sp,
							...setpoint,
						};
						newStateValues[methodS] = {
							setpoint: newSetpoint,
							mode,
						};

					} else {
						newStateValues[methodS] = stateValues[k];
					}
				});
			}
			updatedDevices[deviceId] = {
				...others,
				stateValues: newStateValues,
				isInState: methods[method],
			};
		}
	});
	return {
		...devices,
		...updatedDevices,
	};
};

const prepareSectionRow = (paramOne: Array<any> | Object, gateways: Array<any> | Object): Array<any> => {
	let modifiedData = paramOne.map((item: Object, index: number): Object => {
		let gateway = gateways[item.clientId];
		if (gateway) {
			const { localKey, online, websocketOnline } = gateway;
			const {
				address,
				key,
				ttl,
				supportLocal,
			} = localKey;
			const tokenExpired = hasTokenExpired(ttl);
			const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
			return { ...item, isOnline: online, websocketOnline, supportLocalControl };
		}
		return { ...item, isOnline: false, websocketOnline: false, supportLocalControl: false };
	});
	let result = groupBy(modifiedData, (items: Object): Array<any> => {
		let gateway = gateways[items.clientId];
		return gateway && gateway.id;
	});
	result = reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			data: next,
			header: index,
		});
		return acc;
	}, []);
	return orderBy(result, [(item: Object): any => {
		const { name = '' } = gateways[item.header] || {};
		return name.toLowerCase();
	}], ['asc']);
};

const parseDevicesForListView = (devices: Object = {}, gateways: Object = {}, {
	previousSelectedDevices = {},
	selectedDevices = {},
	showPreFilledOnTop,
}: Object = {}): Object => {
	let devicesList = [];
	const GeoFenceDevicesHeaderRow = {
		header: Theme.Core.GeoFenceDevicesHeaderKey,
		headerText: i18n.devices,
		data: [],
	};
	devicesList.push(GeoFenceDevicesHeaderRow);
	let isGatwaysEmpty = isEmpty(gateways);
	let isDevicesEmpty = isEmpty(devices);
	if (!isGatwaysEmpty && !isDevicesEmpty) {
		let preFilledDevices = {}, otherDevices = {};
		Object.keys(devices).forEach((did: string) => {
			if (showPreFilledOnTop && previousSelectedDevices[did] && selectedDevices[did]) {
				preFilledDevices[did] = devices[did];
			} else {
				otherDevices[did] = devices[did];
			}
		});
		let _preFilledDevices = orderBy(preFilledDevices, [(device: Object): any => {
			let { name = '' } = device;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		_preFilledDevices = _preFilledDevices.filter((item: Object): boolean => {
			const { supportedMethods = {}} = item;
			return Object.keys(supportedMethods).length > 0;
		});
		let _otherDevices = orderBy(otherDevices, [(device: Object): any => {
			let { name = '' } = device;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		_otherDevices = _otherDevices.filter((item: Object): boolean => {
			const { supportedMethods = {}} = item;
			return Object.keys(supportedMethods).length > 0;
		});
		devicesList.push(...prepareSectionRow([..._preFilledDevices, ..._otherDevices], gateways));
	}
	return devicesList;
};

const prepareDevicesDataWithCustomStateForList = (devices: Object, gateways: Object, {
	showDevices,
	previousSelectedDevices,
	selectedDevices,
	showPreFilledOnTop,
}: Object): Array<Object> => {
	return parseDevicesForListView(showDevices ? devices : {}, gateways, {
		previousSelectedDevices,
		selectedDevices,
		showPreFilledOnTop,
	});
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
	prepareDevicesWithNewStateValues,
	prepareDevicesDataWithCustomStateForList,
};

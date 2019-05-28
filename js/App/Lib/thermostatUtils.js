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

import i18n from '../Translations/common';

const getKnowModes = (formatMessage: (Object) => string): Array<Object> => {
	return [
		{
			label: 'Auto',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			maxVal: 30,
			minVal: 0,
			type: 'auto',
		},
		{
			label: 'Heat',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			maxVal: 50,
			minVal: 10,
			type: 'heat',
		},
		{
			label: 'Cool',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			maxVal: 30,
			minVal: 0,
			type: 'cool',
		},
		{
			label: 'Eco Heat',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			maxVal: 50,
			minVal: 10,
			type: 'eco heat',
		},
		{
			label: 'Eco Cool',
			edit: true,
			icon: 'fire',
			value: 21.2,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			maxVal: 30,
			minVal: 0,
			type: 'eco cool',
		},
		{
			label: 'Heat-cool',
			edit: true,
			icon: 'fire',
			value: 23.3,
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#004D92',
			endColor: '#e26901',
			maxVal: 50,
			minVal: 0,
			type: 'heat-cool',
		},
		{
			label: 'Manual',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'manual',
		},
		{
			label: 'Program',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'program',
		},
		{
			label: 'Dry',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'dry',
		},
		{
			label: 'Away',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'away',
		},
		{
			label: 'HG',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'hg',
		},
		{
			label: 'Max',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'max',
		},
		{
			label: 'Off',
			edit: false,
			icon: 'off',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'off',
		},
		{
			label: 'Fan',
			edit: false,
			icon: 'fire',
			value: null,
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			maxVal: 50,
			minVal: 0,
			type: 'fan',
		},
	];
};

const formatModeValue = (value: number): number | string => {
	if (value.toString().includes('-100')) {
		const str = value.toString();
		const newStr = str.slice((str.length - 4), str.length);
		return newStr.replace(/0/g, '-');
	}
	return value;
};

module.exports = {
	getKnowModes,
	formatModeValue,
};

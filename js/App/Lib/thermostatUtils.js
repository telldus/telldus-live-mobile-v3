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
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			mode: 'auto',
		},
		{
			label: 'Heat',
			edit: true,
			icon: 'fire',
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			mode: 'heat',
		},
		{
			label: 'Cool',
			edit: true,
			icon: 'fire',
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			mode: 'cool',
		},
		{
			label: 'Eco Heat',
			edit: true,
			icon: 'fire',
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#FFB741',
			endColor: '#E26901',
			mode: 'eco-heat',
		},
		{
			label: 'Eco Cool',
			edit: true,
			icon: 'fire',
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#23C4FA',
			endColor: '#015095',
			mode: 'eco-cool',
		},
		{
			label: 'Heat-cool',
			edit: true,
			icon: 'fire',
			scale: formatMessage(i18n.labelTemperature),
			unit: '°C',
			startColor: '#004D92',
			endColor: '#e26901',
			mode: 'heat-cool',
		},
		{
			label: 'Manual',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'manual',
		},
		{
			label: 'Program',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'program',
		},
		{
			label: 'Dry',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'dry',
		},
		{
			label: 'Away',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'away',
		},
		{
			label: 'HG',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'hg',
		},
		{
			label: 'Max',
			edit: true,
			icon: 'fire',
			scale: null,
			unit: null,
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'max',
		},
		{
			label: 'Off',
			edit: false,
			icon: 'off',
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'off',
		},
		{
			label: 'Fan',
			edit: false,
			icon: 'fire',
			startColor: '#cccccc',
			endColor: '#999999',
			mode: 'fan',
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

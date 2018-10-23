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

import moment from 'moment';
import { reportException } from './Analytics';

import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;

import i18n from '../Translations/common';


function formatLastUpdated(minutes: number, lastUpdated: number, formatMessage: Function): string {
	if (minutes <= 0) {
		return formatMessage(i18n.justNow);
	}
	if (minutes === 1) {
		return formatMessage(i18n.minuteAgo, {value: '1'});
	}
	if (minutes < 60) {
		return formatMessage(i18n.minutesAgo, {value: minutes});
	}
	const hours = Math.round(minutes / 60);
	if (hours === 1) {
		return formatMessage(i18n.hourAgo, {value: '1'});
	}
	if (hours < 24) {
		return formatMessage(i18n.hoursAgo, {value: hours});
	}
	const days = Math.round(minutes / 60 / 24);
	if (days === 1) {
		return formatMessage(i18n.dayAgo, {value: '1'});
	}
	if (days <= 7) {
		return formatMessage(i18n.daysAgo, {value: days});
	}
	try {
		return moment.unix(lastUpdated).format('MM-DD-YYYY');
	} catch (exception) {
		reportException(exception);
		return `${formatMessage(i18n.unknown)}`;
	}
}

function checkIfLarge(value: string): boolean {
	const max = 4;
	let parts = value.split('.');
	let intLength = parts[0] ? parts[0].replace(/[^0-9]/g, '').length : 0;
	let fracLength = parts[1] ? parts[1].length : 0;
	let absLength = fracLength >= 1 ? 1 + intLength : intLength;
	return (absLength > max);
}

/**
 *
 * @param {string} name : name/type of sensor received from API/socket(say, 'temp')
 * @param {number} scale : the integer value received from API/socket
 * @param {Function} formatMessage: method from 'intl'
 *
 * 'formatMessage' has a dummy method as default value, so it can be omitted if label is not required
 * and other properties can be accessed.
 */
function getSensorIconLabelUnit(name: string, scale: number, formatMessage?: Function = (translatable: Object): null => null): Object {
	let sensorTypes = getSensorTypes();
	let sensorType = sensorTypes[name];
	let sensorUnits = getSensorUnits(sensorType);
	let unit = sensorUnits[scale];

	if (name === 'humidity') {
		return {
			icon: 'humidity',
			label: formatMessage(i18n.labelHumidity),
			unit,
		};
	}
	if (name === 'temp') {
		return {
			icon: 'temperature',
			label: formatMessage(i18n.labelTemperature),
			unit,
		};
	}
	if (name === 'rrate' || name === 'rtot') {
		return {
			icon: 'rain',
			label: name === 'rrate' ? formatMessage(i18n.labelRainRate) : formatMessage(i18n.labelRainTotal),
			unit,
		};
	}
	if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
		let label = name === 'wgust' ? formatMessage(i18n.labelWindGust) : formatMessage(i18n.labelWindAverage);
		if (name === 'wdir') {
			label = formatMessage(i18n.labelWindDirection);
		}
		return {
			icon: 'wind',
			label,
			unit,
		};
	}
	if (name === 'uv') {
		return {
			icon: 'uv',
			label: formatMessage(i18n.labelUVIndex),
			unit,
		};
	}
	if (name === 'watt') {
		let label = formatMessage(i18n.energy);
		if (scale === '0') {
			label = `${formatMessage(i18n.accumulated)} ${formatMessage(i18n.labelWatt)}`;
		}
		if (scale === '2') {
			label = formatMessage(i18n.labelWatt);
		}
		if (scale === '3') {
			label = formatMessage(i18n.pulse);
		}
		if (scale === '4') {
			label = formatMessage(i18n.voltage);
		}
		if (scale === '5') {
			label = formatMessage(i18n.current);
		}
		if (scale === '6') {
			label = formatMessage(i18n.powerFactor);
		}
		return {
			icon: 'watt',
			label,
			unit,
		};
	}
	if (name === 'lum') {
		return {
			icon: 'luminance',
			label: formatMessage(i18n.labelLuminance),
			unit,
		};
	}
	if (name === 'dewp') {
		return {
			icon: 'humidity',
			label: formatMessage(i18n.labelDewPoint),
			unit,
		};
	}
	if (name === 'barpress') {
		return {
			icon: 'guage',
			label: formatMessage(i18n.labelBarometricPressure),
			unit,
		};
	}
	if (name === 'genmeter') {
		return {
			icon: 'sensor',
			label: formatMessage(i18n.labelGenericMeter),
			unit,
		};
	}
	return {
		icon: '',
		label: '',
		unit: '',
	};
}

module.exports = {
	getSensorIconLabelUnit,
	formatLastUpdated,
	checkIfLarge,
	...sensorUtils,
};

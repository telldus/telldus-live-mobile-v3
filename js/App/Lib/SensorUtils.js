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
const { getSensorTypes, getSensorUnits, getWindDirection } = sensorUtils;

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
 * @param {number} value : the sensor value[Used only to prepare the 'sensorInfo'/accessibility label] pass value 0 if 'sensorInfo' is not required, but others
 * @param {boolean} isLarge : if value is large in length or not, formatting option is based on this property.
 * @param {Function} formatMessage: method from 'intl'
 *
 * 'formatMessage' has a dummy method as default value, so it can be omitted if label is not required
 * and other properties can be accessed.
 */
function getSensorInfo(name: string, scale: number, value: number = 0, isLarge: boolean = false, formatMessage?: Function = (translatable: Object): null => null): Object {
	let sensorTypes = getSensorTypes();
	let sensorType = sensorTypes[name];
	let sensorUnits = getSensorUnits(sensorType);
	let unit = sensorUnits[scale];

	if (name === 'humidity') {
		let label = formatMessage(i18n.labelHumidity);
		return {
			icon: 'humidity',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: undefined,
		};
	}
	if (name === 'temp') {
		let label = formatMessage(i18n.labelTemperature);
		return {
			icon: 'temperature',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1, minimumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'rrate' || name === 'rtot') {
		let label = name === 'rrate' ? formatMessage(i18n.labelRainRate) : formatMessage(i18n.labelRainTotal);

		let rrateInfo = name === 'rrate' ? `${label} ${value}${unit}` : '';
		let rtotalInfo = name === 'rtot' ? `${label} ${value}${unit}` : '';

		return {
			icon: 'rain',
			label,
			unit,
			sensorInfo: `${rrateInfo}, ${rtotalInfo}`,
			formatOptions: {maximumFractionDigits: 0},
		};
	}
	if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
		let label = name === 'wgust' ? formatMessage(i18n.labelWindGust) : formatMessage(i18n.labelWindAverage);
		if (name === 'wdir') {
			label = formatMessage(i18n.labelWindDirection);
		}

		let direction = '';
		if (name === 'wdir') {
			direction = Array.from(getWindDirection(value, formatMessage)).toString();
		}
		let wgustInfo = name === 'wgust' ? `${label} ${value}${unit}` : '';
		let wavgInfo = name === 'wavg' ? `${label} ${value}${unit}` : '';
		let wdirInfo = name === 'wdir' ? `${label} ${direction}` : '';

		return {
			icon: 'wind',
			label,
			unit,
			sensorInfo: `${wgustInfo}, ${wavgInfo}, ${wdirInfo}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'uv') {
		let label = formatMessage(i18n.labelUVIndex);
		return {
			icon: 'uv',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: 0},
		};
	}
	if (name === 'watt') {
		let label = formatMessage(i18n.energy);
		if (scale === '0') {
			label = `${formatMessage(i18n.accumulated)} ${formatMessage(i18n.labelWatt)}`;
			label = isLarge ? label :
				`${formatMessage(i18n.acc)} ${formatMessage(i18n.labelWatt)}`;
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
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'lum') {
		let label = formatMessage(i18n.labelLuminance);
		return {
			icon: 'luminance',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: 0, useGrouping: false},
		};
	}
	if (name === 'dewp') {
		let label = formatMessage(i18n.labelDewPoint);
		return {
			icon: 'humidity',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'barpress') {
		let label = formatMessage(i18n.labelBarometricPressure);
		return {
			icon: 'gauge',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'genmeter') {
		let label = formatMessage(i18n.labelGenericMeter);
		return {
			icon: 'sensor',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'co2') {
		let label = 'CO2';
		return {
			icon: 'co2',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'volume') {
		let label = formatMessage(i18n.labelVolume);
		let icon = scale === '0' ? 'volumeliquid' : 'volume3d';
		return {
			icon,
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'loudness') {
		let label = formatMessage(i18n.labelLoudness);
		return {
			icon: 'speaker',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'particulatematter2.5') {
		let label = 'PM2.5';
		return {
			icon: 'pm25',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'co') {
		let label = 'CO';
		return {
			icon: 'co',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'weight') {
		let label = formatMessage(i18n.labelWeight);
		return {
			icon: 'weight',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	if (name === 'moisture') {
		let label = formatMessage(i18n.labelMoisture);
		return {
			icon: 'humidity',
			label,
			unit,
			sensorInfo: `${label} ${value}${unit}`,
			formatOptions: {maximumFractionDigits: isLarge ? 0 : 1},
		};
	}
	return {
		icon: 'sensor',
		label: formatMessage(i18n.unknown),
		unit,
		sensorInfo: formatMessage(i18n.unknown),
		formatOptions: undefined,
	};
}

module.exports = {
	getSensorInfo,
	formatLastUpdated,
	checkIfLarge,
	...sensorUtils,
};

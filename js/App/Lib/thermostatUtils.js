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

import IconThermostatAutoColor from '../Components/TabViews/img/thermostat/icon_thermostat-auto-color.svg';
import IconThermostatAuto from '../Components/TabViews/img/thermostat/icon_thermostat-auto.svg';

import IconThermostatAwayColor from '../Components/TabViews/img/thermostat/icon_thermostat-away-color.svg';
import IconThermostatAway from '../Components/TabViews/img/thermostat/icon_thermostat-away.svg';

import IconThermostatCoolColor from '../Components/TabViews/img/thermostat/icon_thermostat-cool-color.svg';
import IconThermostatCool from '../Components/TabViews/img/thermostat/icon_thermostat-cool.svg';

import IconThermostatDryColor from '../Components/TabViews/img/thermostat/icon_thermostat-dry-color.svg';
import IconThermostatDry from '../Components/TabViews/img/thermostat/icon_thermostat-dry.svg';

// import IconThermostatEcoColor from '../Components/TabViews/img/thermostat/icon_thermostat-eco-color.svg';
import IconThermostatEco from '../Components/TabViews/img/thermostat/icon_thermostat-eco.svg';

import IconThermostatEcoCoolColor from '../Components/TabViews/img/thermostat/icon_thermostat-eco-cool-color.svg';
import IconThermostatEcoHeatColor from '../Components/TabViews/img/thermostat/icon_thermostat-eco-heat-color.svg';

import IconThermostatFanColor from '../Components/TabViews/img/thermostat/icon_thermostat-fan-color.svg';
import IconThermostatFan from '../Components/TabViews/img/thermostat/icon_thermostat-fan.svg';

import IconThermostatHeatColor from '../Components/TabViews/img/thermostat/icon_thermostat-heat-color.svg';
import IconThermostatHeat from '../Components/TabViews/img/thermostat/icon_thermostat-heat.svg';

import IconThermostatHeatCoolColor from '../Components/TabViews/img/thermostat/icon_thermostat-heat-cool-color.svg';
import IconThermostatHeatCool from '../Components/TabViews/img/thermostat/icon_thermostat-heat-cool.svg';

import IconThermostatHGColor from '../Components/TabViews/img/thermostat/icon_thermostat-hg-color.svg';
import IconThermostatHG from '../Components/TabViews/img/thermostat/icon_thermostat-hg.svg';

import IconThermostatProgramColor from '../Components/TabViews/img/thermostat/icon_thermostat-program-color.svg';
import IconThermostatProgram from '../Components/TabViews/img/thermostat/icon_thermostat-program.svg';

const getKnownModes = (formatMessage: (Object) => string): Array<Object> => {
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
			Icon: IconThermostatAutoColor,
			IconActive: IconThermostatAuto,
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
			Icon: IconThermostatHeatColor,
			IconActive: IconThermostatHeat,
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
			Icon: IconThermostatCoolColor,
			IconActive: IconThermostatCool,
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
			Icon: IconThermostatEcoHeatColor,
			IconActive: IconThermostatEco,
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
			Icon: IconThermostatEcoCoolColor,
			IconActive: IconThermostatEco,
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
			Icon: IconThermostatHeatCoolColor,
			IconActive: IconThermostatHeatCool,
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
			Icon: IconThermostatAutoColor,
			IconActive: IconThermostatAuto,
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
			Icon: IconThermostatProgramColor,
			IconActive: IconThermostatProgram,
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
			Icon: IconThermostatDryColor,
			IconActive: IconThermostatDry,
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
			Icon: IconThermostatAwayColor,
			IconActive: IconThermostatAway,
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
			Icon: IconThermostatHGColor,
			IconActive: IconThermostatHG,
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
			Icon: IconThermostatHeatColor,
			IconActive: IconThermostatHeat,
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
			Icon: IconThermostatFanColor,
			IconActive: IconThermostatFan,
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

const getSupportedModes = (parameter: Array<Object>, setpoint: Object, intl: Object): Array<Object> => {
	let modes = {};
	parameter.map((param: Object) => {
		if (param.name && param.name === 'thermostat') {
			const { modes: MODES, setpoints = {} } = param.value;
			if (!MODES && Object.keys(setpoints).length > 0) {
				Object.keys(setpoints).map((key: string) => {
					const minMax = setpoints[key];
					if (minMax) {
						modes[key] = {
							...minMax,
						};
					} else {
						modes[key] = {};
					}
				});
			} else {
				MODES.map((mode: string) => {
					const minMax = setpoints[mode];
					if (minMax) {
						modes[mode] = {
							...minMax,
						};
					} else {
						modes[mode] = {};
					}
				});
			}
		}
	});

	let supportedModes = [];
	getKnownModes(intl.formatMessage).map((modeInfo: Object) => {
		const { mode } = modeInfo;
		if (modes[mode]) {
			modeInfo = {
				...modeInfo,
				value: setpoint[mode],
				minVal: modes[mode].min,
				maxVal: modes[mode].max,
			};
			supportedModes.push(modeInfo);
		}
	});
	return supportedModes;
};

module.exports = {
	getKnownModes,
	formatModeValue,
	getSupportedModes,
};

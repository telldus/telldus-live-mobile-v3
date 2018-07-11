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

import React from 'react';
import moment from 'moment';

import { View } from '../../../../BaseComponents';
import SensorBlock from './SensorBlock';

import { formatLastUpdated } from '../../../Lib';
import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;

import i18n from '../../../Translations/common';

const directions = [
	'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N',
];

type Props = {
};

type State = {
};

export default class SensorTypes extends View {
	props: Props;
	state: State;
	constructor(props: Props) {
		super(props);
		this.state = {
		};

		const { formatMessage } = this.props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);
		this.labelHumidity = formatMessage(i18n.labelHumidity);
		this.labelTemperature = formatMessage(i18n.labelTemperature);
		this.labelRainRate = formatMessage(i18n.labelRainRate);
		this.labelRainTotal = formatMessage(i18n.labelRainTotal);
		this.labelWindGust = formatMessage(i18n.labelWindGust);
		this.labelWindAverage = formatMessage(i18n.labelWindAverage);
		this.labelWindDirection = formatMessage(i18n.labelWindDirection);
		this.labelUVIndex = formatMessage(i18n.labelUVIndex);

		this.labelWatt = formatMessage(i18n.labelWatt);
		this.labelCurrent = formatMessage(i18n.current);
		this.labelEnergy = formatMessage(i18n.energy);
		this.labelAccumulated = formatMessage(i18n.accumulated);
		this.labelAcc = formatMessage(i18n.acc);
		this.labelVoltage = formatMessage(i18n.voltage);
		this.labelPowerFactor = formatMessage(i18n.powerFactor);
		this.labelPulse = formatMessage(i18n.pulse);

		this.labelLuminance = formatMessage(i18n.labelLuminance);
		this.labelDewPoint = formatMessage(i18n.labelDewPoint);
		this.labelBarometricPressure = formatMessage(i18n.labelBarometricPressure);
		this.labelGenericMeter = formatMessage(i18n.labelGenericMeter);
		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.sensorTypes = getSensorTypes();
	}

	getSensors(): Object {
		const { appLayout, sensor } = this.props;
		const { data } = sensor;

		let sensors = [], sensorInfo = '';
		Object.values(data).forEach((values: Object, index: number) => {
			let { value, scale, name, lastUpdated } = values;
			let sensorType = this.sensorTypes[values.name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];

			let props = {
				key: index,
				name,
				value,
				unit,
				appLayout,
				lastUpdated: moment.unix(lastUpdated),
			};
			if (name === 'humidity') {
				sensors.push(
					<SensorBlock {...props}
						icon={'humidity'}
						label={this.labelHumidity}/>);
				sensorInfo = `${sensorInfo}, ${this.labelHumidity} ${value}${unit}`;
			}
			if (name === 'temp') {
				sensors.push(
					<SensorBlock {...props}
						icon={'temperature'} label={this.labelTemperature}
						formatOptions={{maximumFractionDigits: 1, minimumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelTemperature} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtot') {
				sensors.push(
					<SensorBlock {...props}
						icon={'rain'}
						label={name === 'rrate' ? this.labelRainRate : this.labelRainTotal}
						formatOptions={{maximumFractionDigits: 0}}/>);

				let rrateInfo = name === 'rrate' ? `${this.labelRainRate} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtot' ? `${this.labelRainTotal} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let direction = '', label = name === 'wgust' ? this.labelWindGust : this.labelWindAverage;
				if (name === 'wdir') {
					const getWindDirection = (sValue: number): string => directions[Math.floor(sValue / 22.5)];
					direction = [...getWindDirection(value)].toString();
					value = getWindDirection(value);
					props = {...props, value};
					label = this.labelWindDirection;
				}
				sensors.push(
					<SensorBlock {...props}
						icon={'wind'}
						label={label}
						formatOptions={{maximumFractionDigits: 1}}/>);

				let wgustInfo = name === 'wgust' ? `${this.labelWindGust} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${this.labelWindAverage} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${this.labelWindDirection} ${direction}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				sensors.push(
					<SensorBlock {...props}
						icon={'uv'}
						label={this.labelUVIndex}
						formatOptions={{maximumFractionDigits: 0}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelUVIndex} ${value}${unit}`;
			}
			if (name === 'watt') {
				let label = this.labelEnergy, labelWatt = this.labelEnergy;
				if (scale === '0') {
					label = `${this.labelAccumulated} ${this.labelWatt}`;
					labelWatt = `${this.labelAccumulated} ${this.labelWatt}`;
				}
				if (scale === '2') {
					label = this.labelWatt;
					labelWatt = this.labelWatt;
				}
				if (scale === '3') {
					label = this.labelPulse;
					labelWatt = this.labelPulse;
				}
				if (scale === '4') {
					label = this.labelVoltage;
					labelWatt = this.labelVoltage;
				}
				if (scale === '5') {
					label = this.labelCurrent;
					labelWatt = this.labelCurrent;
				}
				if (scale === '6') {
					label = this.labelPowerFactor;
					labelWatt = this.labelPowerFactor;
				}
				sensors.push(
					<SensorBlock {...props}
						icon={'watt'}
						label={label}
						formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${labelWatt} ${value}${unit}`;
			}
			if (name === 'lum') {
				sensors.push(
					<SensorBlock {...props}
						icon={'luminance'}
						label={this.labelLuminance}
						formatOptions={{maximumFractionDigits: 0}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelLuminance} ${value}${unit}`;
			}
			if (name === 'dewp') {
				sensors.push(
					<SensorBlock {...props}
						icon={'humidity'}
						label={this.labelDewPoint}
						formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelDewPoint} ${value}${unit}`;
			}
			if (name === 'barpress') {
				sensors.push(
					<SensorBlock {...props}
						icon={'guage'}
						label={this.labelBarometricPressure}
						formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelBarometricPressure} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				sensors.push(
					<SensorBlock {...props}
						icon={'sensor'}
						label={this.labelGenericMeter}
						formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelGenericMeter} ${value}${unit}`;
			}
		});
		return sensors;
	}

	render(): Object {
		const { appLayout } = this.props;

		const { containerStyle } = this.getStyles(appLayout);
		const sensors = this.getSensors();

		return (
			<View style={containerStyle}>
				{sensors}
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		return {
			containerStyle: {
				flex: 0,
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
		};
	}
}

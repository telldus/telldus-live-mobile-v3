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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { FormattedNumber, View } from '../../../../BaseComponents';

import SensorDashboardTileSlide from './SensorDashboardTileSlide';
import DashboardShadowTile from './DashboardShadowTile';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { formatLastUpdated, checkIfLarge } from '../../../Lib';
import i18n from '../../../Translations/common';
import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;
import Theme from '../../../Theme';

type Props = {
	item: Object,
	tileWidth: number,
	displayType: string,
	style: Object,
	onPress: () => void,
	intl: Object,
	isGatewayActive: boolean,
};

type State = {
	currentDisplayType: string,
};

class SensorDashboardTile extends PureComponent<Props, State> {
	props: Props;
	state: State;

	getSlideList: Object => Object;

	labelSensor: string;
	labelHumidity: string;
	labelTemperature: string;
	labelRainRate: string;
	labelRainTotal: string;
	labelWindGust: string;
	labelWindAverage: string;
	labelWindDirection: string;
	labelUVIndex: string;
	labelWatt: string;
	labelCurrent: string;
	labelEnergy: string;
	labelAccumulated: string;
	labelAcc: string;
	labelVoltage: string;
	labelPowerFactor: string;
	labelPulse: string;
	labelLuminance: string;
	labelDewPoint: string;
	labelBarometricPressure: string;
	labelGenericMeter: string;
	labelTimeAgo: string;
	width: number;
	offline: string;

	sensorTypes: Object;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentDisplayType: 'default',
		};

		let { formatMessage } = this.props.intl;

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

		this.labelWatt = formatMessage(i18n.labelWatt);
		this.labelDewPoint = formatMessage(i18n.labelDewPoint);
		this.labelBarometricPressure = formatMessage(i18n.labelBarometricPressure);
		this.labelGenericMeter = formatMessage(i18n.labelGenericMeter);
		this.labelLuminance = formatMessage(i18n.labelLuminance);

		this.offline = formatMessage(i18n.offline);

		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.sensorTypes = getSensorTypes();

		this.getSlideList = this.getSlideList.bind(this);
	}

	getSlideList(item: Object): Object {
		let slideList = [], sensorInfo = '';
		for (let key in item.data) {
			let { value, scale, name } = item.data[key];
			let sensorType = this.sensorTypes[name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];
			let isLarge = checkIfLarge(value.toString());

			if (name === 'humidity') {
				slideList.push({
					key: 'humidity',
					icon: 'humidity',
					label: this.labelHumidity,
					unit,
					isLarge,
					text: <FormattedNumber value={value}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelHumidity} ${value}${unit}`;
			}
			if (name === 'temp') {
				slideList.push({
					key: 'temperature',
					icon: 'temperature',
					label: this.labelTemperature,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={1} minimumFractionDigits={1}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelTemperature} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtotal') {
				slideList.push({
					key: `rain${key}`,
					icon: 'rain',
					label: name === 'rrate' ? this.labelRainRate : this.labelRainTotal,
					unit,
					isLarge,
					text: (name === 'rrate' && <FormattedNumber value={value} maximumFractionDigits={0}/> ),
					text2: (name === 'rtotal' && <FormattedNumber value={value} maximumFractionDigits={0}/> ),
				});
				let rrateInfo = name === 'rrate' ? `${this.labelRainRate} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtotal' ? `${this.labelRainTotal} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let directions = '', label = name === 'wgust' ? this.labelWindGust : this.labelWindAverage;
				if (name === 'wdir') {
					directions = [...this._windDirection(value)].toString();
					label = this.labelWindDirection;
				}
				slideList.push({
					key: `wind${key}`,
					icon: 'wind',
					label: label,
					unit,
					isLarge,
					text: (name === 'wavg' && <FormattedNumber value={value} maximumFractionDigits={1}/> ),
					text2: (name === 'wgust' && <FormattedNumber value={value} maximumFractionDigits={1}/> ),
					text3: (name === 'wdir' && this._windDirection(value)),
				});
				let wgustInfo = name === 'wgust' ? `${this.labelWindGust} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${this.labelWindAverage} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${this.labelWindDirection} ${directions}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				slideList.push({
					key: 'uv',
					icon: 'uv',
					label: this.labelUVIndex,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={0}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelUVIndex} ${value}${unit}`;
			}
			if (name === 'watt') {
				let label = this.labelEnergy, labelWatt = this.labelEnergy;
				if (scale === '0') {
					label = isLarge ? `${this.labelAccumulated} ${this.labelWatt}` :
						`${this.labelAcc} ${this.labelWatt}`;
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
				slideList.push({
					key: `watt${key}`,
					icon: 'watt',
					label: label,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={1}/>,
				});
				sensorInfo = `${sensorInfo}, ${labelWatt} ${value}${unit}`;
			}
			if (name === 'luminance') {
				slideList.push({
					key: 'luminance',
					icon: 'luminance',
					label: this.labelLuminance,
					isLarge: isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={1} suffix={unit}
						useGrouping={false}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelLuminance} ${value}${unit}`;
			}
			if (name === 'dewp') {
				slideList.push({
					key: 'dewpoint',
					icon: 'humidity',
					label: this.labelDewPoint,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={1}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelDewPoint} ${value}${unit}`;
			}
			if (name === 'barpress') {
				slideList.push({
					key: 'barometricpressure',
					icon: 'guage',
					label: this.labelBarometricPressure,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={1}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelBarometricPressure} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				slideList.push({
					key: 'genricmeter',
					icon: 'sensor',
					label: this.labelGenericMeter,
					unit,
					isLarge,
					text: <FormattedNumber value={value} maximumFractionDigits={0}/>,
				});
				sensorInfo = `${sensorInfo}, ${this.labelGenericMeter} ${value}${unit}`;
			}
		}

		return {slideList, sensorInfo};
	}

	render(): Object {
		const { item, tileWidth, isGatewayActive, intl } = this.props;
		const displayType = this.props.displayType;
		const { slideList, sensorInfo } = this.getSlideList(item);

		const { lastUpdated } = item;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);
		const lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);

		const accessibilityLabel = `${this.labelSensor} ${item.name}, ${sensorInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;

		const slides = slideList.map((data: Object): Object =>
			<SensorDashboardTileSlide
				key={data.key}
				data={data}
				tileWidth={tileWidth}
				isGatewayActive={isGatewayActive}/>
		);

		let selectedSlideIndex = 0;
		if (displayType !== 'default') {
			for (let i = 0; i < slideList.length; ++i) {
				if (slideList[i].key === displayType) {
					selectedSlideIndex = i;
					break;
				}
			}
		}

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline : styles.itemIconContainerActive;
		let background = slideList.length === 0 ? (isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor) : 'transparent';

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={item.state !== 0}
				name={item.name}
				info={lastUpdatedValue}
				icon={'sensor'}
				iconStyle={{
					color: '#fff',
					fontSize: tileWidth / 6,
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: tileWidth / 4.8,
					height: tileWidth / 4.8,
					borderRadius: tileWidth / 9.6,
					alignItems: 'center',
					justifyContent: 'center',
				}]}
				type={'sensor'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				formatMessage={intl.formatMessage}
				style={[
					this.props.style, {
						width: tileWidth,
						height: tileWidth,
					},
				]}>
				<TouchableOpacity
					onPress={this.props.onPress}
					activeOpacity={1}
					style={{
						width: tileWidth,
						height: tileWidth * 0.4,
						flexDirection: 'row',
					}}
					accessible={false}
					importantForAccessibility="no-hide-descendants">
					<View style={[styles.body, {
						width: tileWidth,
						height: tileWidth * 0.4,
						backgroundColor: background,
					}]}>
						{slides[selectedSlideIndex]}
					</View>
				</TouchableOpacity>
			</DashboardShadowTile>
		);
	}

	_windDirection(value: number): string {
		const directions = [
			'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N',
		];
		return directions[Math.floor(value / 22.5)];
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 30,
		justifyContent: 'center',
	},
	body: {
		flexDirection: 'row',
		borderBottomLeftRadius: 2,
		borderBottomRightRadius: 2,
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	itemIconContainerActive: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	itemIconContainerOffline: {
		backgroundColor: Theme.Core.offlineColor,
	},
});

function mapStateToProps(state: Object, { item }: Object): Object {
	return {
		displayType: state.dashboard.sensorDisplayTypeById[item.id],
	};
}

module.exports = connect(mapStateToProps)(SensorDashboardTile);

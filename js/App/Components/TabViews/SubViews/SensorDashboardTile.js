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
import { connect } from 'react-redux';

import { FormattedNumber, View } from 'BaseComponents';

import SensorDashboardTileSlide from './SensorDashboardTileSlide';
import DashboardShadowTile from './DashboardShadowTile';
import { TouchableOpacity, StyleSheet } from 'react-native';

import i18n from '../../../Translations/common';
import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;

type Props = {
	item: Object,
	tileWidth: number,
	displayType: string,
	style: Object,
	onPress: () => void,
	intl: Object,
};

type State = {
	currentDisplayType: string,
};

class SensorDashboardTile extends View {
	props: Props;
	state: State;
	getSlideList : Object => Object;

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
		this.labelLuminance = formatMessage(i18n.labelLuminance);

		this.sensorTypes = getSensorTypes();

		this.getSlideList = this.getSlideList.bind(this);
	}

	getSlideList(item: Object) : Object {
		let slideList = [], sensorInfo = '';
		for (let key in item.data) {
			let { value, scale, name } = item.data[key];
			let sensorType = this.sensorTypes[name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];

			if (name === 'humidity') {
				slideList.push({
					key: 'humidity',
					icon: require('../img/sensorIcons/HumidityLargeGray.png'),
					text: <FormattedNumber value={value / 100} suffix={unit}/>,
				});
			}
			if (name === 'temp') {
				slideList.push({
					key: 'temperature',
					icon: require('../img/sensorIcons/TemperatureLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={1} minimumFractionDigits={1}
										suffix={unit}/>,
				});
			}
			if (name === 'rrate' || name === 'rtotal') {
				slideList.push({
					key: 'rain',
					icon: require('../img/sensorIcons/RainLargeGray.png'),
					text: (name === 'rrate' && <FormattedNumber value={value} maximumFractionDigits={0}
																suffix={`${unit}\n`}/> ),
					text2: (name === 'rtotal' && <FormattedNumber value={value} maximumFractionDigits={0}
																suffix={unit}/> ),
				});
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				slideList.push({
					key: 'wind',
					icon: require('../img/sensorIcons/WindLargeGray.png'),
					text: (name === 'wavg' && <FormattedNumber value={value} maximumFractionDigits={1}
																suffix={`${unit}\n`}/> ),
					text2: (name === 'wgust' && <FormattedNumber value={value} maximumFractionDigits={1}
																suffix={`${unit}\n`}/> ),
					text3: (name === 'wdir' && this._windDirection(value)),
				});
			}
			if (name === 'uv') {
				slideList.push({
					key: 'uv',
					icon: require('../img/sensorIcons/UVLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={0} suffix={unit}/>,
				});
			}
			if (name === 'watt') {
				slideList.push({
					key: 'watt',
					icon: require('../img/sensorIcons/WattLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={1} suffix={unit}/>,
				});
			}
			if (name === 'luminance') {
				slideList.push({
					key: 'luminance',
					icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={1} suffix={unit}
										useGrouping={false}/>,
				});
			}
			if (name === 'dewp') {
				slideList.push({
					key: 'dewpoint',
					icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={1} suffix={unit}/>,
				});
			}
			if (name === 'barpress') {
				slideList.push({
					key: 'barometricpressure',
					icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={1} suffix={unit}/>,
				});
			}
			if (name === 'genmeter') {
				slideList.push({
					key: 'genricmeter',
					icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
					text: <FormattedNumber value={value} maximumFractionDigits={0} suffix={unit}/>,
				});
			}
		}

		return {slideList, sensorInfo};
	}

	render() {
		const { item, tileWidth } = this.props;
		const displayType = this.props.displayType;
		const { slideList, sensorInfo } = this.getSlideList(item);

		const accessibilityLabel = `${this.labelSensor} ${item.name}, ${sensorInfo}`;

		const slides = slideList.map((data) =>
			<SensorDashboardTileSlide
				key={data.key}
				data={data}
				tileWidth={tileWidth}/>
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

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={item.state !== 0}
				name={item.name}
				type={'sensor'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				style={[
					this.props.style, {
						width: tileWidth,
						height: tileWidth,
					},
				]}>
				<TouchableOpacity
					onPress={this.props.onPress}
					activeOpacity={1}
					style={styles.container}>
					<View style={styles.body}>
						{slides[selectedSlideIndex]}
					</View>
				</TouchableOpacity>
			</DashboardShadowTile>
		);
	}

	_windDirection(value) {
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
		flex: 30,
		flexDirection: 'row',
		borderTopLeftRadius: 7,
		borderTopRightRadius: 7,
	},
});

function mapStateToProps(state, { item }) {
	return {
		displayType: state.dashboard.sensorDisplayTypeById[item.id],
	};
}

module.exports = connect(mapStateToProps)(SensorDashboardTile);

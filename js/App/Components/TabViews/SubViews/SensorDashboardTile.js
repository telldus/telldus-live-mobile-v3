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

'use strict';

import React from 'react';
import { FormattedNumber, Text, View } from 'BaseComponents';

import SensorDashboardTileSlide from './SensorDashboardTileSlide';
import DashboardShadowTile from './DashboardShadowTile';
import { TouchableOpacity } from 'react-native';

class SensorDashboardTile extends View {
	constructor(props) {
		super(props);
		this.getSlideList = this.getSlideList.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);
	}

	changeDisplayType() {
		let item = this.props.item;
		// TODO: move allDisplayType to Reducer
		let allDisplayType = [];

		if (item.childObject.humidity) {
			allDisplayType.push('humidity');
		}
		if (item.childObject.luminance) {
			allDisplayType.push('luminance');
		}
		if (item.childObject.rainRate || item.childObject.rainTotal) {
			allDisplayType.push('rain');
		}
		if (item.childObject.temperature) {
			allDisplayType.push('temperature');
		}
		if (item.childObject.uv) {
			allDisplayType.push('uv');
		}
		if (item.childObject.watt) {
			allDisplayType.push('watt');
		}
		if (item.childObject.windGust || item.childObject.windAverage || item.childObject.windDirection) {
			allDisplayType.push('wind');
		}

		let currentIdx = allDisplayType.indexOf(item.displayType);
		currentIdx = currentIdx < 0 ? 0 : currentIdx;
		let nextIdx = currentIdx < allDisplayType.length - 1 ? currentIdx + 1 : 0;

		this.props.onChangeSensorDisplayType(allDisplayType[nextIdx]);
	}

	getSlideList(item) {
		let slideList = [];

		if (item.childObject.humidity) {
			slideList.push({
				key: 'humidity',
				icon: require('../img/sensorIcons/HumidityLargeGray.png'),
				text: <FormattedNumber value = {item.childObject.humidity / 100} formatStyle = "percent" />,
			});
		}
		if (item.childObject.temperature) {
			slideList.push({
				key: 'temperature',
				icon: require('../img/sensorIcons/TemperatureLargeGray.png'),
				text: <FormattedNumber value = {item.childObject.temperature} maximumFractionDigits = {0} suffix = {String.fromCharCode(176) + 'c'}/>,
			});
		}
		if (item.childObject.rainRate || item.childObject.rainTotal) {
			slideList.push({
				key: 'rain',
				icon: require('../img/sensorIcons/RainLargeGray.png'),
				text: (item.childObject.rainRate && <FormattedNumber value = {item.childObject.rainRate} maximumFractionDigits = {0} suffix = {'mm/h\n'} /> ),
				text2: (item.childObject.rainTotal && <FormattedNumber value = {item.childObject.rainTotal} maximumFractionDigits = {0} suffix = {'mm'} /> ),
			});
		}
		if (item.childObject.windGust || item.childObject.windAverage || item.childObject.windDirection) {
			slideList.push({
				key: 'wind',
				icon: require('../img/sensorIcons/WindLargeGray.png'),
				text: (item.childObject.windAverage && <FormattedNumber value = {item.childObject.windAverage} maximumFractionDigits = {1} suffix = {'m/s\n'} /> ),
				text2: (item.childObject.windGust && <FormattedNumber value = {item.childObject.windGust} maximumFractionDigits = {1} suffix = {'m/s*\n'} /> ),
				text3: (item.childObject.windDirection && <Text>{ this._windDirection(item.childObject.windDirection) }</Text> ),
			});
		}
		if (item.childObject.uv) {
			slideList.push({
				key: 'uv',
				icon: require('../img/sensorIcons/UVLargeGray.png'),
				text: <FormattedNumber value = {item.childObject.uv} maximumFractionDigits = {0} />,
			});
		}
		if (item.childObject.watt) {
			slideList.push({
				key: 'watt',
				icon: require('../img/sensorIcons/WattLargeGray.png'),
				text: <FormattedNumber value = {item.childObject.watt} maximumFractionDigits = {1} suffix = {' W'}/>,
			});
		}
		if (item.childObject.luminance) {
			slideList.push({
				key: 'luminance',
				icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
				text: <FormattedNumber value = {item.childObject.luminance} maximumFractionDigits = {0} suffix = {'lx'}/>,
			});
		}

		return slideList;
	}

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;

		const slideList = this.getSlideList(item);

		const slides = slideList.map((data) =>
			<SensorDashboardTileSlide key = {data.key} icon = {data.icon} text={data.text} tileWidth={tileWidth} />
		);

		let selectedSlideIndex = 0;
		if (item.displayType !== 'default') {
			for (let i = 0; i < slideList.length; ++i) {
				if (slideList[i].key === item.displayType) {
					selectedSlideIndex = i;
					break;
				}
			}
		}

		return (
			<DashboardShadowTile
				item={item}
				style={	[this.props.style, {
					width: tileWidth,
					height: tileWidth,
				}]}>
				<TouchableOpacity onPress={this.changeDisplayType} style={{flex: 1, justifyContent: 'center'}}>
				<View style={{flexDirection: 'row', flex: 30}}>
					{slides[selectedSlideIndex]}
				</View>
				<View style={{
					flex: 13,
					backgroundColor: item.childObject.state === 0 ? '#bfbfbf' : '#e56e18',
					justifyContent: 'center'}}>
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						style = {{
							padding: 5,
							color: 'white',
							fontSize: Math.floor(tileWidth / 8),
							opacity: item.childObject.name ? 1 : 0.7,
							textAlign: 'center',
							textAlignVertical: 'center',
						}}>
						{item.childObject.name ? item.childObject.name : '(no name)'}
					</Text>
				</View>
				</TouchableOpacity>
			</DashboardShadowTile>
		);
	}

	_windDirection(value) {
		const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
		return directions[Math.floor(value / 22.5)];
	}

}

module.exports = SensorDashboardTile;

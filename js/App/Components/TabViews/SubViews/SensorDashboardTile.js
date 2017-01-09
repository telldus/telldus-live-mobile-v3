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
import { FormattedNumber, Image, Text, View } from 'BaseComponents';

import Theme from 'Theme';
import SensorDashboardTileSlide from './SensorDashboardTileSlide';

class SensorDashboardTile extends View {

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;
		const tileTitleHeight = Math.floor(tileWidth / 4);
		const tileDetailsHeight = tileWidth - tileTitleHeight;

		var slideList = [];
		if (item.childObject.humidity) {
			slideList.push({
				key: 'humidity',
				icon: require('../img/sensorIcons/HumidityLarge.png'),
				text: <FormattedNumber value = {item.childObject.humidity / 100} formatStyle = 'percent' />
			});
		}
		if (item.childObject.temperature) {
			slideList.push({
				key: 'temperature',
				icon: require('../img/sensorIcons/TemperatureLarge.png'),
				text: <FormattedNumber value = {item.childObject.temperature} maximumFractionDigits = {0} suffix = {String.fromCharCode(176) + 'c'}/>
			});
		}
		if (item.childObject.rainRate || item.childObject.rainTotal) {
			slideList.push({
				key: 'rain',
				icon: require('../img/sensorIcons/RainLarge.png'),
				text: (item.childObject.rainRate && <FormattedNumber value = {item.childObject.rainRate} maximumFractionDigits = {0} suffix = {'mm/h\n'} /> )
						(item.childObject.rainTotal && <FormattedNumber value = {item.childObject.rainTotal} maximumFractionDigits = {0} suffix = {'mm'} /> )
			});
		}
		if (item.childObject.windGust || item.childObject.windAverage || item.childObject.windDirection) {
			slideList.push({
				key: 'wind',
				icon: require('../img/sensorIcons/WindLarge.png'),
				text: 'foo'
			});
		}
		if (item.childObject.uv) {
			slideList.push({
				key: 'uv',
				icon: require('../img/sensorIcons/UVLarge.png'),
				text: <FormattedNumber value = {item.childObject.uv} maximumFractionDigits = {0} />
			});
		}
		if (item.childObject.watt) {
			slideList.push({
				key: 'watt',
				icon: require('../img/sensorIcons/WattLarge.png'),
				text: <FormattedNumber value = {item.childObject.watt} maximumFractionDigits = {1} suffix = {' W'}/>
			});
		}
		if (item.childObject.luminance) {
			slideList.push({
				key: 'luminance',
				icon: require('../img/sensorIcons/LuminanceLarge.png'),
				text: <FormattedNumber value = {item.childObject.luminance} maximumFractionDigits = {0} suffix = {'lx'}/>
			});
		}
		const slides = slideList.map((item) =>
			<SensorDashboardTileSlide key = {item.key} icon = {item.icon} text={item.text} tileWidth={tileWidth} />
		);

		return (
			<Image
				style = {[this.props.style, {
					flexDirection: 'column',
					width: tileWidth,
					height: tileWidth,
					backgroundColor: Theme.Core.brandPrimary
				}]}
				source = {require('../img/TileBackground.png')}
			>
				<View style = {{
					width: tileWidth,
					height: tileDetailsHeight
				}}>{slides}</View>
				<View style = {{
					width: tileWidth,
					height: tileTitleHeight,
					justifyContent: 'center'
				}}>
					<Text
					ellipsizeMode = "middle"
					numberOfLines = {1}
					style = {{
						width: tileWidth,
						color: 'rgba(255,255,255,1)',
						fontSize:  Math.floor(tileWidth / 8),
						opacity: item.childObject.name ? 1 : 0.7,
						marginBottom: 2,
						textAlign: 'center'
					}}>
						{item.childObject.name ? item.childObject.name : '(no name)'}
					</Text>
				</View>
			</Image>
		)
	}

	_windDirection(value) {
		const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
		return directions[Math.floor(value / 22.5)]
	}

}

module.exports = SensorDashboardTile;

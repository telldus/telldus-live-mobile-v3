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

import { FormattedNumber, Text, View } from 'BaseComponents';

import SensorDashboardTileSlide from './SensorDashboardTileSlide';
import DashboardShadowTile from './DashboardShadowTile';
import { TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  item: Object,
  tileWidth: number,
  displayType: string,
  style: Object,
  onPress: () => void,
};

type State = {
  currentDisplayType: string,
};

class SensorDashboardTile extends View {
	props: Props;
	state: State;
	getSlideList : Object => Array<Object>;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentDisplayType: 'default',
		};

		this.getSlideList = this.getSlideList.bind(this);
	}

	getSlideList(item: Object) : Array<Object> {
		let slideList = [];

		if (item.humidity) {
			slideList.push({
				key: 'humidity',
				icon: require('../img/sensorIcons/HumidityLargeGray.png'),
				text: <FormattedNumber value={item.humidity / 100} formatStyle="percent"/>,
			});
		}
		if (item.temperature) {
			slideList.push({
				key: 'temperature',
				icon: require('../img/sensorIcons/TemperatureLargeGray.png'),
				text: <FormattedNumber value={item.temperature} maximumFractionDigits={1}
				                       suffix={`${String.fromCharCode(176)}C`}/>,
			});
		}
		if (item.rainRate || item.rainTotal) {
			slideList.push({
				key: 'rain',
				icon: require('../img/sensorIcons/RainLargeGray.png'),
				text: (item.rainRate && <FormattedNumber value={item.rainRate} maximumFractionDigits={0}
				                                         suffix={'mm/h\n'}/> ),
				text2: (item.rainTotal && <FormattedNumber value={item.rainTotal} maximumFractionDigits={0}
				                                           suffix={'mm'}/> ),
			});
		}
		if (item.windGust || item.windAverage || item.windDirection) {
			slideList.push({
				key: 'wind',
				icon: require('../img/sensorIcons/WindLargeGray.png'),
				text: (item.windAverage && <FormattedNumber value={item.windAverage} maximumFractionDigits={1}
				                                            suffix={'m/s\n'}/> ),
				text2: (item.windGust && <FormattedNumber value={item.windGust} maximumFractionDigits={1}
				                                          suffix={'m/s*\n'}/> ),
				text3: (item.windDirection && <Text>{ this._windDirection(item.windDirection) }</Text> ),
			});
		}
		if (item.uv) {
			slideList.push({
				key: 'uv',
				icon: require('../img/sensorIcons/UVLargeGray.png'),
				text: <FormattedNumber value={item.uv} maximumFractionDigits={0}/>,
			});
		}
		if (item.watt) {
			slideList.push({
				key: 'watt',
				icon: require('../img/sensorIcons/WattLargeGray.png'),
				text: <FormattedNumber value={item.watt} maximumFractionDigits={1} suffix={' W'}/>,
			});
		}
		if (item.luminance) {
			slideList.push({
				key: 'luminance',
				icon: require('../img/sensorIcons/LuminanceLargeGray.png'),
				text: <FormattedNumber value={item.luminance} maximumFractionDigits={0} suffix={'lx'}
				                       useGrouping={false}/>,
			});
		}

		return slideList;
	}

	render() {
		const { item, tileWidth } = this.props;
		const displayType = this.props.displayType;

		const slideList = this.getSlideList(item);

		const slides = slideList.map((data) =>
			<SensorDashboardTileSlide key={data.key} icon={data.icon} text={data.text} tileWidth={tileWidth}/>
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
				tileWidth={tileWidth}
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

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
import { TouchableOpacity, StyleSheet } from 'react-native';

import {
	FormattedNumber,
	View,
} from '../../../../BaseComponents';
import SensorDashboardTileSlide from './SensorDashboardTileSlide';
import DashboardShadowTile from './DashboardShadowTile';

import {
	formatLastUpdated,
	checkIfLarge,
	shouldUpdate,
	getSensorIconLabelUnit,
} from '../../../Lib';
import i18n from '../../../Translations/common';
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

class SensorDashboardTile extends View<Props, null> {
	props: Props;

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

		const { formatMessage } = this.props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);

		this.labelWatt = formatMessage(i18n.labelWatt);
		this.labelAcc = formatMessage(i18n.acc);

		this.offline = formatMessage(i18n.offline);

		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.getSlideList = this.getSlideList.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, ['displayType', 'tileWidth', 'item']);
	}

	getSlideList(item: Object): Object {
		let slideList = [], sensorInfo = '';
		const { formatMessage } = this.props.intl;

		for (let key in item.data) {
			const { value, scale, name } = item.data[key];
			const isLarge = checkIfLarge(value.toString());

			const { label, unit, icon } = getSensorIconLabelUnit(name, scale, formatMessage);

			let sharedProps = {
				unit,
				label,
				icon,
				isLarge,
			};

			if (name === 'humidity') {
				slideList.push({
					...sharedProps,
					key: 'humidity',
					text: <FormattedNumber value={value}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'temp') {
				slideList.push({
					...sharedProps,
					key: 'temperature',
					text: <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1} minimumFractionDigits={isLarge ? 0 : 1}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtotal') {
				slideList.push({
					...sharedProps,
					key: `rain${key}`,
					text: (name === 'rrate' && <FormattedNumber value={value} maximumFractionDigits={0}/> ),
					text2: (name === 'rtotal' && <FormattedNumber value={value} maximumFractionDigits={0}/> ),
				});
				let rrateInfo = name === 'rrate' ? `${label} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtotal' ? `${label} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let directions = '';
				if (name === 'wdir') {
					directions = [...this._windDirection(value)].toString();
				}
				slideList.push({
					...sharedProps,
					key: `wind${key}`,
					text: (name === 'wavg' && <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}/> ),
					text2: (name === 'wgust' && <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}/> ),
					text3: (name === 'wdir' && this._windDirection(value)),
				});
				let wgustInfo = name === 'wgust' ? `${label} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${label} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${label} ${directions}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				slideList.push({
					...sharedProps,
					key: 'uv',
					text: <FormattedNumber value={value} maximumFractionDigits={0}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'watt') {
				if (scale === '0') {
					sharedProps = { ...sharedProps, label: isLarge ? label :
						`${this.labelAcc} ${this.labelWatt}` };
				}
				slideList.push({
					...sharedProps,
					key: `watt${key}`,
					text: <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'lum') {
				slideList.push({
					...sharedProps,
					key: 'luminance',
					text: <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}
						useGrouping={false}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'dewp') {
				slideList.push({
					...sharedProps,
					key: 'dewpoint',
					text: <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'barpress') {
				slideList.push({
					...sharedProps,
					key: 'barometricpressure',
					text: <FormattedNumber value={value} maximumFractionDigits={isLarge ? 0 : 1}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				slideList.push({
					...sharedProps,
					key: 'genricmeter',
					text: <FormattedNumber value={value} maximumFractionDigits={0}/>,
				});
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
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

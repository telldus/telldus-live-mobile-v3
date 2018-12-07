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
import { StyleSheet } from 'react-native';

import {
	View,
} from '../../../../BaseComponents';
import DashboardShadowTile from './DashboardShadowTile';
import TypeBlockDB from './Sensor/TypeBlockDB';
import GenericSensor from './Sensor/GenericSensor';

import {
	formatLastUpdated,
	checkIfLarge,
	shouldUpdate,
	getSensorInfo,
	getWindDirection,
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
		let slideList = {}, sensorAccessibilityInfo = '';
		const { intl } = this.props;
		const { formatMessage } = intl;

		const {
			iconStyle,
			valueUnitCoverStyle,
			valueStyle,
			unitStyle,
			labelStyle,
			sensorValueCoverStyle,
		} = this.getStyles();

		for (let key in item.data) {
			const { value, scale, name } = item.data[key];
			const isLarge = checkIfLarge(value.toString());

			const { label, unit, icon, sensorInfo, formatOptions } = getSensorInfo(name, scale, value, isLarge, formatMessage);

			let sharedProps = {
				key,
				unit,
				label,
				icon,
				isLarge,
				name,
				value,
				iconStyle,
				valueUnitCoverStyle,
				valueStyle,
				unitStyle,
				labelStyle,
				sensorValueCoverStyle,
				formatOptions,
			};
			sensorAccessibilityInfo = `${sensorAccessibilityInfo}, ${sensorInfo}`;

			if (name === 'wdir') {
				sharedProps = { ...sharedProps, value: getWindDirection(value, formatMessage) };
			}
			slideList[key] = <GenericSensor {...sharedProps}/>;
		}

		return {slideList, sensorAccessibilityInfo};
	}

	render(): Object {
		const { item, tileWidth, isGatewayActive, intl, onPress } = this.props;
		const { slideList, sensorAccessibilityInfo } = this.getSlideList(item);

		const { lastUpdated } = item;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);
		const lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);

		const accessibilityLabel = `${this.labelSensor} ${item.name}, ${sensorAccessibilityInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;

		let iconContainerStyle = !isGatewayActive ? styles.itemIconContainerOffline : styles.itemIconContainerActive;
		let background = Object.keys(slideList).length === 0 ? (isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor) : 'transparent';
		const {
			sensorValueCover,
			dotCoverStyle,
			dotStyle,
		} = this.getStyles();

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={item.state !== 0}
				name={item.name}
				info={lastUpdatedValue}
				icon={'sensor'}
				iconStyle={{
					color: '#fff',
					fontSize: Math.floor(tileWidth / 6.5),
					borderRadius: Math.floor(tileWidth / 8),
					textAlign: 'center',
					alignSelf: 'center',
				}}
				iconContainerStyle={[iconContainerStyle, {
					width: Math.floor(tileWidth / 4),
					height: Math.floor(tileWidth / 4),
					borderRadius: Math.floor(tileWidth / 8),
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
				<TypeBlockDB
					sensors={slideList}
					onPress={onPress}
					id={item.id}
					lastUpdated={lastUpdated}
					style={[styles.body, {
						width: tileWidth,
						height: tileWidth * 0.4,
						backgroundColor: background,
					}]}
					valueCoverStyle={sensorValueCover}
					dotCoverStyle={dotCoverStyle}
					dotStyle={dotStyle}/>
			</DashboardShadowTile>
		);
	}

	getStyles(): Object {
		const { tileWidth, isGatewayActive, item } = this.props;

		const backgroundColor = isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor;

		const dotSize = tileWidth * 0.045;

		return {
			iconStyle: {
				fontSize: tileWidth * 0.28,
			},
			valueUnitCoverStyle: {
				height: tileWidth * 0.16,
			},
			valueStyle: {
				fontSize: tileWidth * 0.14,
				height: tileWidth * 0.16,
			},
			unitStyle: {
				fontSize: tileWidth * 0.09,
			},
			labelStyle: {
				fontSize: tileWidth * 0.09,
				height: tileWidth * 0.12,
			},
			sensorValueCoverStyle: {
				marginBottom: Object.keys(item.data).length <= 1 ? 0 : tileWidth * 0.1,
			},
			sensorValueCover: {
				height: '100%',
				width: tileWidth,
				backgroundColor: backgroundColor,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			dotCoverStyle: {
				position: 'absolute',
				width: '100%',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				bottom: 3,
			},
			dotStyle: {
				width: dotSize,
				height: dotSize,
				borderRadius: dotSize / 2,
				marginLeft: 2 + (dotSize * 0.2),
			},
		};
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

module.exports = SensorDashboardTile;

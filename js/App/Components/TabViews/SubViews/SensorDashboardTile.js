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
import { connect } from 'react-redux';

import {
	View,
	Text,
} from '../../../../BaseComponents';
import DashboardShadowTile from './DashboardShadowTile';
import TypeBlockDB from './Sensor/TypeBlockDB';
import GenericSensor from './Sensor/GenericSensor';
import LastUpdatedInfo from './Sensor/LastUpdatedInfo';

import {
	formatLastUpdated,
	checkIfLarge,
	shouldUpdate,
	getSensorInfo,
	getWindDirection,
	getSensorScalesOnDb,
	SENSOR_KEY,
} from '../../../Lib';
import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

import {
	withTheme,
} from '../../HOC/withTheme';

type Props = {
	item: Object,
	tileWidth: number,
	displayType: string,
	sensorTypesInCurrentDb: Object | null,
	colors: Object,
	colorScheme: string,
	themeInApp: string,
	selectedThemeSet: Object,
	dBTileDisplayMode: string,

	style: Object,
	onPress: (number, string) => void,
	intl: Object,
	isGatewayActive: boolean,
	navigation: Object,
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
		return shouldUpdate(this.props, nextProps, [
			'displayType',
			'tileWidth',
			'item',
			'sensorTypesInCurrentDb',
			'themeInApp',
			'colorScheme',
			'selectedThemeSet',
			'dBTileDisplayMode',
		]);
	}

	getSlideList(item: Object): Object {
		let slideList = {}, sensorAccessibilityInfo = '';
		const { intl, sensorTypesInCurrentDb } = this.props;
		const { formatMessage } = intl;

		const {
			iconStyle,
			valueUnitCoverStyle,
			valueStyle,
			unitStyle,
			labelStyle,
			sensorValueCoverStyle,
		} = this.getStyles();

		const _data = sensorTypesInCurrentDb || item.data;
		for (let key in _data) {
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
				isDB: true,
			};
			sensorAccessibilityInfo = `${sensorAccessibilityInfo}, ${sensorInfo}`;

			if (name === 'wdir') {
				sharedProps = { ...sharedProps, value: getWindDirection(value, formatMessage) };
			}
			slideList[key] = <GenericSensor {...sharedProps}/>;
		}

		return {slideList, sensorAccessibilityInfo};
	}

	getLastUpdated = (lastUpdated: string, minutesAgo: number, gatewayTimezone: string): Object => {
		const { isGatewayActive, intl } = this.props;
		const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));

		return (
			<>
				{isGatewayActive ?
					<LastUpdatedInfo
						value={-seconds}
						numeric="auto"
						updateIntervalInSeconds={60}
						gatewayTimezone={gatewayTimezone}
						timestamp={lastUpdated}
						level={minutesAgo < 1440 ? 25 : 8}
						textStyle={{
							textAlign: 'center',
							textAlignVertical: 'center',
							fontSize: Math.floor(this.props.tileWidth / 12),
							opacity: minutesAgo < 1440 ? 1 : 0.5,
						}} />
					:
					<Text style={{
						textAlign: 'center',
						textAlignVertical: 'center',
						fontSize: Math.floor(this.props.tileWidth / 12),
						color: Theme.Core.rowTextColor,
					}}>
						{intl.formatMessage(i18n.offline)}
					</Text>
				}
			</>
		);
	}

	onPressTile = () => {
		const { onPress, item } = this.props;
		onPress(item.id, SENSOR_KEY);
	}

	onPressIconRight = () => {
		const { navigation, item } = this.props;
		navigation.navigate('SensorDetails', {
			screen: 'SHistory',
			params: {
				id: item.id,
			},
			id: item.id,
		});
	}

	render(): Object {
		const {
			item,
			tileWidth,
			isGatewayActive,
			intl,
			colors,
			themeInApp,
			colorScheme,
			selectedThemeSet,
			dBTileDisplayMode,
		} = this.props;
		const { slideList, sensorAccessibilityInfo } = this.getSlideList(item);
		const isBroard = dBTileDisplayMode !== 'compact';
		const {
			lastUpdated,
			gatewayTimezone,
			keepHistory,
		} = item;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);
		const lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);

		const {
			sensorValueCover,
			dotCoverStyle,
			dotStyle,
			itemIconContainerOffline,
			itemIconContainerActive,
		} = this.getStyles();

		const info = this.getLastUpdated(lastUpdated, minutesAgo, gatewayTimezone);

		const accessibilityLabel = `${this.labelSensor} ${item.name}, ${sensorAccessibilityInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;

		let iconContainerStyle = !isGatewayActive ? itemIconContainerOffline : itemIconContainerActive;
		let background = Object.keys(slideList).length === 0 ? (isGatewayActive ? colors.sensorValueBGColor : Theme.Core.offlineColor) : 'transparent';

		const iconColor = selectedThemeSet.key === 1 ? colors.baseColor : (!isGatewayActive ? Theme.Core.offlineColor : colors.baseColor);

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={item.state !== 0}
				name={item.name}
				info={info}
				icon={'sensor'}
				iconStyle={{
					color: iconColor,
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
				iconRight={keepHistory ? 'sensorhistory' : undefined}
				onPressIconRight={this.onPressIconRight}
				type={'sensor'}
				tileWidth={tileWidth}
				accessibilityLabel={accessibilityLabel}
				formatMessage={intl.formatMessage}
				style={[
					this.props.style, {
						width: tileWidth,
						height: (isBroard ? tileWidth : (tileWidth * 0.52)),
					},
				]}
				titleStyle={isBroard ? {} : {
					color: minutesAgo < 1440 ? colors.baseColorTwo : colors.colorTimeExpired,
					opacity: minutesAgo < 1440 ? 1 : 0.5,
				}}>
				<TypeBlockDB
					sensors={slideList}
					onPress={this.onPressTile}
					id={item.id}
					lastUpdated={lastUpdated}
					tileWidth={tileWidth}
					style={[styles.body, {
						width: tileWidth,
						height: tileWidth * (isBroard ? 0.4 : 0.3),
						backgroundColor: background,
					}]}
					valueCoverStyle={sensorValueCover}
					dotCoverStyle={dotCoverStyle}
					dotStyle={dotStyle}
					extraData={{
						themeInApp,
						colorScheme,
						background,
						isBroard,
					}}/>
			</DashboardShadowTile>
		);
	}

	getStyles(): Object {
		const {
			tileWidth,
			isGatewayActive,
			item,
			colors,
			selectedThemeSet,
			dBTileDisplayMode,
		} = this.props;
		const { data = {}} = item;

		const dotSize = tileWidth * 0.045;

		const {
			sensorValueBGColor,
			itemIconBGColor,
			itemIconBGColorOffline,
		} = colors;
		const isBroard = dBTileDisplayMode !== 'compact';

		const backgroundColor = isGatewayActive ? sensorValueBGColor : Theme.Core.offlineColor;

		return {
			iconStyle: {
				fontSize: tileWidth * (isBroard ? 0.28 : 0.2),
			},
			valueUnitCoverStyle: {
				height: tileWidth * 0.16,
			},
			valueStyle: {
				fontSize: tileWidth * 0.14,
				height: tileWidth * 0.175,
			},
			unitStyle: {
				fontSize: tileWidth * 0.09,
			},
			labelStyle: {
				fontSize: tileWidth * 0.09,
				height: tileWidth * 0.12,
				textAlignVertical: 'center',
			},
			sensorValueCoverStyle: {
				marginBottom: (Object.keys(data).length <= 1 || !isBroard) ? 0 : tileWidth * 0.1,
			},
			sensorValueCover: {
				height: '100%',
				width: tileWidth,
				backgroundColor,
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
			itemIconContainerActive: {
				backgroundColor: selectedThemeSet.key === 2 ? 'transparent' : itemIconBGColor,
			},
			itemIconContainerOffline: {
				backgroundColor: selectedThemeSet.key === 2 ? 'transparent' : itemIconBGColorOffline,
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
});

function mapStateToProps(state: Object, props: Object): Object {
	const { defaultSettings } = state.app;
	const { sensorsById = {} } = state.dashboard;

	const {
		activeDashboardId,
		dBTileDisplayMode,
	} = defaultSettings;
	const { userId } = state.user;
	const { id } = props.item || {};

	const userDbsAndSensorsById = sensorsById[userId] || {};
	const sensorsByIdInCurrentDb = userDbsAndSensorsById[activeDashboardId] || {};

	const sensorInCurrentDb = sensorsByIdInCurrentDb[id];
	let _selectedScales = getSensorScalesOnDb(sensorInCurrentDb);

	return {
		sensorTypesInCurrentDb: _selectedScales,
		dBTileDisplayMode,
	};
}

module.exports = (connect(mapStateToProps, null)(withTheme(SensorDashboardTile, true)): Object);

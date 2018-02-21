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
import { TouchableWithoutFeedback, UIManager, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';
import { SwipeRow } from 'react-native-swipe-list-view';

import { FormattedMessage, ListItem, Text, View, BlockIcon } from '../../../../BaseComponents';
import HiddenRow from './Sensor/HiddenRow';
import GenericSensor from './Sensor/GenericSensor';

import i18n from '../../../Translations/common';

import { formatLastUpdated, checkIfLarge } from 'Lib';
import { utils, actions } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;
const { Dashboard: { getSupportedDisplayTypes } } = actions;

import Theme from '../../../Theme';

const directions = [
	'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N',
];

type Props = {
	sensor: Object,
	intl: Object,
	currentTab: string,
	currentScreen: string,
	appLayout: Object,
	isGatewayActive: boolean,
	tab: string,
	setIgnoreSensor: (Object) => void,
};

type State = {
	currentIndex: number,
	isOpen: boolean,
}

class SensorRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

	onLayout: (Object) => void;
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
	labelGenricMeter: string;
	labelTimeAgo: string;
	width: number;
	offline: string;
	sensorTypes: Object;
	changeDisplayType: (number) => void;
	LayoutLinear: Object;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreSensor: () => void;

	state = {
		currentIndex: 0,
		isOpen: false,
	};

	constructor(props: Props) {
		super(props);
		this.width = 0;
		let { formatMessage } = props.intl;

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
		this.labelGenricMeter = formatMessage(i18n.labelGenricMeter);
		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.offline = formatMessage(i18n.offline);

		this.sensorTypes = getSensorTypes();

		this.onLayout = this.onLayout.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);
		this.onSetIgnoreSensor = this.onSetIgnoreSensor.bind(this);

		this.onRowOpen = this.onRowOpen.bind(this);
		this.onRowClose = this.onRowClose.bind(this);

		UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		this.LayoutLinear = {
			duration: 200,
			create: {
				type: LayoutAnimation.Types.linear,
				property: LayoutAnimation.Properties.opacity,
			  },
			update: {
			  type: LayoutAnimation.Types.linear,
			},
		};
	}

	componentWillReceiveProps(nextProps: Object) {
		let { tab } = nextProps;
		if (tab !== 'sensorsTab' && this.state.isOpen) {
			this.refs.SwipeRow.closeRow();
		}
	}

	onRowOpen() {
		this.setState({
			isOpen: true,
		});
	}

	onRowClose() {
		this.setState({
			isOpen: false,
		});
	}

	onSetIgnoreSensor() {
		this.props.setIgnoreSensor(this.props.sensor);
	}

	getSensors(data: Object): Object {
		let sensors = [], sensorInfo = '';
		for (let key in data) {
			let values = data[key];
			let { value, scale, name } = values;
			let sensorType = this.sensorTypes[values.name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];
			let isLarge = checkIfLarge(value.toString());
			if (name === 'humidity') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'humidity'} label={this.labelHumidity} isLarge={isLarge} key={key}/>);
				sensorInfo = `${sensorInfo}, ${this.labelHumidity} ${value}${unit}`;
			}
			if (name === 'temp') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'temperature'} label={this.labelTemperature} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 1, minimumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelTemperature} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtot') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'rain'} label={name === 'rrate' ? this.labelRainRate : this.labelRainTotal}
					isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>);

				let rrateInfo = name === 'rrate' ? `${this.labelRainRate} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtot' ? `${this.labelRainTotal} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let direction = '', label = name === 'wgust' ? this.labelWindGust : this.labelWindAverage;
				if (name === 'wdir') {
					const getWindDirection = sValue => directions[Math.floor(sValue / 22.5)];
					direction = [...getWindDirection(value)].toString();
					value = getWindDirection(value);
					label = this.labelWindDirection;
				}
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'wind'} isLarge={isLarge} label={label} key={key}
					formatOptions={{maximumFractionDigits: 1}}/>);

				let wgustInfo = name === 'wgust' ? `${this.labelWindGust} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${this.labelWindAverage} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${this.labelWindDirection} ${direction}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'uv'} label={this.labelUVIndex} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelUVIndex} ${value}${unit}`;
			}
			if (name === 'watt') {
				let label = this.labelEnergy;
				if (scale === '0') {
					label = isLarge ? `${this.labelAccumulated} ${this.labelWatt}` :
						`${this.labelAcc} ${this.labelWatt}`;
				}
				if (scale === '2') {
					label = this.labelWatt;
				}
				if (scale === '3') {
					label = this.labelPulse;
				}
				if (scale === '4') {
					label = this.labelVoltage;
				}
				if (scale === '5') {
					label = this.labelCurrent;
				}
				if (scale === '6') {
					label = this.labelPowerFactor;
				}
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'watt'} label={label} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelWatt} ${value}${unit}`;
			}
			if (name === 'luminance') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'luminance'} label={this.labelLuminance} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelLuminance} ${value}${unit}`;
			}
			if (name === 'dewp') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'humidity'} label={this.labelDewPoint} key={key} isLarge={isLarge}
					formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelDewPoint} ${value}${unit}`;
			}
			if (name === 'barpress') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'guage'} label={this.labelBarometricPressure} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelBarometricPressure} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				sensors.push(<GenericSensor name={name} value={value} unit={unit}
					icon={'sensor'} label={this.labelGenricMeter} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 1}}/>);
				sensorInfo = `${sensorInfo}, ${this.labelGenricMeter} ${value}${unit}`;
			}
		}
		return {sensors, sensorInfo};
	}

	render() {
		const { sensor, currentTab, currentScreen, appLayout, isGatewayActive, intl } = this.props;
		const styles = this.getStyles(appLayout, isGatewayActive);
		const {
			data,
			name,
			lastUpdated,
		} = sensor;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

		let { sensors, sensorInfo } = this.getSensors(data);
		let lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);
		let accessibilityLabel = `${this.labelSensor}, ${name}, ${sensorInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;
		let accessible = currentTab === 'Sensors' && currentScreen === 'Tabs';

		let { currentIndex } = this.state;

		return (
			<SwipeRow
				rightOpenValue={-Theme.Core.buttonWidth * 2}
				disableRightSwipe={true}
				ref="SwipeRow"
				onRowOpen={this.onRowOpen}
				onRowClose={this.onRowClose}>
				<HiddenRow sensor={sensor} intl={intl} onSetIgnoreSensor={this.onSetIgnoreSensor}/>
				<ListItem
					style={styles.row}
					onLayout={this.onLayout}
					accessible={accessible}
					importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
					accessibilityLabel={accessible ? accessibilityLabel : ''}>
					<TouchableWithoutFeedback style={styles.container}>
						<View style={styles.container}>
							<BlockIcon icon="sensor" style={styles.sensorIcon} containerStyle={styles.iconContainerStyle}/>
							<View>
								<Text style={[styles.name, { opacity: sensor.name ? 1 : 0.5 }]}
									ellipsizeMode="middle"
									numberOfLines={1}>
									{sensor.name ? sensor.name : <FormattedMessage {...i18n.noName} /> }
								</Text>
								<Text style={[
									styles.time, {
										color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
										opacity: minutesAgo < 1440 ? 1 : 0.5,
									},
								]}>
									{isGatewayActive ?
										<Text style={styles.time}>
											{lastUpdatedValue}
										</Text>
										:
										<Text style={{color: Theme.Core.rowTextColor}}>
											{this.offline}
										</Text>
									}
								</Text>
							</View>
						</View>
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback onPress={this.changeDisplayType} style={styles.sensorValueCover}>
						<View style={styles.sensorValueCover}>
							{sensors[currentIndex] && (
								sensors[currentIndex]
							)}
						</View>
					</TouchableWithoutFeedback>
				</ListItem>
			</SwipeRow>
		);
	}

	changeDisplayType(index: number) {
		let { data } = this.props.sensor;
		let { currentIndex } = this.state;
		let displayTypes = getSupportedDisplayTypes(data);
		let nextIndex = currentIndex + 1;
		nextIndex = nextIndex > (displayTypes.length - 1) ? 0 : nextIndex;
		LayoutAnimation.configureNext(this.LayoutLinear);
		this.setState({
			currentIndex: nextIndex,
		});
	}

	onLayout(event: Object) {
		this.width = event.nativeEvent.layout.width;
	}

	getStyles(appLayout: Object, isGatewayActive: boolean): Object {

		let backgroundColor = isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor;

		return {
			container: {
				flex: 1,
				backgroundColor: 'transparent',
				flexDirection: 'row',
				alignItems: 'center',
				marginTop: 5,
			},
			name: {
				color: Theme.Core.rowTextColor,
				fontSize: 15,
				marginBottom: 2,
			},
			row: {
				marginHorizontal: 12,
				marginBottom: 5,
				backgroundColor: '#FFFFFF',
				flexDirection: 'row',
				height: Theme.Core.rowHeight,
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'center',
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			sensorIcon: {
				fontSize: 16,
			},
			iconContainerStyle: {
				borderRadius: 25,
				width: 25,
				height: 25,
				backgroundColor: backgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: 5,
			},
			time: {
				fontSize: 12,
				color: Theme.Core.rowTextColor,
			},
			scrollView: {
				alignSelf: 'stretch',
				maxWidth: 216,
				flexDirection: 'row',
			},
			sensorValueCover: {
				width: Theme.Core.buttonWidth * 2,
				backgroundColor: backgroundColor,
				height: Theme.Core.rowHeight,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		tab: store.navigation.tab,
	};
}

module.exports = connect(mapStateToProps, null)(SensorRow);

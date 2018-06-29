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
import { TouchableOpacity, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import { SwipeRow } from 'react-native-swipe-list-view';
import DeviceInfo from 'react-native-device-info';
import isEqual from 'lodash/isEqual';

import { ListItem, Text, View, BlockIcon } from '../../../../BaseComponents';
import HiddenRow from './Sensor/HiddenRow';
import GenericSensor from './Sensor/GenericSensor';
import TypeBlock from './Sensor/TypeBlock';

import i18n from '../../../Translations/common';

import { formatLastUpdated, checkIfLarge } from '../../../Lib';
import { utils } from 'live-shared-data';
const { sensorUtils } = utils;
const { getSensorTypes, getSensorUnits } = sensorUtils;

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
	onHiddenRowOpen: (string) => void,
	propsSwipeRow: Object,
	defaultType?: string,
};

type State = {
	isOpen: boolean,
	forceClose: boolean,
	showFullName: boolean,
	coverMaxWidth: number,
	coverOccupiedWidth: number,
	buttonsWidth?: number,
};

class SensorRow extends View<Props, State> {
	props: Props;
	state: State;

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
	helpViewHiddenRow: string;
	helpCloseHiddenRow: string;

	onLayout: (Object) => void;
	LayoutLinear: Object;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreSensor: () => void;
	onPressSensorName: () => void;

	onLayoutDeviceName: (Object) => void;
	onLayoutCover: (Object) => void;
	onLayoutButtons: (Object) => void;
	animatedWidth: any;
	isAnimating: boolean;
	animatedScaleX: any;
	isTablet: boolean;

	state = {
		isOpen: false,
		forceClose: false,
		showFullName: false,
		coverMaxWidth: 0,
		coverOccupiedWidth: 0,
		buttonsWidth: undefined,
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
		this.labelGenericMeter = formatMessage(i18n.labelGenericMeter);
		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.offline = formatMessage(i18n.offline);

		this.helpViewHiddenRow = formatMessage(i18n.helpViewHiddenRow);
		this.helpCloseHiddenRow = formatMessage(i18n.helpCloseHiddenRow);

		this.sensorTypes = getSensorTypes();

		this.onLayout = this.onLayout.bind(this);
		this.onSetIgnoreSensor = this.onSetIgnoreSensor.bind(this);

		this.onRowOpen = this.onRowOpen.bind(this);
		this.onRowClose = this.onRowClose.bind(this);
		this.onPressSensorName = this.onPressSensorName.bind(this);

		this.onLayoutDeviceName = this.onLayoutDeviceName.bind(this);
		this.onLayoutCover = this.onLayoutCover.bind(this);
		this.onLayoutButtons = this.onLayoutButtons.bind(this);

		this.animatedWidth = null;
		this.animatedScaleX = new Animated.Value(1);
		this.isAnimating = false;

		this.isTablet = DeviceInfo.isTablet();
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { tab, propsSwipeRow, sensor } = this.props;
		const { isOpen } = this.state;
		let { idToKeepOpen, forceClose } = propsSwipeRow;
		if (isOpen && (tab !== 'Sensors' || (forceClose && sensor.id !== idToKeepOpen)) ) {
			this.refs.SwipeRow.closeRow();
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const isStateEqual = isEqual(this.state, nextState);
		const isPropsEqual = isEqual(this.props, nextProps);

		return (!isStateEqual || !isPropsEqual);
	}

	onRowOpen() {
		this.setState({
			isOpen: true,
			forceClose: false,
		});
		let { onHiddenRowOpen, sensor } = this.props;
		if (onHiddenRowOpen) {
			onHiddenRowOpen(sensor.id);
		}
	}

	onRowClose() {
		this.setState({
			isOpen: false,
			forceClose: false,
		});
	}

	onSetIgnoreSensor() {
		this.props.setIgnoreSensor(this.props.sensor);
	}

	onPressSensorName() {
		let { showFullName, coverOccupiedWidth, coverMaxWidth, isOpen } = this.state;
		if (isOpen) {
			this.refs.SwipeRow.closeRow();
		} else if (coverOccupiedWidth >= coverMaxWidth || showFullName) {
			if (!showFullName) {
				this.isAnimating = true;
				this.setState({
					showFullName: true,
				}, () => {
					this.showFullName(200, 10, Easing.linear());
				});
			} else {
				this.isAnimating = true;
				this.setState({
					showFullName: false,
				}, () => {
					this.hideFullName(200, 10, Easing.linear());
				});
			}
		}
	}

	showFullName(duration: number, delay: number, easing: any) {
		Animated.parallel([
			this.reduceButtons(duration, delay, easing),
			this.scaleDown(duration, delay, easing),
		]).start();
	}

	hideFullName(duration: number, delay: number, easing: any) {
		Animated.parallel([
			this.expandButtons(duration, delay, easing),
			this.scaleUp(duration, delay, easing),
		]).start();
	}

	scaleDown(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedScaleX, {
			duration,
			delay,
			toValue: 0,
			easing,
		  }).start();
	}

	scaleUp(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedScaleX, {
			duration,
			delay,
			toValue: 1,
			easing,
		  }).start();
	}

	reduceButtons(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedWidth, {
			duration,
			delay,
			toValue: 0,
			easing,
		  }).start(({finished}: Object) => {
			  if (finished) {
				this.isAnimating = false;
			  }
		  });
	}

	expandButtons(duration: number, delay: number, easing: any) {
		Animated.timing(this.animatedWidth, {
			duration,
			delay,
			toValue: this.state.buttonsWidth,
			easing,
		  }).start(({finished}: Object) => {
			if (finished) {
			  this.isAnimating = false;
			}
		});
	}

	onLayoutDeviceName(ev: Object) {
		if (!this.state.showFullName) {
			let { x, width } = ev.nativeEvent.layout;
			// adding a const to the calculated space as some text seem to leave extra space in the right after truncating.
			const maxRightPadd = 12;
			this.setState({
				coverOccupiedWidth: width + x + maxRightPadd,
			});
		}
	}

	onLayoutCover(ev: Object) {
		if (!this.state.showFullName) {
			let { width } = ev.nativeEvent.layout;
			this.setState({
				coverMaxWidth: width,
			});
		}
	}

	onLayoutButtons(ev: Object) {
		let { buttonsWidth } = this.state;
		if (!buttonsWidth) {
			this.animatedWidth = new Animated.Value(ev.nativeEvent.layout.width);
			this.setState({
				buttonsWidth: ev.nativeEvent.layout.width,
			});
		}
	}

	getSensors(data: Object): Object {
		let sensors = {}, sensorInfo = '';
		for (let key in data) {
			let values = data[key];
			let { value, scale, name } = values;
			let sensorType = this.sensorTypes[values.name];
			let sensorUnits = getSensorUnits(sensorType);
			let unit = sensorUnits[scale];
			let isLarge = checkIfLarge(value.toString());
			if (name === 'humidity') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'humidity'} label={this.labelHumidity} isLarge={isLarge} key={key}/>;
				sensorInfo = `${sensorInfo}, ${this.labelHumidity} ${value}${unit}`;
			}
			if (name === 'temp') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'temperature'} label={this.labelTemperature} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1, minimumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${this.labelTemperature} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtot') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'rain'} label={name === 'rrate' ? this.labelRainRate : this.labelRainTotal}
					isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>;

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
					label = this.labelWindDirection;
				}
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'wind'} isLarge={isLarge} label={label} key={key}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;

				let wgustInfo = name === 'wgust' ? `${this.labelWindGust} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${this.labelWindAverage} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${this.labelWindDirection} ${direction}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'uv'} label={this.labelUVIndex} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>;
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
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'watt'} label={label} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${labelWatt} ${value}${unit}`;
			}
			if (name === 'lum') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'luminance'} label={this.labelLuminance} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: 0}}/>;
				sensorInfo = `${sensorInfo}, ${this.labelLuminance} ${value}${unit}`;
			}
			if (name === 'dewp') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'humidity'} label={this.labelDewPoint} key={key} isLarge={isLarge}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${this.labelDewPoint} ${value}${unit}`;
			}
			if (name === 'barpress') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'guage'} label={this.labelBarometricPressure} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${this.labelBarometricPressure} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				sensors[key] = <GenericSensor name={name} value={value} unit={unit}
					icon={'sensor'} label={this.labelGenericMeter} isLarge={isLarge} key={key}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${this.labelGenericMeter} ${value}${unit}`;
			}
		}
		return {sensors, sensorInfo};
	}

	render(): Object {
		const { sensor, currentTab, currentScreen, appLayout, isGatewayActive, intl } = this.props;
		const styles = this.getStyles(appLayout, isGatewayActive);
		const {
			data,
			name,
			lastUpdated,
			id,
		} = sensor;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

		let { sensors, sensorInfo } = this.getSensors(data);

		let lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);
		let { isOpen, coverOccupiedWidth, coverMaxWidth } = this.state;

		let sensorName = name ? name : intl.formatMessage(i18n.noName);
		let accessibilityLabelPhraseOne = `${this.labelSensor}, ${sensorName}, ${sensorInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;
		let accessible = currentTab === 'Sensors' && currentScreen === 'Tabs';
		let accessibilityLabelPhraseTwo = isOpen ? this.helpCloseHiddenRow : this.helpViewHiddenRow;
		let accessibilityLabel = `${accessibilityLabelPhraseOne}, ${accessibilityLabelPhraseTwo}`;

		const interpolatedScale = this.animatedScaleX.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: [0, 1, 1],
		});

		const nameInfo = this.getNameInfo(sensor, sensorName, minutesAgo, lastUpdatedValue, isGatewayActive, styles);

		return (
			<SwipeRow
				ref="SwipeRow"
				rightOpenValue={-Theme.Core.buttonWidth * 2}
				disableRightSwipe={true}
				onRowOpen={this.onRowOpen}
				onRowClose={this.onRowClose}
				recalculateHiddenLayout={true}
				swipeToOpenPercent={20}
				directionalDistanceChangeThreshold={2}>
				<HiddenRow sensor={sensor} intl={intl} style={styles.hiddenRow}
					onSetIgnoreSensor={this.onSetIgnoreSensor} isOpen={isOpen}/>
				<ListItem
					style={styles.row}
					onLayout={this.onLayout}
					accessible={accessible}
					importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
					accessibilityLabel={accessible ? accessibilityLabel : ''}
					// By passing onPress to visible content of 'SwipeRow', prevents it from
					// being placed inside a touchable.
					onPress={this.noOp}>
					<View style={styles.cover}>
						<TouchableOpacity onPress={this.onPressSensorName} disabled={coverOccupiedWidth < coverMaxWidth}
							style={styles.container} accessible={false} importantForAccessibility="no-hide-descendants">
							<BlockIcon icon="sensor" style={styles.sensorIcon} containerStyle={styles.iconContainerStyle}/>
							{nameInfo}
						</TouchableOpacity>
						<TypeBlock
							sensors={sensors}
							id={id}
							onLayout={this.onLayoutButtons}
							style={[styles.sensorValueCover, {
								width: this.animatedWidth,
								transform: [{
									scaleX: interpolatedScale,
								}],
							}]}
							valueCoverStyle={styles.sensorValueCover}
							dotCoverStyle={styles.dotCoverStyle}
							dotStyle={styles.dotStyle}/>
					</View>
				</ListItem>
			</SwipeRow>
		);
	}

	getNameInfo(sensor: Object, sensorName: string, minutesAgo: number, lastUpdatedValue: string, isGatewayActive: boolean, styles: Object): Object {
		let { name, nameTablet, time, timeTablet } = styles;
		let coverStyle = name;
		let textInfoStyle = time;
		if (this.isTablet) {
			coverStyle = nameTablet;
			textInfoStyle = timeTablet;
		}
		return (
			<View style={coverStyle} onLayout={this.onLayoutCover}>
				<Text style={[styles.nameText, { opacity: sensor.name ? 1 : 0.5 }]}
					ellipsizeMode="middle"
					numberOfLines={1}
					onLayout={this.onLayoutDeviceName}>
					{sensorName}
				</Text>
				{isGatewayActive ?
					<Text style={[
						textInfoStyle, {
							color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
							opacity: minutesAgo < 1440 ? 1 : 0.5,
						},
					]}>
						{lastUpdatedValue}
					</Text>
					:
					<Text style={[
						textInfoStyle, {
							color: Theme.Core.rowTextColor,
							opacity: minutesAgo < 1440 ? 1 : 0.5,
						},
					]}>
						{this.offline}
					</Text>
				}
			</View>
		);
	}

	onLayout(event: Object) {
		this.width = event.nativeEvent.layout.width;
	}

	getStyles(appLayout: Object, isGatewayActive: boolean): Object {
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		let {
			rowHeight,
			maxSizeRowTextOne,
			maxSizeRowTextTwo,
			buttonWidth,
		} = Theme.Core;

		let nameFontSize = Math.floor(deviceWidth * 0.047);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		let infoFontSize = Math.floor(deviceWidth * 0.039);
		infoFontSize = infoFontSize > maxSizeRowTextTwo ? maxSizeRowTextTwo : infoFontSize;

		let backgroundColor = isGatewayActive ? Theme.Core.brandPrimary : Theme.Core.offlineColor;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const widthValueBlock = (buttonWidth * 2) + 6;
		const dotSize = widthValueBlock * 0.05;

		return {
			container: {
				flex: 1,
				backgroundColor: 'transparent',
				flexDirection: 'row',
				alignItems: 'center',
				marginTop: 5,
			},
			name: {
				flex: 1,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			nameTablet: {
				flex: 1,
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				flexDirection: 'row',
			},
			nameText: {
				color: Theme.Core.rowTextColor,
				fontSize: nameFontSize,
				marginBottom: 2,
				marginRight: 4,
			},
			row: {
				marginHorizontal: padding,
				marginBottom: padding / 2,
				backgroundColor: '#FFFFFF',
				height: rowHeight,
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			hiddenRow: {
				flexDirection: 'row',
				height: Theme.Core.rowHeight,
				width: Theme.Core.buttonWidth * 2,
				alignSelf: 'flex-end',
				justifyContent: 'center',
				alignItems: 'center',
				marginRight: padding,
			},
			cover: {
				flex: 1,
				overflow: 'hidden',
				borderRadius: 2,
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'center',
				flexDirection: 'row',
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
				color: Theme.Core.rowTextColor,
				fontSize: infoFontSize,
				textAlignVertical: 'center',
			},
			timeTablet: {
				marginRight: 6,
				marginTop: infoFontSize * 0.411,
				color: Theme.Core.rowTextColor,
				fontSize: infoFontSize,
				textAlignVertical: 'center',
			},
			scrollView: {
				alignSelf: 'stretch',
				maxWidth: 216,
				flexDirection: 'row',
			},
			sensorValueCover: {
				width: widthValueBlock,
				backgroundColor: backgroundColor,
				height: rowHeight,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			dotCoverStyle: {
				width: '100%',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				position: 'absolute',
				bottom: 2 + (dotSize * 0.2),
			},
			dotStyle: {
				width: dotSize,
				height: dotSize,
				borderRadius: dotSize / 2,
				marginLeft: 2 + (dotSize * 0.2),
			},
		};
	}

	noOp() {
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		tab: store.navigation.tab,
	};
}

module.exports = connect(mapStateToProps, null)(SensorRow);

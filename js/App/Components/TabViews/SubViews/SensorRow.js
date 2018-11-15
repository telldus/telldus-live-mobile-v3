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
import { SwipeRow } from 'react-native-swipe-list-view';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');
import moment from 'moment';

import {
	ListItem,
	Text,
	View,
	BlockIcon,
	FormattedRelative,
} from '../../../../BaseComponents';
import HiddenRow from './Sensor/HiddenRow';
import GenericSensor from './Sensor/GenericSensor';
import TypeBlockList from './Sensor/TypeBlockList';

import i18n from '../../../Translations/common';

import {
	formatLastUpdated,
	checkIfLarge,
	shouldUpdate,
	getSensorIconLabelUnit,
	getWindDirection,
} from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
	sensor: Object,
	intl: Object,
	currentScreen: string,
	appLayout: Object,
	isGatewayActive: boolean,
	propsSwipeRow: Object,
	defaultType?: string,
	setIgnoreSensor: (Object) => void,
	onHiddenRowOpen: (string) => void,
	onSettingsSelected: Object => void,
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
	labelWatt: string;
	labelAcc: string;
	labelTimeAgo: string;
	width: number;
	offline: string;
	sensorTypes: Object;
	helpViewHiddenRow: string;
	helpCloseHiddenRow: string;

	LayoutLinear: Object;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreSensor: () => void;
	onPressSensorName: () => void;
	onSettingsSelected: (Object) => void;
	closeSwipeRow: () => void;

	onLayoutDeviceName: (Object) => void;
	onLayoutCover: (Object) => void;
	onLayoutButtons: (Object) => void;
	animatedWidth: any;
	isAnimating: boolean;
	animatedScaleX: any;
	isTablet: boolean;

	formatSensorLastUpdate: (string) => string;

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

		const { formatMessage } = props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);

		this.labelWatt = formatMessage(i18n.labelWatt);
		this.labelAcc = formatMessage(i18n.acc);

		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.offline = formatMessage(i18n.offline);

		this.helpViewHiddenRow = formatMessage(i18n.helpViewHiddenRow);
		this.helpCloseHiddenRow = formatMessage(i18n.helpCloseHiddenRow);

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

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
		this.closeSwipeRow = this.closeSwipeRow.bind(this);

		this.formatSensorLastUpdate = this.formatSensorLastUpdate.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { propsSwipeRow: nextPropsSwipeRow, currentScreen: currentScreenN, ...nextOtherProps } = nextProps;
		if (currentScreenN === 'Sensors') {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { propsSwipeRow, currentScreen, ...otherProps } = this.props;// eslint-disable-line		
			const { idToKeepOpen, forceClose } = nextPropsSwipeRow;
			const { sensor } = otherProps;

			if (forceClose && this.state.isOpen && idToKeepOpen !== sensor.id) {
				return true;
			}

			const propsChange = shouldUpdate(otherProps, nextOtherProps, [
				'appLayout', 'sensor', 'isGatewayActive', 'defaultType',
			]);
			if (propsChange) {
				return true;
			}

			return false;
		}
		if (currentScreenN !== 'Sensors' && this.state.isOpen) {
			return true;
		}

		return false;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { currentScreen, propsSwipeRow, sensor } = this.props;
		const { isOpen } = this.state;
		const { idToKeepOpen, forceClose } = propsSwipeRow;
		if (isOpen && (currentScreen !== 'Sensors' || (forceClose && sensor.id !== idToKeepOpen)) ) {
			this.closeSwipeRow();
		}
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
			this.closeSwipeRow();
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


	closeSwipeRow() {
		this.refs.SwipeRow.closeRow();
	}

	onSettingsSelected() {
		this.props.onSettingsSelected(this.props.sensor);
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
		const { x, width } = ev.nativeEvent.layout;
		const { coverMaxWidth } = this.state;
		// adding a const to the calculated space as some text seem to leave extra space in the right after truncating.
		const maxRightPadd = 12;
		const newOccWidth = width + x + maxRightPadd;
		if (!this.state.showFullName && (newOccWidth !== coverMaxWidth)) {
			this.setState({
				coverOccupiedWidth: newOccWidth,
			});
		}
	}

	onLayoutCover(ev: Object) {
		const { coverMaxWidth } = this.state;
		const { width } = ev.nativeEvent.layout;
		if (!this.state.showFullName && (coverMaxWidth !== width)) {
			this.setState({
				coverMaxWidth: width,
			});
		}
	}

	onLayoutButtons(ev: Object) {
		const { buttonsWidth } = this.state;
		if (!buttonsWidth) {
			this.animatedWidth = new Animated.Value(ev.nativeEvent.layout.width);
			this.setState({
				buttonsWidth: ev.nativeEvent.layout.width,
			});
		}
	}

	formatSensorLastUpdate(time: string): string {
		const timeAgo = time.replace(/[0-9]/g, '').trim();

		const { formatRelative, formatMessage } = this.props.intl;
		const now = moment().unix();

		// 'now' from 'FormattedRelative' matches only when 1 sec is added to moment.unix()
		// This prevent from showing 'in 1 second' which is illogic!
		const relNextSec = formatRelative(moment.unix(now).add(1, 'seconds')).replace(/[0-9]/g, '').trim();// As a CAUTION
		const relNextSecs = formatRelative(moment.unix(now).add(3, 'seconds')).replace(/[0-9]/g, '').trim();// As a CAUTION

		const relNow = formatRelative(moment.unix(now)).replace(/[0-9]/g, '').trim();
		const secondAgo = formatRelative(moment.unix(now).subtract(1, 'seconds')).replace(/[0-9]/g, '').trim();
		const secondsAgo = formatRelative(moment.unix(now).subtract(2, 'seconds')).replace(/[0-9]/g, '').trim();
		if (timeAgo === relNextSec || timeAgo === relNextSecs || timeAgo === relNow || timeAgo === secondAgo || timeAgo === secondsAgo) {
			return formatMessage(i18n.justNow);
		}

		return time;
	}

	getSensors(data: Object, styles: Object): Object {
		let sensors = {}, sensorInfo = '';
		const { formatMessage } = this.props.intl;
		const {
			valueUnitCoverStyle,
			valueStyle,
			unitStyle,
			labelStyle,
			sensorValueCoverStyle,
		} = styles;

		for (let key in data) {
			const values = data[key];
			const { value, scale, name } = values;
			const isLarge = checkIfLarge(value.toString());

			const { label, unit, icon } = getSensorIconLabelUnit(name, scale, formatMessage);

			let sharedProps = {
				key,
				name,
				value,
				unit,
				label,
				icon,
				isLarge,
				valueUnitCoverStyle,
				valueStyle,
				unitStyle,
				labelStyle,
				sensorValueCoverStyle,
			};

			if (name === 'humidity') {
				sensors[key] = <GenericSensor {...sharedProps}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'temp') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1, minimumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'rrate' || name === 'rtot') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: 0}}/>;

				let rrateInfo = name === 'rrate' ? `${label} ${value}${unit}` : '';
				let rtotalInfo = name === 'rtot' ? `${label} ${value}${unit}` : '';
				sensorInfo = `${sensorInfo}, ${rrateInfo}, ${rtotalInfo}`;
			}
			if (name === 'wgust' || name === 'wavg' || name === 'wdir') {
				let direction = '';
				if (name === 'wdir') {
					direction = [...getWindDirection(value, formatMessage)].toString();
					sharedProps = { ...sharedProps, value: getWindDirection(value, formatMessage) };
				}
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;

				let wgustInfo = name === 'wgust' ? `${label} ${value}${unit}` : '';
				let wavgInfo = name === 'wavg' ? `${label} ${value}${unit}` : '';
				let wdirInfo = name === 'wdir' ? `${label} ${direction}` : '';
				sensorInfo = `${sensorInfo}, ${wgustInfo}, ${wavgInfo}, ${wdirInfo}`;
			}
			if (name === 'uv') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: 0}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'watt') {
				if (scale === '0') {
					sharedProps = { ...sharedProps, label: isLarge ? label :
						`${this.labelAcc} ${this.labelWatt}` };
				}
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'lum') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: 0}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'dewp') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'barpress') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
			if (name === 'genmeter') {
				sensors[key] = <GenericSensor {...sharedProps}
					formatOptions={{maximumFractionDigits: isLarge ? 0 : 1}}/>;
				sensorInfo = `${sensorInfo}, ${label} ${value}${unit}`;
			}
		}
		return {sensors, sensorInfo};
	}

	render(): Object {
		const { sensor, currentScreen, isGatewayActive, intl } = this.props;
		const styles = this.getStyles();
		const {
			data,
			name,
			lastUpdated,
			id,
		} = sensor;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

		let { sensors, sensorInfo } = this.getSensors(data, styles);

		let lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);
		let { isOpen, coverOccupiedWidth, coverMaxWidth } = this.state;

		let sensorName = name ? name : intl.formatMessage(i18n.noName);
		let accessibilityLabelPhraseOne = `${this.labelSensor}, ${sensorName}, ${sensorInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;
		let accessible = currentScreen === 'Sensors';
		let accessibilityLabelPhraseTwo = isOpen ? this.helpCloseHiddenRow : this.helpViewHiddenRow;
		let accessibilityLabel = `${accessibilityLabelPhraseOne}, ${accessibilityLabelPhraseTwo}`;

		const interpolatedScale = this.animatedScaleX.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: [0, 1, 1],
		});

		const nameInfo = this.getNameInfo(sensor, sensorName, minutesAgo, lastUpdated, isGatewayActive, styles);

		return (
			<SwipeRow
				ref="SwipeRow"
				rightOpenValue={-Theme.Core.buttonWidth * 2}
				disableRightSwipe={true}
				onRowOpen={this.onRowOpen}
				onRowClose={this.onRowClose}
				swipeToOpenPercent={20}
				directionalDistanceChangeThreshold={2}>
				<HiddenRow sensor={sensor} intl={intl} style={styles.hiddenRow}
					onSetIgnoreSensor={this.onSetIgnoreSensor} isOpen={isOpen}
					onPressSettings={this.onSettingsSelected}/>
				<ListItem
					style={styles.row}
					accessible={accessible}
					importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
					accessibilityLabel={accessible ? accessibilityLabel : ''}
					// By passing onPress to visible content of 'SwipeRow', prevents it from
					// being placed inside a touchable.
					onPress={this.noOp}>
					<View style={styles.cover}>
						<TouchableOpacity onPress={this.onPressSensorName} disabled={!isOpen && coverOccupiedWidth < coverMaxWidth}
							style={styles.container} accessible={false} importantForAccessibility="no-hide-descendants">
							<BlockIcon icon="sensor" style={styles.sensorIcon} containerStyle={styles.iconContainerStyle}/>
							{nameInfo}
						</TouchableOpacity>
						<TypeBlockList
							sensors={sensors}
							lastUpdated={lastUpdated}
							id={id}
							isOpen={isOpen}
							closeSwipeRow={this.closeSwipeRow}
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
					<FormattedRelative
						value={moment.unix(lastUpdatedValue)}
						formatterFunction={this.formatSensorLastUpdate}
						textStyle={[
							textInfoStyle, {
								color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
								opacity: minutesAgo < 1440 ? 1 : 0.5,
							},
						]}/>
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

	getStyles(): Object {
		const { appLayout, isGatewayActive, sensor } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
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
		const dotSize = rowHeight * 0.09;

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
				height: rowHeight,
				width: buttonWidth * 2,
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
			sensorValueCoverStyle: {
				marginBottom: Object.keys(sensor.data).length <= 1 ? 0 : rowHeight * 0.16,
			},
			sensorValueCover: {
				width: widthValueBlock,
				backgroundColor: backgroundColor,
				height: rowHeight,
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			dotCoverStyle: {
				position: 'absolute',
				width: '100%',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				bottom: 5,
			},
			dotStyle: {
				width: dotSize,
				height: dotSize,
				borderRadius: dotSize / 2,
				marginLeft: 2 + (dotSize * 0.2),
			},
			valueUnitCoverStyle: {
				height: rowHeight * 0.39,
			},
			valueStyle: {
				fontSize: rowHeight * 0.33,
				height: rowHeight * 0.39,
			},
			unitStyle: {
				fontSize: rowHeight * 0.2,
			},
			labelStyle: {
				fontSize: rowHeight * 0.21,
				height: rowHeight * 0.3,
			},
		};
	}

	noOp() {
	}
}

module.exports = SensorRow;

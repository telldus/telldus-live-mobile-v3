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
import { TouchableOpacity } from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');

import {
	Text,
	View,
	BlockIcon,
} from '../../../../BaseComponents';
import HiddenRow from './Sensor/HiddenRow';
import GenericSensor from './Sensor/GenericSensor';
import TypeBlockList from './Sensor/TypeBlockList';
import LastUpdatedInfo from './Sensor/LastUpdatedInfo';
import Battery from '../../SensorDetails/SubViews/Battery';

import i18n from '../../../Translations/common';

import {
	withTheme,
} from '../../HOC/withTheme';

import {
	formatLastUpdated,
	checkIfLarge,
	shouldUpdate,
	getSensorInfo,
	getWindDirection,
	getBatteryPercentage,
	showBatteryStatus,
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
	screenReaderEnabled: boolean,
	isLast: boolean,
	batteryStatus: string,
	toggleDialogueBox: Function,

	isNew: boolean,
	gatewayId: string,

	colors: Object,
	colorScheme: string,
	themeInApp: string,
	selectedThemeSet: Object,

	setIgnoreSensor: (Object) => void,
	onHiddenRowOpen: (string) => void,
	onSettingsSelected: Object => void,
};

type State = {
	isOpen: boolean,
	forceClose: boolean,
};

class SensorRow extends View<Props, State> {
	props: Props;
	state: State;

	labelSensor: string;
	labelTimeAgo: string;
	width: number;
	offline: string;
	sensorTypes: Object;

	LayoutLinear: Object;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreSensor: () => void;
	onSettingsSelected: (Object) => void;
	closeSwipeRow: () => void;

	isTablet: boolean;

	shouldUpdateSwipeRow: (Object) => boolean;

	state = {
		isOpen: false,
		forceClose: false,
	};

	constructor(props: Props) {
		super(props);

		const { formatMessage } = props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);

		this.labelTimeAgo = formatMessage(i18n.labelTimeAgo);

		this.offline = formatMessage(i18n.offline);

		this.onSetIgnoreSensor = this.onSetIgnoreSensor.bind(this);

		this.onRowOpen = this.onRowOpen.bind(this);
		this.onRowClose = this.onRowClose.bind(this);

		this.isTablet = DeviceInfo.isTablet();

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
		this.closeSwipeRow = this.closeSwipeRow.bind(this);

		this.shouldUpdateSwipeRow = this.shouldUpdateSwipeRow.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { propsSwipeRow: nextPropsSwipeRow, currentScreen: currentScreenN, ...nextOtherProps } = nextProps;
		const { propsSwipeRow, currentScreen, ...otherProps } = this.props;// eslint-disable-line
		if (currentScreenN === 'Sensors') {
			// Force re-render once to gain/loose accessibility
			if (currentScreen !== 'Sensors' && nextProps.screenReaderEnabled) {
				return true;
			}
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { idToKeepOpen, forceClose } = nextPropsSwipeRow;
			const { sensor } = otherProps;

			if (forceClose && this.state.isOpen && idToKeepOpen !== sensor.id) {
				return true;
			}

			const propsChange = shouldUpdate(otherProps, nextOtherProps, [
				'appLayout',
				'sensor',
				'isGatewayActive',
				'defaultType',
				'isLast',
				'isNew',
				'gatewayId',
				'themeInApp',
				'colorScheme',
				'selectedThemeSet',
				'batteryStatus',
			]);
			if (propsChange) {
				return true;
			}

			return false;
		}
		// Force re-render once to gain/loose accessibility
		if (currentScreenN !== 'Sensors' && currentScreen === 'Sensors' && nextProps.screenReaderEnabled) {
			return true;
		}

		const themeHasChanged = shouldUpdate(otherProps, nextOtherProps, [
			'themeInApp',
			'colorScheme',
			'selectedThemeSet',
		]);
		if (themeHasChanged) {
			return true;
		}

		return false;
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { currentScreen, propsSwipeRow, sensor } = this.props;
		const { isOpen } = this.state;
		const { idToKeepOpen, forceClose } = propsSwipeRow;
		if (isOpen && (currentScreen !== 'Sensors' || (forceClose && sensor.id !== idToKeepOpen))) {
			this.closeSwipeRow();
		}
	}

	shouldUpdateSwipeRow(items: Object): boolean {
		return true;
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

	closeSwipeRow() {
		this.refs.SwipeRow.closeRow();
	}

	onSettingsSelected() {
		this.closeSwipeRow();
		this.props.onSettingsSelected(this.props.sensor);
	}

	getSensors(data: Object, styles: Object): Object {
		let sensors = {}, sensorAccessibilityInfo = '';
		const { formatMessage } = this.props.intl;
		const {
			valueUnitCoverStyle,
			valueStyle,
			unitStyle,
			labelStyle,
			sensorValueCoverStyle,
			iconStyle,
		} = styles;

		for (let key in data) {
			const values = data[key];
			const { value, scale, name } = values;
			const isLarge = checkIfLarge(value.toString());

			const { label, unit, icon, sensorInfo, formatOptions } = getSensorInfo(name, scale, value, isLarge, formatMessage);

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
				formatOptions,
				iconStyle,
			};
			sensorAccessibilityInfo = `${sensorAccessibilityInfo}, ${sensorInfo}`;

			if (name === 'wdir') {
				sharedProps = { ...sharedProps, value: getWindDirection(value, formatMessage) };
			}
			sensors[key] = <GenericSensor {...sharedProps} />;
		}
		return { sensors, sensorAccessibilityInfo };
	}

	render(): Object {
		const {
			sensor = {},
			currentScreen,
			isGatewayActive,
			intl,
			screenReaderEnabled,
			batteryStatus,
			toggleDialogueBox,
		} = this.props;
		const styles = this.getStyles();
		const {
			data = {},
			name,
			lastUpdated,
			id,
			battery,
		} = sensor;
		const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

		let { sensors, sensorAccessibilityInfo } = this.getSensors(data, styles);

		let lastUpdatedValue = formatLastUpdated(minutesAgo, lastUpdated, intl.formatMessage);
		let { isOpen } = this.state;

		let sensorName = name ? name : intl.formatMessage(i18n.noName);
		let accessibilityLabelPhraseOne = `${this.labelSensor}, ${sensorName}, ${sensorAccessibilityInfo}, ${this.labelTimeAgo} ${lastUpdatedValue}`;
		let accessible = currentScreen === 'Sensors';
		let accessibilityLabelPhraseTwo = intl.formatMessage(i18n.accessibilityLabelViewSD);
		let accessibilityLabel = `${accessibilityLabelPhraseOne}, ${accessibilityLabelPhraseTwo}`;

		const nameInfo = this.getNameInfo(sensor, sensorName, minutesAgo, lastUpdated, isGatewayActive, styles);
		const percentage = getBatteryPercentage(battery);
		const showBattery = showBatteryStatus({
			percentage,
			batteryStatus,
		});

		return (
			<SwipeRow
				ref="SwipeRow"
				rightOpenValue={-Theme.Core.buttonWidth * 2}
				disableRightSwipe={true}
				disableLeftSwipe={screenReaderEnabled}
				onRowOpen={this.onRowOpen}
				onRowClose={this.onRowClose}
				swipeToOpenPercent={20}
				directionalDistanceChangeThreshold={2}
				disableHiddenLayoutCalculation={true}
				shouldItemUpdate={this.shouldUpdateSwipeRow}>
				<HiddenRow
					sensor={sensor}
					intl={intl}
					style={styles.hiddenRow}
					onSetIgnoreSensor={this.onSetIgnoreSensor}
					isOpen={isOpen}
					onPressSettings={this.onSettingsSelected}
					toggleDialogueBox={toggleDialogueBox}/>
				<View
					level={2}
					style={styles.row}
					accessible={false}
					importantForAccessibility={accessible ? 'no' : 'no-hide-descendants'}
					// By passing onPress to visible content of 'SwipeRow', prevents it from
					// being placed inside a touchable.
					onPress={this.noOp}>
					<View style={styles.cover}>
						<TouchableOpacity
							onPress={this.onSettingsSelected}
							style={styles.container}
							accessible={accessible}
							importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
							accessibilityLabel={accessible ? accessibilityLabel : ''}>
							<View
								style={{
									flex: 0,
									flexDirection: 'column',
									alignItems: 'center',
								}}>
								<BlockIcon icon="sensor" style={styles.sensorIcon} containerStyle={styles.iconContainerStyle} />
								{(!!battery && battery !== 254) && showBattery && (
									<Battery
										value={percentage}
										appLayout={styles.appLayout}
										style={styles.batteryStyle}
										nobStyle={styles.nobStyle}/>
								)}
							</View>
							{nameInfo}
						</TouchableOpacity>
						<TypeBlockList
							sensors={sensors}
							lastUpdated={lastUpdated}
							id={id}
							isOpen={isOpen}
							closeSwipeRow={this.closeSwipeRow}
							style={styles.sensorValueCover}
							valueCoverStyle={styles.sensorValueCover}
							dotCoverStyle={styles.dotCoverStyle}
							dotStyle={styles.dotStyle} />
					</View>
				</View>
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

		const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdatedValue));

		return (
			<View style={coverStyle}>
				<Text
					level={25}
					style={[styles.nameText, { opacity: sensor.name ? 1 : 0.5 }]}
					ellipsizeMode="middle"
					numberOfLines={1}>
					{sensorName}
				</Text>
				{isGatewayActive ?
					<LastUpdatedInfo
						value={-seconds}
						numeric="auto"
						updateIntervalInSeconds={60}
						timestamp={lastUpdatedValue}
						gatewayTimezone={sensor.gatewayTimezone}
						level={minutesAgo < 1440 ? 25 : 8}
						textStyle={[
							textInfoStyle, {
								opacity: minutesAgo < 1440 ? 1 : 0.5,
							},
						]} />
					:
					<Text
						level={26}
						style={textInfoStyle}>
						{this.offline}
					</Text>
				}
			</View>
		);
	}

	getStyles(): Object {
		const {
			appLayout,
			isGatewayActive,
			sensor = {},
			isLast,
			isNew,
			colors,
			selectedThemeSet,
		} = this.props;
		const { data = {} } = sensor;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			rowHeight,
			maxSizeRowTextOne,
			maxSizeRowTextTwo,
			buttonWidth,
			offlineColor,
			fontSizeFactorOne,
			fontSizeFactorThree,
		} = Theme.Core;

		const {
			sensorValueBGColor,
			inAppBrandSecondary,
			itemIconBGColor,
		} = colors;

		let nameFontSize = Math.floor(deviceWidth * fontSizeFactorOne);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		let infoFontSize = Math.floor(deviceWidth * fontSizeFactorThree);
		infoFontSize = infoFontSize > maxSizeRowTextTwo ? maxSizeRowTextTwo : infoFontSize;

		let backgroundColor = isGatewayActive ? sensorValueBGColor : offlineColor;
		const backgroundColorIcon = selectedThemeSet.key === 2 ? 'transparent' : isGatewayActive ? itemIconBGColor : offlineColor;
		const iconColor = (selectedThemeSet.key === 2 && !isGatewayActive) ? offlineColor : colors.baseColor;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const widthValueBlock = (buttonWidth * 2) + 6;
		const dotSize = rowHeight * 0.09;

		const iconSize = 22;
		const batteryHeight = 9;

		return {
			appLayout,
			batteryStyle: {
				height: batteryHeight,
				width: 17,
			},
			nobStyle: {
				height: Math.floor(batteryHeight * 0.47),
				width: Math.floor(batteryHeight * 0.2),
				overflow: 'hidden',
				borderTopRightRadius: Math.floor(batteryHeight * 0.17),
				borderBottomRightRadius: Math.floor(batteryHeight * 0.17),
			},
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
				marginLeft: 6,
			},
			nameTablet: {
				flex: 1,
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				flexDirection: 'row',
				marginLeft: 6,
			},
			nameText: {
				fontSize: nameFontSize,
				marginBottom: 2,
				marginRight: 4,
			},
			row: {
				marginHorizontal: padding,
				marginTop: padding / 2,
				marginBottom: isLast ? padding : 0,
				height: rowHeight,
				borderRadius: 2,
				...Theme.Core.shadow,
				borderWidth: isNew ? 2 : 0,
				borderColor: isNew ? inAppBrandSecondary : 'transparent',
			},
			hiddenRow: {
				flexDirection: 'row',
				height: rowHeight,
				width: buttonWidth * 2,
				alignSelf: 'flex-end',
				justifyContent: 'center',
				alignItems: 'center',
				marginRight: padding,
				marginTop: padding / 2,
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
				fontSize: iconSize,
				color: iconColor,
			},
			iconContainerStyle: {
				borderRadius: 25,
				width: 25,
				height: 25,
				backgroundColor: backgroundColorIcon,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: 5,
			},
			time: {
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
				marginBottom: Object.keys(data).length <= 1 ? 0 : rowHeight * 0.16,
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
			iconStyle: {
				fontSize: rowHeight * 0.63,
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

module.exports = (withTheme(SensorRow): Object);

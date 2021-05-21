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
import { SwipeRow } from 'react-native-swipe-list-view';
import { TouchableOpacity, PixelRatio } from 'react-native';
import DeviceInfo from 'react-native-device-info';
const isEqual = require('react-fast-compare');

import {
	Text,
	View,
	BlockIcon,
} from '../../../../BaseComponents';
import ToggleButton from './ToggleButton';
import RGBButton from './RGBButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';
import HiddenRow from './Device/HiddenRow';
import ShowMoreButton from './Device/ShowMoreButton';
import ThermostatButton from './Thermostat/ThermostatButton';
import MultiActionModal from './Device/MultiActionModal';
import Battery from '../../SensorDetails/SubViews/Battery';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import {
	getLabelDevice,
	shouldUpdate,
	getPowerConsumed,
	getDeviceIcons,
	getDeviceActionIcon,
	getOffColorRGB,
	getMainColorRGB,
	prepareMainColor,
	getThermostatValue,
	getMatchingSensorInfo,
	getBatteryPercentage,
	showBatteryStatus,
} from '../../../Lib';
import i18n from '../../../Translations/common';

import Theme from '../../../Theme';


type Props = PropsThemedComponent & {
	device: Object,
	setScrollEnabled: boolean,
	intl: Object,
	currentScreen: string,
	appLayout: Object,
	isGatewayActive: boolean,
	isLast: boolean,
	isNew: boolean,
	gatewayId: string,
	powerConsumed: string | null,
	currentTemp?: number,
	propsSwipeRow: Object,
	offColorMultiplier: number,
	onColorMultiplier: number,
	battery?: number,
	batteryStatus: string,

	onBell: (number) => void,
	onDown: (number) => void,
	onUp: (number) => void,
	onStop: (number) => void,
	onDimmerSlide: (number) => void,
	onDim: (number) => void,
	onTurnOn: (number) => void,
	onTurnOff: (number) => void,
	onSettingsSelected: (Object) => void,
	setIgnoreDevice: (Object) => void,
	onPressMore: (Array<Object>) => void,
	onHiddenRowOpen: (string) => void,
	onPressDimButton: (device: Object) => void,
	onPressDeviceAction: () => void,
	screenReaderEnabled: boolean,
	openRGBControl: (number) => void,
	openThermostatControl: (number) => void,
	toggleDialogueBox: Function,
};

type State = {
	disableSwipe: boolean,
	isOpen: boolean,
	forceClose: boolean,
	showMoreActions: boolean,
};
class DeviceRow extends View<Props, State> {
	props: Props;
	state: State;

	onSettingsSelected: Object => void;
	onSlideActive: () => void;
	onSlideComplete: () => void;
	onRowOpen: () => void;
	onRowClose: () => void;
	onSetIgnoreDevice: () => void;
	onPressMore: (Object) => void;
	closeMoreActions: () => void;
	isTablet: boolean;
	closeSwipeRow: () => void;

	shouldUpdateSwipeRow: (Object) => boolean;

	state = {
		disableSwipe: false,
		isOpen: false,
		forceClose: false,
		showMoreActions: false,
		sliderValue: 10,
	};

	constructor(props: Props) {
		super(props);

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
		this.onSlideActive = this.onSlideActive.bind(this);
		this.onSlideComplete = this.onSlideComplete.bind(this);
		this.onSetIgnoreDevice = this.onSetIgnoreDevice.bind(this);

		this.onRowOpen = this.onRowOpen.bind(this);
		this.onRowClose = this.onRowClose.bind(this);
		this.onPressMore = this.onPressMore.bind(this);
		this.closeMoreActions = this.closeMoreActions.bind(this);

		this.isTablet = DeviceInfo.isTablet();
		this.closeSwipeRow = this.closeSwipeRow.bind(this);
		this.shouldUpdateSwipeRow = this.shouldUpdateSwipeRow.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { propsSwipeRow: nextPropsSwipeRow, currentScreen: currentScreenN, ...nextOtherProps } = nextProps;
		const { propsSwipeRow, currentScreen, ...otherProps } = this.props;// eslint-disable-line
		if (currentScreenN === 'Devices') {
			// Force re-render once to gain/loose accessibility
			if (currentScreen !== 'Devices' && nextProps.screenReaderEnabled) {
				return true;
			}
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { idToKeepOpen, forceClose } = nextPropsSwipeRow;
			const { device } = otherProps;

			if (forceClose && this.state.isOpen && idToKeepOpen !== device.id) {
				return true;
			}

			const propsChange = shouldUpdate(otherProps, nextOtherProps, [
				'appLayout',
				'device',
				'setScrollEnabled',
				'isGatewayActive',
				'powerConsumed',
				'isNew',
				'gatewayId',
				'isLast',
				'currentTemp',
				'offColorMultiplier',
				'onColorMultiplier',
				'themeInApp',
				'colorScheme',
				'dark',
				'selectedThemeSet',
				'battery',
				'batteryStatus',
			]);
			if (propsChange) {
				return true;
			}
		}
		if (currentScreenN !== 'Devices' && this.state.isOpen) {
			return true;
		}
		// Force re-render once to gain/loose accessibility
		if (currentScreenN !== 'Devices' && currentScreen === 'Devices' && nextProps.screenReaderEnabled) {
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
		let {
			currentScreen,
			propsSwipeRow,
			device,
		} = this.props;
		const { isOpen } = this.state;
		let { idToKeepOpen, forceClose } = propsSwipeRow;
		if (isOpen && (currentScreen !== 'Devices' || (forceClose && device.id !== idToKeepOpen)) ) {
			this.closeSwipeRow();
		}
	}

	shouldUpdateSwipeRow(items: Object): boolean {
		return true;
	}

	onSlideActive() {
		this.setState({
			disableSwipe: true,
		});
	}

	onSlideComplete() {
		this.setState({
			disableSwipe: false,
		});
	}

	onRowOpen() {
		this.setState({
			isOpen: true,
			forceClose: false,
		});
		let { onHiddenRowOpen, device } = this.props;
		if (onHiddenRowOpen) {
			onHiddenRowOpen(device.id);
		}
	}

	onRowClose() {
		this.setState({
			isOpen: false,
			forceClose: false,
		});
	}

	onSettingsSelected() {
		this.closeSwipeRow();
		this.props.onSettingsSelected(this.props.device);
	}

	onSetIgnoreDevice() {
		this.props.setIgnoreDevice(this.props.device);
	}

	closeSwipeRow() {
		this.refs.SwipeRow.closeRow();
	}

	openRGBControl = () => {
		const { openRGBControl, device } = this.props;
		const { showMoreActions } = this.state;
		if (showMoreActions) {
			this.setState({
				showMoreActions: false,
			}, () => {
				openRGBControl(device.id);
			});
		} else {
			openRGBControl(device.id);
		}
	}

	render(): Object {
		let button = [];
		let { isOpen, showMoreActions } = this.state;
		const {
			device,
			intl,
			currentScreen,
			appLayout,
			isGatewayActive,
			powerConsumed,
			onPressDimButton,
			onPressDeviceAction,
			screenReaderEnabled,
			currentTemp,
			offColorMultiplier,
			onColorMultiplier,
			dark,
			colors,
			selectedThemeSet,
			battery,
			batteryStatus,
			toggleDialogueBox,
		} = this.props;
		const { isInState, name, deviceType, supportedMethods = {}, stateValues = {} } = device;
		const styles = this.getStyles(appLayout, isGatewayActive, isInState);
		const deviceName = name ? name : intl.formatMessage(i18n.noName);
		const showDeviceIcon = PixelRatio.getPixelSizeForLayoutSize(appLayout.width) >= 750;

		const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
			RGB,
			THERMOSTAT,
		} = supportedMethods;

		const actionIcons = getDeviceActionIcon(deviceType, isInState, supportedMethods);
		const sharedProps = {
			device,
			isOpen,
			intl,
			isGatewayActive,
			appLayout,
			actionIcons,
			closeSwipeRow: this.closeSwipeRow,
			onPressDeviceAction: onPressDeviceAction,
		};
		const icon = getDeviceIcons(deviceType);

		let { RGB: rgbValue } = stateValues;
		let colorDeviceIconBack = styles.iconContainerStyle.backgroundColor;
		let offColorRGB, iconOffColor, iconOnColor, iconOnBGColor, preparedMainColorRgb;
		if (typeof rgbValue !== 'undefined' && isGatewayActive) {
			let mainColorRGB = getMainColorRGB(rgbValue);

			offColorRGB = getOffColorRGB(mainColorRGB, offColorMultiplier, {
				isDarkMode: dark,
			});
			iconOffColor = offColorRGB;

			preparedMainColorRgb = prepareMainColor(mainColorRGB, onColorMultiplier, {
				isDarkMode: dark,
				colorWhenWhite: colors.inAppBrandSecondary,
			});
			colorDeviceIconBack = preparedMainColorRgb;
			iconOnColor = colorDeviceIconBack;
			iconOnBGColor = colorDeviceIconBack;

			colorDeviceIconBack = isInState === 'TURNOFF' ? iconOffColor : colorDeviceIconBack;
		}
		colorDeviceIconBack = colorDeviceIconBack ? colorDeviceIconBack : styles.iconContainerStyle.backgroundColor;

		// NOTE: the prop "key" serves two purpose.
		// 1. The common and strict rule, when rendering array of items key(unique) prop is required.
		// 2. The same prop is used/accessed inside "TabViews/SubViews/Device/MultiActionModal.js" to override the style
		// in the case of device groups.
		if (BELL) {
			button.unshift(
				<BellButton
					{...sharedProps}
					style={styles.bell}
					key={4}
				/>
			);
		}
		if (UP || DOWN || STOP) {
			button.unshift(
				<NavigationalButton
					{...sharedProps}
					style={styles.navigation}
					showStopButton={!TURNON && !TURNOFF && !BELL && !DIM}
					key={1}
				/>
			);
		}
		if (DIM && !RGB && !THERMOSTAT) {
			button.unshift(
				<DimmerButton
					{...sharedProps}
					setScrollEnabled={this.props.setScrollEnabled}
					showSlider={!BELL && !UP && !DOWN && !STOP}
					onSlideActive={this.onSlideActive}
					onSlideComplete={this.onSlideComplete}
					onPressDimButton={onPressDimButton}
					key={2}
				/>
			);
		}
		if ((TURNON || TURNOFF) && !DIM && !RGB && !THERMOSTAT) {
			button.unshift(
				<ToggleButton
					{...sharedProps}
					style={styles.toggle}
					key={3}
				/>
			);
		}
		if (RGB) {
			button.unshift(
				<RGBButton
					{...sharedProps}
					onColorMultiplier={onColorMultiplier}
					offColorMultiplier={offColorMultiplier}
					openRGBControl={this.openRGBControl}
					setScrollEnabled={this.props.setScrollEnabled}
					showSlider={!BELL && !UP && !DOWN && !STOP}
					onSlideActive={this.onSlideActive}
					onSlideComplete={this.onSlideComplete}
					key={7}
					offButtonColor={isInState === 'TURNOFF' ? iconOffColor : undefined}
					onButtonColor={isInState === 'TURNON' ? iconOnBGColor : undefined}
					iconOffColor={isInState === 'TURNOFF' ? undefined : iconOffColor}
					iconOnColor={isInState === 'TURNON' ? undefined : iconOnColor}
					preparedMainColorRgb={preparedMainColorRgb}
				/>
			);
		}
		if (THERMOSTAT) {
			button.unshift(
				<ThermostatButton
					{...sharedProps}
					currentTemp={currentTemp}
					key={8}
					style={styles.thermostat}
					openThermostatControl={this.props.openThermostatControl}
				/>
			);
		}
		if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP && !RGB && !THERMOSTAT) {
			button.unshift(
				<ToggleButton
					{...sharedProps}
					style={styles.toggle}
					key={5}
				/>
			);
		}

		let accessible = currentScreen === 'Devices';
		let accessibilityLabel = `${getLabelDevice(intl.formatMessage, device)}, ${intl.formatMessage(i18n.accessibilityLabelViewDD)}`;

		const nameInfo = this.getNameInfo(device, deviceName, powerConsumed, styles);
		const percentage = getBatteryPercentage(battery);
		const showBattery = showBatteryStatus({
			percentage,
			batteryStatus,
		});

		return (
			<View>
				<SwipeRow
					ref="SwipeRow"
					rightOpenValue={-Theme.Core.buttonWidth * 2}
					disableLeftSwipe={this.state.disableSwipe || screenReaderEnabled}
					disableRightSwipe={true}
					onRowOpen={this.onRowOpen}
					onRowClose={this.onRowClose}
					swipeToOpenPercent={20}
					directionalDistanceChangeThreshold={2}
					disableHiddenLayoutCalculation={true}
					shouldItemUpdate={this.shouldUpdateSwipeRow}>
					<HiddenRow
						device={device}
						intl={intl}
						style={styles.hiddenRow}
						onPressSettings={this.onSettingsSelected}
						onSetIgnoreDevice={this.onSetIgnoreDevice}
						isOpen={isOpen}
						toggleDialogueBox={toggleDialogueBox}/>
					<View
						level={2}
						style={styles.row}
						// Fixes issue controlling device in IOS, in accessibility mode
						// By passing onPress to visible content of 'SwipeRow', prevents it from
						// being placed inside a touchable.
						onPress={this.noOp}
						accessible={false}
						importantForAccessibility={accessible ? 'no' : 'no-hide-descendants'}>
						<View style={styles.cover}>
							<TouchableOpacity
								style={[styles.touchableContainer]}
								onPress={this.onSettingsSelected}
								accessible={accessible}
								importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
								accessibilityLabel={accessibilityLabel}>
								{showDeviceIcon && (
									<View style={{
										flex: 0,
										flexDirection: 'column',
										alignItems: 'center',
									}}>
										<BlockIcon
											icon={icon}
											style={[
												styles.deviceIcon,
												{
													color: selectedThemeSet.key === 2 ? colorDeviceIconBack : '#ffffff',
												},
											]}
											containerStyle={[styles.iconContainerStyle, {
												backgroundColor: selectedThemeSet.key === 2 ? 'transparent' : colorDeviceIconBack,
											}]}/>
										{(!!battery && battery !== 254) && showBattery && (
											<Battery
												value={percentage}
												appLayout={styles.appLayout}
												style={styles.batteryStyle}
												nobStyle={styles.nobStyle}/>
										)}
									</View>
								)}
								{nameInfo}
							</TouchableOpacity>
							<View style={styles.buttonsCover}>
								{button.length === 1 ?
									button[0]
									:
									[
										button[0],
										<ShowMoreButton onPress={this.onPressMore} name={name} buttons={button} key={6} intl={intl}/>,
									]
								}
							</View>
						</View>
					</View>
				</SwipeRow>
				{
					button.length !== 1 && (
						<MultiActionModal
							showModal={showMoreActions}
							buttons={button}
							name={name}
							item={device}
							closeModal={this.closeMoreActions}
						/>
					)}
			</View>
		);
	}

	getNameInfo(device: Object, deviceName: string, powerConsumed: string | null, styles: Object): Object {
		let {
			intl,
			currentTemp,
		} = this.props;
		let {
			name,
			nameTablet,
			textPowerConsumed,
			textPowerConsumedTablet,
		} = styles;
		const {
			THERMOSTAT,
		} = device.supportedMethods || {};

		let coverStyle = name;
		let textPowerStyle = textPowerConsumed;
		if (this.isTablet) {
			coverStyle = nameTablet;
			textPowerStyle = textPowerConsumedTablet;
		}

		let info = null;
		if (THERMOSTAT && (typeof currentTemp === 'number' || typeof currentTemp === 'string')) {
			info = `${intl.formatMessage(i18n.labelCurrent)}: ${intl.formatNumber(currentTemp)}°C`;
		} else if (typeof powerConsumed === 'number' || typeof powerConsumed === 'string') {
			info = `${intl.formatNumber(powerConsumed, {maximumFractionDigits: 1})}W`;
		}

		return (
			<View style={coverStyle}>
				<Text
					level={25}
					style={[styles.text, { opacity: device.name ? 1 : 0.5 }]} numberOfLines={1}>
					{deviceName}
				</Text>
				{!!info && (
					<Text
						level={25}
						style = {textPowerStyle} numberOfLines={1}>
						{info}
					</Text>
				)}
			</View>
		);
	}

	onPressMore(buttons: Array<Object>, name: string) {
		const { isOpen } = this.state;
		if (isOpen) {
			this.closeSwipeRow();
			return;
		}
		this.setState({
			showMoreActions: true,
		});
	}

	closeMoreActions() {
		this.setState({
			showMoreActions: false,
		});
	}

	getStyles(appLayout: Object, isGatewayActive: boolean, deviceState: string): Object {
		const { isNew, isLast, colors } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		let {
			rowHeight,
			maxSizeRowTextOne,
			maxSizeRowTextTwo,
			buttonWidth,
			shadow,
			paddingFactor,
			offlineColor,
			fontSizeFactorOne,
			fontSizeFactorThree,
		} = Theme.Core;

		const {
			colorOnActiveBg,
			colorOffActiveBg,
			buttonSeparatorColor,
			inAppBrandSecondary,
		} = colors;

		let nameFontSize = Math.floor(deviceWidth * fontSizeFactorOne);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		let infoFontSize = Math.floor(deviceWidth * fontSizeFactorThree);
		infoFontSize = infoFontSize > maxSizeRowTextTwo ? maxSizeRowTextTwo : infoFontSize;

		let color = (deviceState === 'TURNOFF' || deviceState === 'STOP') ? colorOffActiveBg : colorOnActiveBg;
		let backgroundColor = !isGatewayActive ? offlineColor : color;

		const padding = deviceWidth * paddingFactor;
		const iconSize = 18;
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
			touchableContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			row: {
				marginHorizontal: padding,
				marginTop: padding / 2,
				marginBottom: isLast ? padding : 0,
				height: rowHeight,
				borderRadius: 2,
				...shadow,
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
				justifyContent: 'space-between',
				paddingLeft: 5,
				alignItems: 'stretch',
				flexDirection: 'row',
				borderRadius: 2,
			},
			buttonsCover: {
				justifyContent: 'space-between',
				alignItems: 'center',
				flexDirection: 'row',
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
			text: {
				fontSize: nameFontSize,
				textAlignVertical: 'center',
				textAlign: 'left',
				marginLeft: 6,
				marginRight: 4,
			},
			deviceIcon: {
				fontSize: iconSize,
			},
			iconContainerStyle: {
				backgroundColor,
				borderRadius: 25,
				width: 25,
				height: 25,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: 5,
			},
			toggle: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			},
			thermostat: {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
			},
			bell: {
				justifyContent: 'center',
				alignItems: 'center',
				width: buttonWidth * 2,
				borderLeftWidth: 1,
				borderLeftColor: buttonSeparatorColor,
				height: rowHeight,
			},
			navigation: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			},
			textPowerConsumed: {
				fontSize: infoFontSize,
				textAlignVertical: 'center',
				marginLeft: 6,
			},
			textPowerConsumedTablet: {
				fontSize: infoFontSize,
				textAlignVertical: 'center',
				marginLeft: 6,
				marginRight: 6,
				marginTop: infoFontSize * 0.411,
			},
		};
	}

	noOp() {
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { clientDeviceId, clientId, deviceType } = ownProps.device;
	const powerConsumed = getPowerConsumed(store.sensors.byId, clientDeviceId, clientId, deviceType);
	const currentTemp = getThermostatValue(store.sensors.byId, clientDeviceId, clientId);
	const {
		battery,
	} = getMatchingSensorInfo(store.sensors.byId, clientDeviceId, clientId) || {};

	const { firebaseRemoteConfig = {} } = store.user;
	const { rgb = JSON.stringify({}) } = firebaseRemoteConfig;
	const {
		onColorMultiplier,
		offColorMultiplier,
	} = JSON.parse(rgb);

	return {
		powerConsumed,
		currentTemp,
		onColorMultiplier,
		offColorMultiplier,
		battery,
	};
}

module.exports = (connect(mapStateToProps, null)(withTheme(DeviceRow)): Object);

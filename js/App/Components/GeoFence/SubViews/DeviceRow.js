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
import {
	PixelRatio,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';

import {
	Text,
	View,
	ListItem,
	BlockIcon,
	CheckBoxIconText,
} from '../../../../BaseComponents';
import {
	NavigationalButton,
	BellButton,
	DimmerButton,
	ToggleButton,
	RGBButton,
	ThermostatButton,
} from '../../TabViews/SubViews';
import ShowMoreButton from '../../TabViews/SubViews/Device/ShowMoreButton';

import {
	GeoFenceUtils,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

import {
	getDeviceActionIcon,
	getDeviceIcons,
	getMainColorRGB,
	getOffColorRGB,
	prepareMainColor,
	isValidHexColorCode,
} from '../../../Lib';

const DeviceRow = React.memo<Object>((props: Object): Object => {

	let button = [];
	const {
		device,
		openRGBControl,
		openThermostatControl,
		onDeviceValueChange,
		onChangeSelection,
		isChecked,
		checkBoxId,
	} = props;
	const {
		supportedMethods = {},
		isInState,
		deviceType,
		stateValues = {},
		name,
		id,
	} = device;

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

	const { layout } = useSelector((state: Object): Object => state.app);

	const intl = useIntl();

	const {
		row,
		touchableContainer,
		cover,
		deviceIcon,
		iconContainerStyle,
		nameStyle,
		nameTabletStyle,
		textStyle,
		bellStyle,
		navigationStyle,
		toggle,
		thermostat,
		checkButtonStyle,
		checkIconActiveStyle,
		checkIconInActiveStyle,
	} = getStyles(layout, isInState);

	function setScrollEnabled() {}
	function onSlideActive() {}
	function onSlideComplete() {}

	const actionIcons = getDeviceActionIcon(deviceType, isInState, supportedMethods);

	let { RGB: rgbValue } = stateValues;
	let colorDeviceIconBack = iconContainerStyle.backgroundColor;
	// eslint-disable-next-line no-unused-vars
	let offColorRGB, iconOffColor, iconOnColor, iconOnBGColor;
	if (typeof rgbValue !== 'undefined') {
		let mainColorRGB = isValidHexColorCode(rgbValue) ? rgbValue : getMainColorRGB(rgbValue);

		offColorRGB = getOffColorRGB(mainColorRGB);
		iconOffColor = offColorRGB;

		colorDeviceIconBack = prepareMainColor(mainColorRGB);
		iconOnColor = colorDeviceIconBack;
		iconOnBGColor = colorDeviceIconBack;

		colorDeviceIconBack = isInState === 'TURNOFF' ? Theme.Core.brandPrimary : colorDeviceIconBack;
	}
	colorDeviceIconBack = colorDeviceIconBack ? colorDeviceIconBack : iconContainerStyle.backgroundColor;

	function onPressOverride(args: Object) {
		onDeviceValueChange({
			checkBoxId,
			deviceId: id,
			...args,
		});
	}


	const sharedProps = {
		device,
		intl,
		isGatewayActive: true,
		appLayout: layout,
		actionIcons,
		onPressOverride,
	};

	if (BELL) {
		button.unshift(
			<BellButton
				{...sharedProps}
				style={bellStyle}
				key={4}
			/>
		);
	}
	if (UP || DOWN || STOP) {
		button.unshift(
			<NavigationalButton
				{...sharedProps}
				style={navigationStyle}
				showStopButton={!TURNON && !TURNOFF && !BELL && !DIM}
				key={1}
			/>
		);
	}
	if (DIM && !RGB && !THERMOSTAT) {
		function onPressDimButton() {}
		button.unshift(
			<DimmerButton
				{...sharedProps}
				setScrollEnabled={setScrollEnabled}
				showSlider={!BELL && !UP && !DOWN && !STOP}
				onSlideActive={onSlideActive}
				onSlideComplete={onSlideComplete}
				onPressDimButton={onPressDimButton}
				key={2}
			/>
		);
	}
	if ((TURNON || TURNOFF) && !DIM && !RGB && !THERMOSTAT) {
		button.unshift(
			<ToggleButton
				{...sharedProps}
				style={toggle}
				key={3}
			/>
		);
	}
	if (RGB) {
		function _openRGBControl() {
			openRGBControl(id);
		}
		button.unshift(
			<RGBButton
				{...sharedProps}
				openRGBControl={_openRGBControl}
				setScrollEnabled={setScrollEnabled}
				showSlider={!BELL && !UP && !DOWN && !STOP}
				onSlideActive={onSlideActive}
				onSlideComplete={onSlideComplete}
				key={7}
				offButtonColor={isInState === 'TURNOFF' ? Theme.Core.brandPrimary : undefined}
				onButtonColor={isInState === 'TURNON' ? iconOnBGColor : undefined}
				iconOffColor={isInState === 'TURNOFF' ? undefined : iconOffColor}
				iconOnColor={isInState === 'TURNON' ? undefined : iconOnColor}
			/>
		);
	}
	if (THERMOSTAT) {
		button.unshift(
			<ThermostatButton
				{...sharedProps}
				key={8}
				style={thermostat}
				openThermostatControl={openThermostatControl}
			/>
		);
	}
	if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP && !RGB && !THERMOSTAT) {
		button.unshift(
			<ToggleButton
				{...sharedProps}
				style={toggle}
				key={5}
			/>
		);
	}

	function noOp() {}

	const showDeviceIcon = PixelRatio.getPixelSizeForLayoutSize(layout.width) >= 750;
	const icon = getDeviceIcons(deviceType);

	const deviceName = name ? name : intl.formatMessage(i18n.noName);
	function getNameInfo(): Object {

		let coverStyle = nameStyle;
		if (DeviceInfo.isTablet()) {
			coverStyle = nameTabletStyle;
		}

		return (
			<View style={coverStyle}>
				<Text style = {[textStyle, { opacity: name ? 1 : 0.5 }]} numberOfLines={1}>
					{deviceName}
				</Text>
			</View>
		);
	}

	const nameInfo = getNameInfo();

	function onPressMore() {
	}

	function _onChangeSelection() {
		const data = {
			checkBoxId,
			deviceId: id,
			...GeoFenceUtils.prepareInitialActionFromDeviceState(device),
		};
		onChangeSelection('device', checkBoxId, data);
	}

	const checkIconStyle = isChecked ? checkIconActiveStyle : checkIconInActiveStyle;

	return (
		<ListItem
			style={row}
			// Fixes issue controlling device in IOS, in accessibility mode
			// By passing onPress to visible content of 'SwipeRow', prevents it from
			// being placed inside a touchable.
			onPress={noOp}
			accessible={false}
			importantForAccessibility={'no-hide-descendants'}>
			<View style={cover}>
				<CheckBoxIconText
					style={checkButtonStyle}
					iconStyle={checkIconStyle}
					onToggleCheckBox={_onChangeSelection}
					isChecked={isChecked}
					intl={intl}
				/>
				<View style={touchableContainer}>
					{showDeviceIcon && <BlockIcon
						icon={icon}
						style={deviceIcon}
						containerStyle={[iconContainerStyle, {
							backgroundColor: colorDeviceIconBack,
						}]}/>}
					{nameInfo}
				</View>
				{button.length === 1 ?
					button[0]
					:
					button.length > 0 &&
					<>
						{button[0]}
						<ShowMoreButton
							onPress={onPressMore}
							name={name}
							buttons={button}
							key={6}
							intl={intl}/>
					</>
				}
			</View>
		</ListItem>
	);

});

const getStyles = (appLayout: Object, deviceState: string): Object => {
	let { height, width } = appLayout;
	let isPortrait = height > width;
	let deviceWidth = isPortrait ? width : height;

	let {
		rowHeight,
		maxSizeRowTextOne,
		buttonWidth,
		brandPrimary,
		brandSecondary,
		shadow,
		paddingFactor,
		rowTextColor,
	} = Theme.Core;

	let nameFontSize = Math.floor(deviceWidth * 0.047);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	let color = (deviceState === 'TURNOFF' || deviceState === 'STOP') ? brandPrimary : brandSecondary;
	let backgroundColor = color;

	const padding = deviceWidth * paddingFactor;

	return {
		touchableContainer: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		row: {
			marginHorizontal: padding,
			marginTop: padding / 2,
			marginBottom: padding,
			backgroundColor: '#FFFFFF',
			height: rowHeight,
			borderRadius: 2,
			...shadow,
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
		deviceIcon: {
			fontSize: 18,
			color: '#fff',
		},
		iconContainerStyle: {
			backgroundColor: backgroundColor,
			borderRadius: 25,
			width: 25,
			height: 25,
			alignItems: 'center',
			justifyContent: 'center',
			marginHorizontal: 5,
		},
		nameStyle: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		nameTabletStyle: {
			flex: 1,
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			flexDirection: 'row',
		},
		textStyle: {
			color: rowTextColor,
			fontSize: nameFontSize,
			textAlignVertical: 'center',
			textAlign: 'left',
			marginLeft: 6,
			marginRight: 4,
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
		bellStyle: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: '#eeeeee',
			width: buttonWidth * 2,
			borderLeftWidth: 1,
			borderLeftColor: '#ddd',
			height: rowHeight,
		},
		navigationStyle: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		},
		checkButtonStyle: {
			paddingHorizontal: padding,
		},
		checkIconActiveStyle: {
			borderColor: brandSecondary,
			backgroundColor: brandSecondary,
			color: '#fff',
		},
		checkIconInActiveStyle: {
			borderColor: rowTextColor,
			backgroundColor: 'transparent',
			color: 'transparent',
		},
	};
};

export default DeviceRow;


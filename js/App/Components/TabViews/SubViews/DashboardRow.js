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

import { View } from '../../../../BaseComponents';
import ShowMoreButton from './Device/ShowMoreButton';
import MultiActionModal from './Device/MultiActionModal';
import DashboardShadowTile from './DashboardShadowTile';
import DimmerDashboardTile from './DimmerDashboardTile';
import NavigationalDashboardTile from './NavigationalDashboardTile';
import BellDashboardTile from './BellDashboardTile';
import ToggleDashboardTile from './ToggleDashboardTile';
import RGBDashboardTile from './RGBDashboardTile';
import ThermostatButtonDB from './Thermostat/ThermostatButtonDB';

import {
	getLabelDevice,
	getPowerConsumed,
	shouldUpdate,
	getDeviceIcons,
	getDeviceActionIcon,
	getOffColorRGB,
	getMainColorRGB,
	prepareMainColor,
	formatModeValue,
} from '../../../Lib';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
    item: Object,
    tileWidth: number,
    intl: Object,
    powerConsumed?: number,
	appLayout: Object,
    style: Object,
	setScrollEnabled: (boolean) => void,
	onPressDimButton: (Object) => void,
	openRGBControl: (number) => void,
	openThermostatControl: (number) => void,
};

type State = {
    showMoreActions: boolean,
};

class DashboardRow extends View {

props: Props;
state: State;

onPressMore: () => void;
closeMoreActions: () => void;
getButtonsInfo: (item: Object, styles: Object) => Object;

state: State = {
	showMoreActions: false,
};

constructor(props: Props) {
	super(props);

	this.onPressMore = this.onPressMore.bind(this);
	this.closeMoreActions = this.closeMoreActions.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { showMoreActions } = this.state;
	if (showMoreActions !== nextState.showMoreActions) {
		return true;
	}

	const { tileWidth, ...others } = this.props;
	const { tileWidth: tileWidthN, ...othersN } = nextProps;
	if (tileWidth !== tileWidthN) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, ['item', 'powerConsumed']);
	if (propsChange) {
		return true;
	}

	return false;
}

openRGBControl = () => {
	const { openRGBControl, item } = this.props;
	const { showMoreActions } = this.state;
	if (showMoreActions) {
		this.setState({
			showMoreActions: false,
		}, () => {
			openRGBControl(item.id);
		});
	} else {
		openRGBControl(item.id);
	}
}

getButtonsInfo(item: Object, styles: Object): Object {
	let { supportedMethods = {}, isInState, isOnline, deviceType, stateValues } = item, buttons = [], buttonsInfo = [];
	let { tileWidth, setScrollEnabled, onPressDimButton } = this.props;
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
	const iconsName = getDeviceIcons(deviceType);
	// Some device type, mostly with single button, the action(mostly inactive) icon will change wrt. it's state
	// For now this value is passed(and logic handled) only to 'ToggleDashboardTile'(as those device's state seem to be 'TURNON || TURNOFF')
	// if these type of devices has any chance of having state other than 'TURNON || TURNOFF', pass it to required button component.(also handle the logic)
	const actionIcons = getDeviceActionIcon(deviceType, isInState, supportedMethods);

	let { RGB: rgbValue } = stateValues;
	let colorDeviceIconBack = styles.itemIconContainerOn.backgroundColor;
	let offColorRGB, iconOffColor, iconOnColor;
	if (typeof rgbValue !== 'undefined' && isOnline) {
		let mainColorRGB = getMainColorRGB(rgbValue);

		offColorRGB = getOffColorRGB(mainColorRGB);
		iconOffColor = offColorRGB;

		colorDeviceIconBack = prepareMainColor(mainColorRGB);
		iconOnColor = colorDeviceIconBack;
	}
	colorDeviceIconBack = colorDeviceIconBack ? colorDeviceIconBack : styles.iconContainerStyle.backgroundColor;

	// NOTE: the prop "key" serves two purpose.
	// 1. The common and strict rule, when rendering array of items key(unique) prop is required.
	// 2. The same prop is used/accessed inside "TabViews/SubViews/Device/MultiActionModal.js" to override the style
	// in the case of device groups.

	if (BELL) {
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline : styles.itemIconContainerOn;

		buttons.unshift(<BellDashboardTile key={4} {...this.props} containerStyle={[styles.buttonsContainerStyle, {width: tileWidth}]}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if (UP || DOWN || STOP) {
		const showStopButton = !TURNON && !TURNOFF && !BELL && !DIM;
		const width = showStopButton ? tileWidth : tileWidth * (2 / 3);
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline :
			(isInState === 'STOP' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		buttons.unshift(<NavigationalDashboardTile key={1} {...this.props} containerStyle={[styles.buttonsContainerStyle, {width}]}
			showStopButton={showStopButton}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if (DIM && !RGB && !THERMOSTAT) {
		const showSlider = !BELL && !UP && !DOWN && !STOP;
		const width = showSlider ? tileWidth : tileWidth * (2 / 3);
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		buttons.unshift(<DimmerDashboardTile key={2} {...this.props} containerStyle={[styles.buttonsContainerStyle, {width}]}
			showSlider={showSlider} setScrollEnabled={setScrollEnabled} onPressDimButton={onPressDimButton}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if ((TURNON || TURNOFF) && !DIM && !RGB && !THERMOSTAT) {
		const showMoreButtons = BELL || UP || DOWN || STOP;
		const width = !showMoreButtons ? tileWidth : tileWidth * (2 / 3);
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		buttons.unshift(<ToggleDashboardTile key={3} {...this.props} actionIcons={actionIcons} containerStyle={[styles.buttonsContainerStyle, {width}]}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if (RGB) {
		const showSlider = !BELL && !UP && !DOWN && !STOP;
		const width = showSlider ? tileWidth : tileWidth * (2 / 3);
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline : {
			backgroundColor: isInState === 'TURNOFF' ? Theme.Core.brandPrimary : colorDeviceIconBack,
		};

		buttons.unshift(
			<RGBDashboardTile
				{...this.props}
				device={item}
				openRGBControl={this.openRGBControl}
				setScrollEnabled={setScrollEnabled}
				showSlider={showSlider}
				onSlideActive={this.onSlideActive}
				onSlideComplete={this.onSlideComplete}
				key={7}
				offButtonColor={isInState === 'TURNOFF' ? Theme.Core.brandPrimary : undefined}
				onButtonColor={isInState === 'TURNON' ? colorDeviceIconBack : undefined}
				iconOffColor={isInState === 'TURNOFF' ? undefined : iconOffColor}
				iconOnColor={isInState === 'TURNON' ? undefined : iconOnColor}
				containerStyle={[styles.buttonsContainerStyle, {width}]}
			/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if (THERMOSTAT) {
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline : styles.itemIconContainerOn;

		buttons.unshift(<ThermostatButtonDB
			key={8} {...this.props}
			containerStyle={[
				styles.buttonsContainerStyle,
				{
					width: tileWidth,
				},
			]}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP && !RGB && !THERMOSTAT) {
		const iconContainerStyle = !isOnline ? styles.itemIconContainerOffline :
			(isInState === 'TURNOFF' ? styles.itemIconContainerOff : styles.itemIconContainerOn);

		buttons.unshift(<ToggleDashboardTile key={5} {...this.props} actionIcons={actionIcons} containerStyle={[styles.buttonsContainerStyle, {width: tileWidth}]}/>);
		buttonsInfo.unshift({
			iconContainerStyle: iconContainerStyle,
			iconsName,
		});
	}

	return { buttons, buttonsInfo };
}

render(): Object {
	const { item, tileWidth, intl, appLayout } = this.props;
	const { showMoreActions } = this.state;
	const { name, isInState } = item;
	const deviceName = name ? name : intl.formatMessage(i18n.noName);

	const info = this.getInfo();
	const styles = this.getStyles(appLayout, tileWidth);
	const { buttons, buttonsInfo } = this.getButtonsInfo(item, styles);
	const { iconContainerStyle, iconsName } = buttonsInfo[0];
	const accessibilityLabel = getLabelDevice(intl.formatMessage, item);

	return (
		<DashboardShadowTile
			isEnabled={isInState === 'TURNON' || isInState === 'DIM'}
			name={deviceName}
			info={info}
			icon={iconsName}
			iconStyle={{
				color: '#fff',
				fontSize: Math.floor(tileWidth / 5.7),
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
			type={'device'}
			tileWidth={tileWidth}
			accessibilityLabel={accessibilityLabel}
			formatMessage={intl.formatMessage}
			style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
			<View style={[styles.buttonsContainerStyle, {width: tileWidth}]}>
				{buttons.length === 1 ?
					buttons[0]
					:
					[
						buttons[0],
						<ShowMoreButton onPress={this.onPressMore} style={styles.moreButtonStyle} dotStyle={styles.dotStyle} name={name} buttons={buttons} key={6} intl={intl}/>,
					]
				}
			</View>
			{
				buttons.length !== 1 && (
					<MultiActionModal
						showModal={showMoreActions}
						buttons={buttons}
						name={deviceName}
						item={item}
						closeModal={this.closeMoreActions}
					/>
				)}
		</DashboardShadowTile>
	);
}

getInfo(): null | string {
	const { item, intl, powerConsumed } = this.props;
	const { supportedMethods = {}, stateValues = {}} = item;
	const { THERMOSTAT } = supportedMethods;
	let info = powerConsumed ? `${intl.formatNumber(powerConsumed, {maximumFractionDigits: 1})} W` : null;
	if (THERMOSTAT) {
		const { THERMOSTAT: {setpoint = {}, mode}} = stateValues;
		let currentModeValue = setpoint[mode];
		currentModeValue = isNaN(currentModeValue) ? -100.0 : currentModeValue;

		let value = intl.formatNumber(currentModeValue, {minimumFractionDigits: 1});
		value = formatModeValue(value, intl.formatNumber);
		value = `${value}°C`;
		info = intl.formatMessage(i18n.labelCurrentlyValue, {value});
	}
	return info;
}

onPressMore() {
	this.setState({
		showMoreActions: true,
	});
}

closeMoreActions() {
	this.setState({
		showMoreActions: false,
	});
}

getStyles(appLayout: Object, tileWidth: number): Object {
	return {
		buttonsContainerStyle: {
			height: tileWidth * 0.4,
			flexDirection: 'row',
			justifyContent: 'center',
		},
		moreButtonStyle: {
			width: tileWidth / 3,
			height: tileWidth * 0.4,
			backgroundColor: '#eeeeee',
		},
		dotStyle: {
			width: tileWidth * 0.05,
			height: tileWidth * 0.05,
			borderRadius: tileWidth * 0.025,
		},
		itemIconContainerOn: {
			backgroundColor: Theme.Core.brandSecondary,
		},
		itemIconContainerOff: {
			backgroundColor: Theme.Core.brandPrimary,
		},
		itemIconContainerOffline: {
			backgroundColor: Theme.Core.offlineColor,
		},
	};
}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { clientDeviceId, clientId } = ownProps.item;
	const powerConsumed = getPowerConsumed(store.sensors.byId, clientDeviceId, clientId);

	return {
		appLayout: store.app.layout,
		powerConsumed,
	};
}

module.exports = connect(mapStateToProps, null)(DashboardRow);

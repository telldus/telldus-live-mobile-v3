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
import PropTypes from 'prop-types';

import { View } from '../../../../../BaseComponents';
import {
	BellButton,
	OnButton,
	OffButton,
} from '../../../TabViews/SubViews';
import SliderDetails from './SliderDetails';
import UpButton from '../../../TabViews/SubViews/Navigational/UpButton';
import DownButton from '../../../TabViews/SubViews/Navigational/DownButton';
import StopButton from '../../../TabViews/SubViews/Navigational/StopButton';
import RGBColorWheel from '../../../RGBControl/RGBColorWheel';
import HeatControlWheelModes from '../../../ThermostatControl/HeatControlWheelModes';
import ButtonLoadingIndicator from '../../../TabViews/SubViews/ButtonLoadingIndicator';

import { getDeviceActionIcon } from '../../../../Lib/DeviceUtils';
import {
	getSupportedModes,
	shouldHaveMode,
	getSetPoints,
	getCurrentSetPoint,
} from '../../../../Lib/thermostatUtils';

import Theme from '../../../../Theme';

type Props = {
	device: Object,
	intl: Object,
    isGatewayActive: boolean,
	appLayout: Object,
	lastUpdated?: number,
	currentTemp?: string,
	gatewayTimezone: string,
	onPressOverride?: Function,
	deviceSetStateRGBOverride: Function,

	containerStyle?: Array<any> | Object,
	deviceSetStateThermostat: (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1, changeMode?: 0 | 1, requestedState: number) => Promise<any>,
};

class DeviceActionDetails extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const {
			device,
			intl,
			isGatewayActive,
			appLayout,
			containerStyle,
			lastUpdated,
			currentTemp,
			gatewayTimezone,
			onPressOverride,
			deviceSetStateRGBOverride,
		} = this.props;
		const {
			supportedMethods = {},
			deviceType,
			isInState,
			stateValues = {},
			parameter = [],
			methodRequested,
			actionsQueueThermostat = {},
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
		const buttons = [];
		const {
			container,
			buttonStyle,
			buttonsContainer,
			colorWheel,
			thumStyle,
			swatchStyle,
			swatchesCover,
			colorWheelCover,
			swatchWheelCover,
			modesCoverStyle,
			dot,
			thumbSize,
		} = this.getStyles(appLayout);
		const sharedProps = {
			...device,
			isGatewayActive,
			intl,
			onPressOverride: onPressOverride,
		};

		if (UP && !THERMOSTAT) {
			buttons.push(
				<UpButton {...sharedProps}
					iconSize={45} supportedMethod={UP}/>
			);
		}

		if (DOWN && !THERMOSTAT) {
			buttons.push(
				<DownButton {...sharedProps}
					iconSize={45} supportedMethod={DOWN}/>
			);
		}

		if (STOP && !THERMOSTAT) {
			buttons.push(
				<StopButton {...sharedProps}
					iconSize={20} supportedMethod={STOP}/>
			);
		}

		if (TURNOFF && !THERMOSTAT) {
			const { TURNOFF: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				<OffButton
					{...sharedProps}
					actionIcon={actionIcon}
					enabled={!!TURNOFF}/>
			);
		}

		if (TURNON && !THERMOSTAT) {
			const { TURNON: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				<OnButton
					{...sharedProps}
					actionIcon={actionIcon}
					enabled={!!TURNON}
				/>
			);
		}

		if (BELL && !THERMOSTAT) {
			buttons.push(
				<BellButton device={device} {...sharedProps}/>
			);
		}

		if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP && !THERMOSTAT) {
			const { TURNOFF: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				isInState === 'TURNOFF' ?
					<OffButton
						{...sharedProps}
						actionIcon={actionIcon}
						enabled={!!TURNOFF}/>
					:
					<OnButton
						{...sharedProps}
						actionIcon={actionIcon}
						enabled={!!TURNON}/>
			);
		}

		const newButtonStyle = buttons.length > 4 ? buttonStyle : {...buttonStyle, flex: 1};

		let supportedModes = [], activeMode, supportResume = false, _shouldHaveMode = false;
		if (THERMOSTAT) {
			const { THERMOSTAT: { setpoint = {}, mode } } = stateValues;
			activeMode = mode;
			supportedModes = getSupportedModes(parameter, setpoint, intl);

			parameter.map((param: Object) => {
				if (param.name && param.name === 'thermostat') {
					const { modes = [] } = param.value;
					modes.map((m: string) => {
						if (m.toLowerCase().trim() === 'resume') {
							supportResume = true;
						}
					});
				}
			});
			let currentSetPoint;
			_shouldHaveMode = shouldHaveMode(device);
			if (!_shouldHaveMode) {
				supportedModes = getSetPoints(parameter, setpoint, intl);
				if (supportedModes) {
					currentSetPoint = getCurrentSetPoint(supportedModes, mode);
					if (currentSetPoint) {
						activeMode = currentSetPoint.mode;
					}
				}
			}
		}

		return (
			<>
				{!!THERMOSTAT &&
					<HeatControlWheelModes
						appLayout={appLayout}
						modes={supportedModes}
						device={device}
						lastUpdated={lastUpdated}
						deviceSetStateThermostat={this.props.deviceSetStateThermostat}
						modesCoverStyle={modesCoverStyle}
						activeMode={activeMode}
						currentTemp={currentTemp}
						supportResume={supportResume}
						gatewayTimezone={gatewayTimezone}
						intl={intl}
						shouldHaveMode={_shouldHaveMode}
						actionsQueueThermostat={actionsQueueThermostat}/>
				}
				{buttons.length > 0 &&
				<View
					level={2}
					style={[container, containerStyle]}>
					{!!RGB &&
					<>
						{
							(methodRequested === 'RGB' || methodRequested === 'DIM') ?
								<ButtonLoadingIndicator style={dot}/>
								: null
						}
						<RGBColorWheel
							device={device}
							appLayout={appLayout}
							style={colorWheel}
							thumStyle={thumStyle}
							swatchStyle={swatchStyle}
							swatchesCover={swatchesCover}
							colorWheelCover={colorWheelCover}
							swatchWheelCover={swatchWheelCover}
							thumbSize={thumbSize}
							showActionIndicator={false}
							deviceSetStateRGBOverride={deviceSetStateRGBOverride}/>
					</>
					}
					{!!DIM && !THERMOSTAT && (
						<SliderDetails
							device={device}
							intl={intl}
							isGatewayActive={isGatewayActive}
							appLayout={appLayout}
							onPressOverride={onPressOverride}/>
					)}
					<View style={{flex: 1, alignItems: 'stretch'}}>
						<View style={buttonsContainer}>
							{
								React.Children.map(buttons, (button: Object): Object | null => {
									if (React.isValidElement(button)) {
										return React.cloneElement(button, {style: newButtonStyle});
									}
									return null;
								})
							}
						</View>
					</View>
				</View>
				}
			</>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const outerPadding = deviceWidth * Theme.Core.paddingFactor * 2;
		const padding = deviceWidth * Theme.Core.paddingFactor;
		const buttonPadding = padding;
		const bodyPadding = buttonPadding * 1.5;

		const swatchMaxSize = 80;
		const numOfItemsPerRow = 5;
		const itemsBorder = numOfItemsPerRow * 4;
		const itemsPadding = Math.ceil(numOfItemsPerRow * padding * 2);
		let swatchSize = Math.floor((deviceWidth - (itemsPadding + outerPadding + itemsBorder)) / numOfItemsPerRow);
		swatchSize = swatchSize > swatchMaxSize ? swatchMaxSize : swatchSize;

		const thumbSize = 15;

		return {
			thumbSize,
			container: {
				flex: 1,
				alignItems: 'stretch',
				justifyContent: 'center',
				paddingTop: bodyPadding - 10,
				paddingBottom: bodyPadding,
				paddingLeft: bodyPadding - buttonPadding,
				paddingRight: bodyPadding,
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			buttonsContainer: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			buttonStyle: {
				minWidth: (width - outerPadding - (buttonPadding * 3) - (bodyPadding * 2)) / 4,
				justifyContent: 'center',
				alignItems: 'center',
				height: Theme.Core.rowHeight,
				marginLeft: buttonPadding,
				marginTop: buttonPadding,
				...Theme.Core.shadow,
				borderRadius: 2,
				overflow: 'hidden',
			},
			colorWheelCover: {
				width: width - (padding * 2),
				height: deviceWidth * 0.52,
				alignItems: 'center',
				marginLeft: buttonPadding,
				backgroundColor: 'transparent',
			},
			colorWheel: {
				width: deviceWidth * 0.5,
				height: deviceWidth * 0.5,
				alignItems: 'center',
				borderRadius: deviceWidth * 0.25,
			},
			thumStyle: {
				height: 30,
				width: 30,
				borderRadius: 30,
			},
			swatchWheelCover: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			swatchesCover: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'center',
				alignSelf: 'center',
				marginRight: -(padding / 2),
				marginTop: thumbSize / 2,
			},
			swatchStyle: {
				height: swatchSize,
				width: swatchSize,
				borderRadius: swatchSize / 2,
				marginHorizontal: padding,
				marginTop: padding,
			},
			modesCoverStyle: {
				marginVertical: 0,
				marginTop: padding,
				marginBottom: padding / 2,
			},
			dot: {
				position: 'absolute',
				top: 6,
				left: 6,
			},
		};
	}
}

DeviceActionDetails.propTypes = {
	device: PropTypes.object.isRequired,
};

module.exports = DeviceActionDetails;

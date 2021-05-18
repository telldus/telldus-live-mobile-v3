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
	ScrollView,
	LayoutAnimation,
} from 'react-native';

import {
	FloatingButton,
	View,
	Text,
	EmptyView,
} from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import HeatControlWheelModes from '../ThermostatControl/HeatControlWheelModes';
import ActionThermostatTwo from './ActionThermostatTwo';

import {
	getSupportedModes,
	shouldUpdate,
	LayoutAnimations,
	shouldHaveMode,
	getSetPoints,
	getCurrentSetPoint,
} from '../../Lib';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	methodValue: number,
};

export default class ActionThermostat extends View<null, Props, State> {

	_shouldHaveMode: boolean;

	constructor(props: Props) {
		super(props);

		const { isEditMode, intl, schedule, devices } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);

		this.device = devices.byId[schedule.deviceId]; // We do not want scheduler to update on device prop change
		const { stateValues = {}, parameter = [] } = this.device || {};
		const { THERMOSTAT: { mode } } = stateValues;

		const { methodValue, edit } = schedule;
		this.currentMode = mode;
		this.currentValue = undefined;
		this.methodValue = {
			changeMode: 1,
			changeTemp: false,
			mode,
		};
		try {
			this.methodValue = JSON.parse(methodValue);
			this.methodValue = typeof this.methodValue !== 'object' ? {} : this.methodValue;
			const {
				mode: cMode,
				temperature,
			} = this.methodValue;
			this.currentMode = cMode || mode;
			this.currentValue = temperature;

			const hadValidTemp = temperature !== null && typeof temperature !== 'undefined';
			const changeTemp = hadValidTemp;
			this.methodValue = {
				...this.methodValue,
				changeMode: typeof this.methodValue.changeMode === 'undefined' ? 1 : this.methodValue.changeMode,
				mode: cMode || mode,
				temperature: hadValidTemp ? parseInt(temperature, 10) : temperature,
				changeTemp,
			};
		} catch (err) {
			this.currentMode = mode;
			this.methodValue = {
				changeMode: 1,
				mode,
				changeTemp: false,
			};
		}

		this.label = formatMessage(i18n.labelChangeMode);

		this.supportResume = false;
		parameter.map((param: Object) => {
			if (param.name && param.name === 'thermostat') {
				const { modes = [] } = param.value;
				modes.map((m: string) => {
					if (m.toLowerCase().trim() === 'resume') {
						this.supportResume = true;
					}
				});
			}
		});

		const { THERMOSTAT: { setpoint = {} } } = stateValues;

		this.supportedModes = getSupportedModes(parameter, setpoint, intl, true);
		this._shouldHaveMode = shouldHaveMode(this.device);
		let currentSetPoint;
		if (!this._shouldHaveMode) {
			this.supportedModes = getSetPoints(parameter, setpoint, intl);
			if (this.supportedModes) {
				currentSetPoint = getCurrentSetPoint(this.supportedModes, mode);
				if (currentSetPoint) {
					this.currentMode = currentSetPoint.mode;
				}
			}
		}
		this.supportedModes = this.supportedModes.map((sm: Object): Object => {
			if (sm.mode === this.currentMode && typeof this.currentValue === 'undefined') {
				const changeTemp = sm.value !== null && typeof sm.value !== 'undefined';
				this.methodValue = {
					...this.methodValue,
					temperature: changeTemp ? parseInt(sm.value, 10) : sm.value,
					changeTemp: !edit ? changeTemp : false,
				};
			}
			if (sm.mode === this.currentMode && this.currentValue) {
				return {
					...sm,
					value: this.currentValue,
				};
			}
			return sm;
		});
		if (!this._shouldHaveMode) {
			this.methodValue = {
				...this.methodValue,
				changeMode: false,
				mode: this.currentMode,
			};
		}
		this.state = {
			methodValue: this.methodValue,
		};
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (shouldUpdate(this.state, nextState, ['methodValue'])) {
			return true;
		}
		return nextProps.currentScreen === 'ActionThermostat' && shouldUpdate(this.props, nextProps, ['schedule', 'appLayout']);
	}

	selectAction: Function = () => {
		const { actions, navigation, isEditMode, route } = this.props;
		const { methodValue } = this.state;

		const {
			changeTemp,
			mode,
		} = methodValue;
		let data = {
			...methodValue,
		};

		if (!changeTemp) {
			delete data.temperature;
		}
		if (mode === 'off' || mode === 'fan') {
			data.changeTemp = false;
			delete data.temperature;
		}

		if (isEditMode()) {
			actions.selectAction(2048, JSON.stringify(data));
			navigation.navigate(route.params.actionKey, {
				...route.params,
			});
		} else {
			actions.selectAction(2048, JSON.stringify(data));
			navigation.navigate({
				name: 'Time',
				key: 'Time',
				params: route.params,
			});
		}
	};

	deviceSetStateThermostat: Function = (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1) => {
		const { methodValue } = this.state;
		let methodValueN = {
			...methodValue,
			mode,
			temperature,
			scale,
		};
		if (mode === 'off' || mode === 'fan') {
			methodValueN.changeTemp = false;
			delete methodValueN.temperature;
		}
		this.setState({
			methodValue: methodValueN,
		});
	}

	onChange: Function = (newMethodValue: Object) => {
		const { methodValue } = this.state;
		const methodValueN = {
			...methodValue,
			...newMethodValue,
		};
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			methodValue: methodValueN,
		});
	}

	render(): React$Element<any> | null {
		const {
			appLayout,
			intl,
		} = this.props;
		const {
			methodValue,
		} = this.state;
		const { container, outerPadding, tempLabelStyle } = this._getStyle(appLayout);

		if (!this.device) {
			return null;
		}

		const activeMode = methodValue.mode;

		const { changeMode, changeTemp, temperature } = methodValue || {};
		const noTemp = typeof temperature !== 'number' || isNaN(temperature);
		const changeModeAlone = (!changeTemp && changeMode) || noTemp;

		const hideTemperatureControl = changeModeAlone;
		const changeTempAlone = changeTemp && !changeMode;

		let modes = [];
		this.supportedModes.forEach((m: Object) => {
			if (changeTempAlone) {
				if (m.mode !== 'off' && m.mode !== 'fan') {
					modes.push(m);
				}
			} else {
				modes.push(m);
			}
		});

		return (
			<View style={container}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					{(!this._shouldHaveMode || !modes || modes.length === 0) ?
						<EmptyView/>
						:
						<ActionThermostatTwo
							intl={intl}
							methodValue={methodValue}
							appLayout={appLayout}
							onChange={this.onChange}/>
					}
					{!hideTemperatureControl ?
						<Text
							level={2}
							style={tempLabelStyle}>
							{intl.formatMessage(i18n.labelTemperature)}
						</Text>
						:
						<EmptyView/>
					}
					<HeatControlWheelModes
						appLayout={appLayout}
						modes={modes}
						device={this.device}
						activeMode={activeMode}
						deviceSetStateThermostat={this.deviceSetStateThermostat}
						supportResume={this.supportResume}
						hideTemperatureControl={hideTemperatureControl}
						intl={intl}
						source="Schedule_ActionThermostat"
						timeoutPlusMinus={0}
						shouldHaveMode={true}/>
				</ScrollView>
				{(this.supportedModes && this.supportedModes.length > 0) ? <FloatingButton
					onPress={this.selectAction}
					imageSource={{uri: 'right_arrow_key'}}
					paddingRight={outerPadding - 2}/>
					:
					<EmptyView/>
				}
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			paddingFactor,
			fontSizeFactorFour,
		} = Theme.Core;
		const outerPadding = deviceWidth * paddingFactor;

		return {
			outerPadding,
			container: {
				flex: 1,
				paddingVertical: outerPadding - (outerPadding / 4),
			},
			tempLabelStyle: {
				marginTop: outerPadding,
				marginLeft: outerPadding,
				fontSize: deviceWidth * fontSizeFactorFour,
			},
		};
	};
}

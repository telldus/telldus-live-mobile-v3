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
import { ScrollView } from 'react-native';

import { FloatingButton, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import HeatControlWheelModes from '../ThermostatControl/HeatControlWheelModes';
import {
	ScheduleSwitch,
} from './SubViews';

import {
	getSupportedModes,
	shouldUpdate,
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

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		paddingRight: PropTypes.number,
		isEditMode: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		const { isEditMode, intl, schedule, devices } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.device = devices.byId[schedule.deviceId]; // We do not want scheduler to update on device prop change
		const { stateValues = {} } = this.device || {};
		const { THERMOSTAT: { mode } } = stateValues;

		const { methodValue } = schedule;
		this.currentMode = undefined;
		this.currentValue = undefined;
		try {
			const {
				mode: cMode,
				temperature,
			} = JSON.parse(methodValue);
			this.currentMode = cMode;
			this.currentValue = temperature;
		} catch (err) {
			this.currentMode = mode;
		}

		this.state = {
			methodValue: {
				mode,
				changeMode: 1,
			},
		};
		this.label = formatMessage(i18n.labelChangeMode);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (shouldUpdate(this.state, nextState, ['methodValue'])) {
			return true;
		}
		return nextProps.currentScreen === 'ActionThermostat' && shouldUpdate(this.props, nextProps, ['schedule', 'appLayout']);
	}

	selectAction = () => {
		const { actions, navigation, isEditMode } = this.props;
		const { methodValue } = this.state;

		actions.selectAction(2048, JSON.stringify(methodValue));

		if (isEditMode()) {
			navigation.goBack(navigation.state.params.actionKey);
		} else {
			navigation.navigate({
				routeName: 'Time',
				key: 'Time',
			});
		}
	};

	deviceSetStateThermostat = (deviceId: number, mode: string, temperature?: number, scale?: 0 | 1) => {
		const { methodValue } = this.state;
		const { changeMode } = methodValue;
		const methodValueN = {
			mode,
			temperature,
			scale,
			changeMode,
		};
		this.setState({
			methodValue: methodValueN,
		});
	}

	setChangeMode = (value: boolean) => {
		const { methodValue } = this.state;
		this.setState({
			methodValue: {
				...methodValue,
				changeMode: value ? 1 : 0,
			},
		});
	}

	render(): React$Element<any> | null {
		const {
			appLayout,
			intl,
		} = this.props;
		const { container, switchContainerStyle, outerPadding } = this._getStyle(appLayout);

		if (!this.device) {
			return null;
		}

		const {
			parameter = [],
			stateValues,
		} = this.device;

		let supportResume = false;
		parameter.map((param: Object) => {
			if (param.name && param.name === 'thermostat') {
				const { modes = [] } = param.value;
				modes.map((mode: string) => {
					if (mode.toLowerCase().trim() === 'resume') {
						supportResume = true;
					}
				});
			}
		});

		const { THERMOSTAT: { setpoint = {}, mode } } = stateValues;

		let supportedModes = getSupportedModes(parameter, setpoint, intl, true);
		supportedModes = supportedModes.map((sm: Object): Object => {
			if (sm.mode === this.currentMode && this.currentValue) {
				return {
					...sm,
					value: this.currentValue,
				};
			}
			return sm;
		});

		const { methodValue } = this.state;

		return (
			<View style={container}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<ScheduleSwitch
						value={methodValue.changeMode === 1 ? true : false}
						onValueChange={this.setChangeMode}
						appLayout={appLayout}
						label={this.label}
						containerStyle={switchContainerStyle}/>
					<HeatControlWheelModes
						appLayout={appLayout}
						modes={supportedModes}
						device={this.device}
						activeMode={this.currentMode || mode}
						deviceSetStateThermostat={this.deviceSetStateThermostat}
						supportResume={supportResume}/>
				</ScrollView>
				<FloatingButton
					onPress={this.selectAction}
					imageSource={{uri: 'right_arrow_key'}}
					paddingRight={outerPadding - 2}
				/>
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const outerPadding = deviceWidth * Theme.Core.paddingFactor;

		return {
			outerPadding,
			container: {
				flex: 1,
				paddingVertical: outerPadding - (outerPadding / 4),
			},
			switchContainerStyle: {
				marginHorizontal: outerPadding,
				width: width - (outerPadding * 2),
				marginVertical: 0,
				marginTop: outerPadding / 4,
			},
		};
	};

}

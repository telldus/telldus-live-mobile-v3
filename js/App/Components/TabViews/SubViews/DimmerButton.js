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
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';

import { View } from '../../../../BaseComponents';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue, showDimmerStep } from '../../../Actions/Dimmer';
import { deviceSetState } from '../../../Actions/Devices';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';
import HVSliderContainer from './Device/HVSliderContainer';
import SliderScale from './Device/SliderScale';
import {
	getDimmerValue,
	toDimmerValue,
	toSliderValue,
	shouldUpdate,
} from '../../../Lib';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	commandON: number,
	commandOFF: number,
	commandDIM: number,

	device: Object,
	showSlider?: boolean,
	isOpen: boolean,
	screenReaderEnabled: boolean,
	setScrollEnabled: boolean,
	sensitive: number,

	intl: Object,
	isGatewayActive: boolean,
	onSlideActive: () => void,
	onSlideComplete: () => void,
	showDimmerStep: (number) => void,
	style?: number | Object | Array<any>,
	offButtonStyle?: number | Object | Array<any>,
	onButtonStyle?: number | Object | Array<any>,
	sliderStyle?: number | Object | Array<any>,
	closeSwipeRow: () => void,
	onDimmerSlide: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void,
	showDimmerPopup: (name: string, sliderValue: number) => void,
	hideDimmerPopup: () => void,
	deviceSetState: (id: number, command: number, value?: number) => void,
	onPressDimButton: (device: Object) => void,
};

type DefaultProps = {
	showSlider: boolean,
	commandON: number,
	commandOFF: number,
	commandDIM: number,
};

class DimmerButton extends View<Props, null> {
	props: Props;

	parentScrollEnabled: boolean;
	onTurnOn: () => void;
	onTurnOff: () => void;
	onSlidingStart: (name: string, sliderValue: number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;
	showDimmerStep: (number) => void;

	onPressDimButton: () => void;

	static defaultProps: DefaultProps = {
		showSlider: true,
		commandON: 1,
		commandOFF: 2,
		commandDIM: 16,
	};

	constructor(props: Props) {
		super(props);

		this.parentScrollEnabled = true;
		const { device, onDimmerSlide } = this.props;
		this.onValueChangeThrottled = throttle(onDimmerSlide(device.id), 100, {
			trailing: true,
		});

		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.showDimmerStep = this.showDimmerStep.bind(this);

		this.onPressDimButton = this.onPressDimButton.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { isOpen, setScrollEnabled, ...others } = this.props;
		const { isOpen: isOpenN, setScrollEnabled: setScrollEnabledN, ...othersN } = nextProps;
		if (isOpen !== isOpenN || setScrollEnabled !== setScrollEnabledN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['device', 'showSlider', 'screenReaderEnabled', 'sensitive']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onValueChange(sliderValue: number) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name: string, sliderValue: number) {
		const { stateValues, isInState, id, value } = this.props.device;
		const stateValue = stateValues ? stateValues.DIM : value;

		this.props.onSlideActive();
		this.props.saveDimmerInitialState(id, stateValue, isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue: number) {
		let { device, commandON, commandOFF, commandDIM } = this.props;
		let command = commandDIM;
		this.props.onSlideComplete();
		if (sliderValue === 100) {
			command = commandON;
		}
		if (sliderValue === 0) {
			command = commandOFF;
		}
		let dimValue = toDimmerValue(sliderValue);
		this.props.deviceSetState(device.id, command, dimValue);
		this.props.hideDimmerPopup();
	}

	onTurnOn() {
		const { isOpen, closeSwipeRow } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		this.props.deviceSetState(this.props.device.id, this.props.commandON);
	}

	onTurnOff() {
		const { isOpen, closeSwipeRow } = this.props;
		if (isOpen && closeSwipeRow) {
			closeSwipeRow();
			return;
		}
		this.props.deviceSetState(this.props.device.id, this.props.commandOFF);
	}

	showDimmerStep(id: number) {
		this.props.showDimmerStep(id);
	}

	onPressDimButton() {
		const { onPressDimButton, device } = this.props;
		if (onPressDimButton && typeof onPressDimButton === 'function') {
			onPressDimButton(device);
		}
	}

	render(): Object {
		const {
			device: item,
			intl,
			isGatewayActive,
			screenReaderEnabled,
			showSlider,
			style,
			onButtonStyle,
			offButtonStyle,
			sliderStyle,
			setScrollEnabled,
			isOpen,
			closeSwipeRow,
			sensitive,
		} = this.props;
		const { isInState, name, supportedMethods, methodRequested, local, stateValues, value: val } = item;
		const { DIM } = supportedMethods;
		const deviceName = name ? name : intl.formatMessage(i18n.noName);

		const stateValue = stateValues ? stateValues.DIM : val;
		const value = getDimmerValue(stateValue, isInState);

		const sliderProps = {
			sensitive,
			thumbWidth: 10,
			thumbHeight: 10,
			fontSize: 9,
			value: toSliderValue(value),
			onSlidingStart: this.onSlidingStart,
			onSlidingComplete: this.onSlidingComplete,
			onValueChange: this.onValueChange,
			showDimmerStep: this.showDimmerStep,
			item,
			intl,
			isInState,
			isGatewayActive,
			screenReaderEnabled,
			setScrollEnabled,
		};
		const sharedProps = {
			isInState,
			methodRequested,
			intl,
			isGatewayActive,
			local,
			name: deviceName,
			enabled: false,
		};
		// TODO: refactor writing a higher order component
		const onButton = (
			<HVSliderContainer
				{...sliderProps}
				style={[styles.buttonContainerStyle, onButtonStyle]}
				onPress={this.onTurnOn}>
				<DimmerOnButton
					ref={'onButton'}
					style={[styles.buttonStyle]}
					onPress={this.onTurnOn}
					{...sharedProps}
				/>
			</HVSliderContainer>
		);
		const offButton = (
			<HVSliderContainer
				{...sliderProps}
				style={[styles.buttonContainerStyle, offButtonStyle]}
				onPress={this.onTurnOff}>
				<DimmerOffButton
					ref={'offButton'}
					style={[styles.buttonStyle]}
					onPress={this.onTurnOff}
					{...sharedProps}
				/>
			</HVSliderContainer>
		);
		const slider = DIM ? (
			<HVSliderContainer
				{...sliderProps}
				style={sliderStyle}
				onPress={isOpen ? closeSwipeRow : this.onPressDimButton}
			>
				<SliderScale
					style={styles.slider}
					thumbWidth={10}
					thumbHeight={10}
					fontSize={9}
					{...sharedProps}
					importantForAccessibility={'yes'}
				/>
			</HVSliderContainer>
		) : null;

		return (
			<View style={[styles.container, style]}>
				{ offButton }
				{!!showSlider && slider }
				{ onButton }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: Theme.Core.rowHeight,
	},
	slider: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	buttonStyle: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonContainerStyle: {
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
});

function mapDispatchToProps(dispatch: Function): Object {
	return {
		saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => {
			dispatch(saveDimmerInitialState(deviceId, initalValue, initialState));
		},
		showDimmerPopup: (name: string, value: number) => {
			dispatch(showDimmerPopup(name, value));
		},
		hideDimmerPopup: () => {
			dispatch(hideDimmerPopup());
		},
		onDimmerSlide: (id: number): any => (value: number): any => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number): any => dispatch(deviceSetState(id, command, value)),
		showDimmerStep: (id: number) => {
			dispatch(showDimmerStep(id));
		},
	};
}

function mapStateToProps(store: Object, dispatch: Function): Object {
	const { app = {} } = store;
	const { screenReaderEnabled, dimmerSensitivity: sensitive = 5 } = app;
	return {
		screenReaderEnabled,
		sensitive,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DimmerButton);

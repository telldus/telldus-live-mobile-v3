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

import { View, RoundedCornerShadowView } from 'BaseComponents';
import { Animated, StyleSheet } from 'react-native';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue } from 'Actions_Dimmer';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';
import VerticalSlider from './VerticalSlider';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';

function getDimmerValue(value: number, isInState: string): number {
	let newValue = value || 0;
	if (isInState === 'TURNON') {
		return 255;
	}
	if (isInState === 'TURNOFF') {
		return 0;
	}

	newValue = parseInt(newValue, 10);
	return newValue;
}

function toDimmerValue(sliderValue: number): number {
	return Math.round(sliderValue * 255 / 100.0);
}

function toSliderValue(dimmerValue: number): number {
	return Math.round(dimmerValue * 100.0 / 255);
}

type Props = {
	device: Object,
	commandON: number,
	commandOFF: number,
	commandDIM: number,
	onDimmerSlide: number => void,
	saveDimmerInitialState: (deviceId: number, initalValue: number, initialState: string) => void,
	showDimmerPopup: (name: string, sliderValue: number) => void,
	hideDimmerPopup: () => void,
	setScrollEnabled: boolean,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (number, number) => void,
};

type State = {
	buttonWidth: number,
	buttonHeight: number,
	value: number,
	offButtonFadeAnim: Object,
	onButtonFadeAnim: Object,
};

class DimmerButton extends View {
	props: Props;
	state: State;
	parentScrollEnabled: boolean;
	onTurnOffButtonStart: () => void;
	onTurnOnButtonEnd: () => void;
	onTurnOnButtonStart: () => void;
	onTurnOnButtonEnd: () => void;
	onTurnOn: () => void;
	onTurnOff: () => void;
	layoutView: Object => void;
	onSlidingStart: (name: string, sliderValue: number) => void;
	onSlidingComplete: number => void;
	onValueChange: number => void;
	onTurnOffButtonEnd: () => void;

	constructor(props: Props) {
		super(props);

		const value = getDimmerValue(this.props.device.value, this.props.device.isInState);
		this.parentScrollEnabled = true;
		this.state = {
			buttonWidth: 0,
			buttonHeight: 0,
			value,
			offButtonFadeAnim: new Animated.Value(1),
			onButtonFadeAnim: new Animated.Value(1),

		};

		this.onTurnOffButtonStart = this.onTurnOffButtonStart.bind(this);
		this.onTurnOffButtonEnd = this.onTurnOffButtonEnd.bind(this);
		this.onTurnOnButtonStart = this.onTurnOnButtonStart.bind(this);
		this.onTurnOnButtonEnd = this.onTurnOnButtonEnd.bind(this);
		this.onTurnOn = this.onTurnOn.bind(this);
		this.onTurnOff = this.onTurnOff.bind(this);
		this.layoutView = this.layoutView.bind(this);
		this.onSlidingStart = this.onSlidingStart.bind(this);
		this.onSlidingComplete = this.onSlidingComplete.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const dimmerValue = getDimmerValue(nextProps.device.value, nextProps.device.isInState);
		this.setState({ value: dimmerValue });
	}

	layoutView(x: Object) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			buttonWidth: width,
			buttonHeight: height,
		});
	}

	onValueChange(sliderValue: number) {
		let fn = this.props.onDimmerSlide(this.props.device.id);
		if (fn) {
			fn(toDimmerValue(sliderValue));
		}
	}

	onSlidingStart(name: string, sliderValue: number) {
		this.props.saveDimmerInitialState(this.props.device.id, this.props.device.value, this.props.device.isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue: number) {
		if (sliderValue > 0) {
			this.props.requestDeviceAction(this.props.device.id, this.props.commandON);
		}
		if (sliderValue === 0) {
			this.props.requestDeviceAction(this.props.device.id, this.props.commandOFF);
		}
		let dimValue = toDimmerValue(sliderValue);
		let command = dimValue === 0 ? this.props.commandOFF : this.props.commandDIM;
		this.props.deviceSetState(this.props.device.id, command, dimValue);
		this.props.hideDimmerPopup();
	}

	onTurnOffButtonStart() {
		this.refs.offButton.fadeOut();
	}

	onTurnOffButtonEnd() {
		this.refs.offButton.fadeIn();
	}

	onTurnOnButtonStart() {
		this.refs.onButton.fadeOut();
	}

	onTurnOnButtonEnd() {
		this.refs.onButton.fadeIn();
	}

	onTurnOn() {
		this.props.deviceSetState(this.props.device.id, this.props.commandON);
		this.props.requestDeviceAction(this.props.device.id, this.props.commandON);
	}

	onTurnOff() {
		this.props.deviceSetState(this.props.device.id, this.props.commandOFF);
		this.props.requestDeviceAction(this.props.device.id, this.props.commandOFF);
	}

	render() {
		const { device } = this.props;
		const { TURNON, TURNOFF, DIM } = device.supportedMethods;
		const onButton = (
			<DimmerOnButton
				ref={'onButton'}
				style={styles.turnOn}
				isInState={device.isInState}
				enabled={!!TURNON}
				methodRequested={device.methodRequested}
			/>
		);
		const offButton = (
			<DimmerOffButton
				ref={'offButton'}
				style={styles.turnOff}
				isInState={device.isInState}
				enabled={!!TURNOFF}
				methodRequested={device.methodRequested}
			/>
		);
		const slider = DIM ? (
			<VerticalSlider
				style={[
					styles.slider,
					{
						width: this.state.buttonWidth,
						height: this.state.buttonHeight,
						left: 0,
						bottom: 0,
					},
				]}
				thumbWidth={this.state.buttonWidth / 5}
				thumbHeight={9}
				fontSize={7}
				item={device}
				value={toSliderValue(this.state.value)}
				sensitive={4}
				setScrollEnabled={this.props.setScrollEnabled}
				onSlidingStart={this.onSlidingStart}
				onSlidingComplete={this.onSlidingComplete}
				onValueChange={this.onValueChange}
				onLeftStart={this.onTurnOffButtonStart}
				onLeftEnd={this.onTurnOffButtonEnd}
				onRightStart={this.onTurnOnButtonStart}
				onRightEnd={this.onTurnOnButtonEnd}
				onLeft={this.onTurnOff}
				onRight={this.onTurnOn}
			/>
		) : null;

		return (
			<RoundedCornerShadowView onLayout={this.layoutView} style={styles.container}>
				{ offButton }
				{ onButton }
				{ slider }
			</RoundedCornerShadowView>
		);
	}
}

DimmerButton.defaultProps = {
	commandON: 1,
	commandOFF: 2,
	commandDIM: 16,
};

const styles = StyleSheet.create({
	container: {
		flex: 7,
		width: 88,
		height: 32,
		justifyContent: 'center',
		alignItems: 'stretch',
	},
	slider: {
		flex: 1,
		position: 'absolute',
	},
	turnOff: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
	},
	turnOn: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		saveDimmerInitialState: (deviceId, initalValue, initialState) => dispatch(saveDimmerInitialState(deviceId, initalValue, initialState)),
		showDimmerPopup: (name: string, value: number) => {
			dispatch(showDimmerPopup(name, value));
		},
		hideDimmerPopup: () => {
			dispatch(hideDimmerPopup());
		},
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(DimmerButton);

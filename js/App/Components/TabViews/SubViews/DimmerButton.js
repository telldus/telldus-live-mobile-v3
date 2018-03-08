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
import { Animated, StyleSheet } from 'react-native';
import { saveDimmerInitialState, showDimmerPopup, hideDimmerPopup, setDimmerValue, showDimmerStep } from '../../../Actions/Dimmer';
import { deviceSetState, requestDeviceAction } from '../../../Actions/Devices';
import HorizontalSlider from './HorizontalSlider';
import DimmerOffButton from './DimmerOffButton';
import DimmerOnButton from './DimmerOnButton';
import {
	getDimmerValue,
	toDimmerValue,
	toSliderValue,
} from '../../../Lib';

import Theme from '../../../Theme';

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
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
	onSlideActive: () => void,
	onSlideComplete: () => void,
	screenReaderEnabled: boolean,
	showDimmerStep: (number) => void;
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
	showDimmerStep: (number) => void;

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
		this.showDimmerStep = this.showDimmerStep.bind(this);
	}

	componentWillReceiveProps(nextProps: Object) {
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
		this.props.onSlideActive();
		this.props.saveDimmerInitialState(this.props.device.id, this.props.device.value, this.props.device.isInState);
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue: number) {
		this.props.onSlideComplete();
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

	showDimmerStep(id: number) {
		this.props.showDimmerStep(id);
	}

	render() {
		const { device, intl, isGatewayActive, screenReaderEnabled } = this.props;
		const { isInState, name, supportedMethods, methodRequested } = device;
		const { TURNON, TURNOFF, DIM } = supportedMethods;
		const onButton = (
			<DimmerOnButton
				ref={'onButton'}
				style={styles.turnOn}
				isInState={isInState}
				onPress={this.onTurnOn}
				name={name}
				enabled={!!TURNON}
				methodRequested={methodRequested}
				intl={intl}
				isGatewayActive={isGatewayActive}
			/>
		);
		const offButton = (
			<DimmerOffButton
				ref={'offButton'}
				style={styles.turnOff}
				isInState={isInState}
				onPress={this.onTurnOff}
				name={name}
				enabled={!!TURNOFF}
				methodRequested={methodRequested}
				intl={intl}
				isGatewayActive={isGatewayActive}
			/>
		);
		const slider = DIM ? (
			<HorizontalSlider
				style={styles.slider}
				thumbWidth={10}
				thumbHeight={10}
				fontSize={9}
				item={device}
				value={toSliderValue(this.state.value)}
				setScrollEnabled={this.props.setScrollEnabled}
				onSlidingStart={this.onSlidingStart}
				onSlidingComplete={this.onSlidingComplete}
				onValueChange={this.onValueChange}
				onLeftStart={this.onTurnOffButtonStart}
				onLeftEnd={this.onTurnOffButtonEnd}
				onRightStart={this.onTurnOnButtonStart}
				onRightEnd={this.onTurnOnButtonEnd}
				intl={intl}
				isInState={isInState}
				isGatewayActive={isGatewayActive}
				screenReaderEnabled={screenReaderEnabled}
				showDimmerStep={this.showDimmerStep}
			/>
		) : null;

		return (
			<View onLayout={this.layoutView} style={styles.container}>
				{ offButton }
				{ onButton }
				{ slider }
			</View>
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
		flex: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: Theme.Core.rowHeight,
	},
	slider: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'flex-start',
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		left: Theme.Core.buttonWidth,
		bottom: 0,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	turnOff: {
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	turnOn: {
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		marginLeft: Theme.Core.buttonWidth,
		alignItems: 'stretch',
		justifyContent: 'center',
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
});

function mapDispatchToProps(dispatch: Dispatch): Object {
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
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
		showDimmerStep: (id: number) => {
			dispatch(showDimmerStep(id));
		},
	};
}

function mapStateToProps(store: Object, dispatch: Function): Object {
	return {
		screenReaderEnabled: store.App.screenReaderEnabled,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DimmerButton);

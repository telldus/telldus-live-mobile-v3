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

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { View, RoundedCornerShadowView, Icon } from 'BaseComponents';
import { Animated, StyleSheet } from 'react-native';
import { showDimmerPopup, hideDimmerPopup } from 'Actions/Dimmer';
import VerticalSlider from './VerticalSlider';

import throttle from 'lodash/throttle';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const PseudoOffButton = ({ isInState, enabled, request, buttonFadeAnim, circleFadeAnim }) => {
	let blinking = function () {
		Animated.sequence([
			Animated.timing(circleFadeAnim, {
				toValue: 1,
				duration: 500,
			}),
			Animated.timing(circleFadeAnim, {
				toValue: 0,
				duration: 500,
			}),
		]).start(event => {
			if (event.finished) {
				blinking();
			}
		});
	};

	if (request === 'off-request') {
		blinking();
	}

	return (
		<View style={[styles.buttonContainer, { backgroundColor: isInState === 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee' }]}>
			<Animated.Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, {
					color: isInState === 'TURNOFF' && enabled ? 'red' : '#a2a2a2',
					opacity: buttonFadeAnim }]}>
				{'Off'}
			</Animated.Text>
			{
				request === 'off-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.leftCircle, { opacity: circleFadeAnim }]} />
				:
				null
			}
		</View>
	);
};

const PseudoOnButton = ({ isInState, enabled, request, buttonFadeAnim, circleFadeAnim }) => {
	let blinking = function () {
		Animated.sequence([
			Animated.timing(circleFadeAnim, {
				toValue: 1,
				duration: 500,
			}),
			Animated.timing(circleFadeAnim, {
				toValue: 0,
				duration: 500,
			}),
		]).start(event => {
			if (event.finished) {
				blinking();
			}
		});
	};

	if (request === 'on-request') {
		blinking();
	}

	return (
		<View style={[styles.buttonContainer, {
			backgroundColor: isInState !== 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee' }]}>
			<Animated.Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, {
					color: isInState !== 'TURNOFF' && enabled ? 'green' : '#a2a2a2',
					opacity: buttonFadeAnim }]}>
				{'On'}
			</Animated.Text>
			{
				request === 'on-request' ?
				<AnimatedIcon name="circle" size={10} color="orange" style={[styles.rightCircle, { opacity: circleFadeAnim }]} />
				:
				null
			}
		</View>
	);
};


function getDimmerValue(value, isInState) {
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

function toDimmerValue(sliderValue) {
  return Math.round(sliderValue * 255 / 100.0);
}

function toSliderValue(dimmerValue) {
  return Math.round(dimmerValue * 100.0 / 255);
}

class DimmingButton extends View {
	constructor(props) {
		super(props);

		const value = getDimmerValue(this.props.device.value, this.props.device.isInState);
		this.parentScrollEnabled = true;
		this.state = {
			buttonWidth: 0,
			buttonHeight: 0,
			value,
			offButtonFadeAnim: new Animated.Value(1),
			onButtonFadeAnim: new Animated.Value(1),
			fadeAnimLeft: new Animated.Value(0),
			fadeAnimRight: new Animated.Value(0),
			request: 'none',
		};

		this.onValueChangeThrottled = throttle(this.props.onDimmerSlide, 200, {
			trailing: true,
		});

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
		if (nextProps.device.value === this.props.device.value && nextProps.device.isInState === this.props.device.isInState) {
			this.setState({ request: 'none' });
			return;
		}
		const dimmerValue = getDimmerValue(nextProps.device.value, nextProps.device.isInState);
		this.setState({ value: dimmerValue, request: 'none' });
	}

	layoutView(x) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			buttonWidth: width,
			buttonHeight: height,
		});
	}

	onValueChange(sliderValue) {
		this.onValueChangeThrottled(toDimmerValue(sliderValue));
	}

	onSlidingStart(name:String, sliderValue:Number) {
		this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
	}

	onSlidingComplete(sliderValue:Number) {
		this.props.onDim(toDimmerValue(sliderValue));
		this.props.hideDimmerPopup();
	}

	onTurnOffButtonStart() {
		Animated.timing(this.state.offButtonFadeAnim, { toValue: 0.5, duration: 100 }).start();
	}

	onTurnOffButtonEnd() {
		Animated.timing(this.state.offButtonFadeAnim, { toValue: 1, duration: 100 }).start();
	}

	onTurnOnButtonStart() {
		Animated.timing(this.state.onButtonFadeAnim, { toValue: 0.5, duration: 100 }).start();
	}

	onTurnOnButtonEnd() {
		Animated.timing(this.state.onButtonFadeAnim, { toValue: 1, duration: 100 }).start();
	}

	onTurnOn() {
		this.setState({ request: 'on-request' });
		this.props.onTurnOn();
	}

	onTurnOff() {
		this.setState({ request: 'off-request' });
		this.props.onTurnOff();
	}

	render() {
		const { device } = this.props;
		const { TURNON, TURNOFF, DIM } = device.supportedMethods;
		const turnOnButton = <PseudoOnButton isInState={device.isInState} enabled={!!TURNON} request={this.state.request} buttonFadeAnim={this.state.onButtonFadeAnim} circleFadeAnim={this.state.fadeAnimRight} />;
		const turnOffButton = <PseudoOffButton isInState={device.isInState} enabled={!!TURNOFF} request={this.state.request} buttonFadeAnim={this.state.offButtonFadeAnim} circleFadeAnim={this.state.fadeAnimLeft}/>;
		const slider = DIM ?
            <VerticalSlider
				style={[styles.slider, {
  width: this.state.buttonWidth,
  height: this.state.buttonHeight,
  left: 0,
  bottom: 0,
}]}
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
            /> :
            null;

    return (
            <RoundedCornerShadowView
                onLayout={this.layoutView}
                style={styles.container}>
                { turnOffButton }
                { turnOnButton }
                { slider }
            </RoundedCornerShadowView>
    );
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 7,
		width: 88,
		height: 32,
		justifyContent: 'center',
		alignItems: 'stretch',
	},
	buttonContainer: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: 12,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	slider: {
		flex: 1,
		position: 'absolute',
	},
	leftCircle: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	rightCircle: {
		position: 'absolute',
		top: 3,
		right: 3,
	},
});

function mapDispatchToProps(dispatch) {
  return {
    showDimmerPopup: (name:String, value:Number) => {
      dispatch(showDimmerPopup(name, value));
    },
    hideDimmerPopup: () => {
      dispatch(hideDimmerPopup());
    },
  };
}

module.exports = connect(null, mapDispatchToProps)(DimmingButton);

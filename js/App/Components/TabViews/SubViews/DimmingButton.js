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
import { showDimmerPopup, hideDimmerPopup } from 'Actions_Dimmer';
import VerticalSlider from './VerticalSlider';

import throttle from 'lodash/throttle';

const PseudoOffButton = ({ isInState, enabled, fadeAnim }) => (
    <View style={[styles.buttonContainer, {
      backgroundColor: isInState === 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee' }]}>
        <Animated.Text
            ellipsizeMode="middle"
            numberOfLines={1}
			style = {[styles.buttonText, {
  color: isInState === 'TURNOFF' && enabled ? 'red' : '#a2a2a2',
  opacity: fadeAnim }]}>
            {'Off'}
        </Animated.Text>
    </View>
);

const PseudoOnButton = ({ isInState, enabled, fadeAnim }) => (
    <View style={[styles.buttonContainer, {
      backgroundColor: isInState !== 'TURNOFF' && enabled ? '#fafafa' : '#eeeeee' }]}>
        <Animated.Text
            ellipsizeMode="middle"
            numberOfLines={1}
			style = {[styles.buttonText, {
  color: isInState !== 'TURNOFF' && enabled ? 'green' : '#a2a2a2',
  opacity: fadeAnim }]}>
            {'On'}
        </Animated.Text>
    </View>
);


function getDimmerValue(value: number, isInState: string) : number {
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
  onDimmerSlide: number => void,
  showDimmerPopup: (name:string, sliderValue:number) => void,
  hideDimmerPopup: () => void,
  onDim: number => void,
  setScrollEnabled: boolean,
  onTurnOff: () => void,
  onTurnOn: () => void,
};

type State = {
  buttonWidth: number,
  buttonHeight: number,
  value: number,
  offButtonFadeAnim: Object,
  onButtonFadeAnim: Object,
};

class DimmingButton extends View {
  props: Props;
  state: State;
  parentScrollEnabled: boolean;
  onTurnOffButtonStart: () => void;
  onTurnOnButtonEnd: () => void;
  onTurnOnButtonStart: () => void;
  onTurnOnButtonEnd: () => void;
  layoutView: Object => void;
  onSlidingStart: (name:string, sliderValue:number) => void;
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

    this.onValueChangeThrottled = throttle(this.props.onDimmerSlide, 200, {
      trailing: true,
    });

    this.onTurnOffButtonStart = this.onTurnOffButtonStart.bind(this);
    this.onTurnOffButtonEnd = this.onTurnOffButtonEnd.bind(this);
    this.onTurnOnButtonStart = this.onTurnOnButtonStart.bind(this);
    this.onTurnOnButtonEnd = this.onTurnOnButtonEnd.bind(this);
    this.layoutView = this.layoutView.bind(this);
    this.onSlidingStart = this.onSlidingStart.bind(this);
    this.onSlidingComplete = this.onSlidingComplete.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.device.value === this.props.device.value && nextProps.device.isInState === this.props.device.isInState) {
      return;
    }
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
    this.onValueChangeThrottled(toDimmerValue(sliderValue));
  }

  onSlidingStart(name:string, sliderValue:number) {
    this.props.showDimmerPopup(name, toDimmerValue(sliderValue));
  }

  onSlidingComplete(sliderValue:number) {
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

  render() {
    const { device } = this.props;
    const { TURNON, TURNOFF, DIM } = device.supportedMethods;
    const turnOnButton = <PseudoOnButton isInState={device.isInState} enabled={!!TURNON} fadeAnim={this.state.onButtonFadeAnim} />;
    const turnOffButton = <PseudoOffButton isInState={device.isInState} enabled={!!TURNOFF} fadeAnim={this.state.offButtonFadeAnim} />;
    const slider = DIM ?
      <VerticalSlider
				style={[styles.slider, { width: this.state.buttonWidth, height: this.state.buttonHeight, left: 0, bottom: 0 }]}
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
				onLeft={this.props.onTurnOff}
				onRight={this.props.onTurnOn}
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
});

function mapDispatchToProps(dispatch) {
  return {
    showDimmerPopup: (name:string, value:number) => {
      dispatch(showDimmerPopup(name, value));
    },
    hideDimmerPopup: () => {
      dispatch(hideDimmerPopup());
    },
  };
}

module.exports = connect(null, mapDispatchToProps)(DimmingButton);

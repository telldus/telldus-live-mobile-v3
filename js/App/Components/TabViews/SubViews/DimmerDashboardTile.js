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

import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import { showDimmerPopup, hideDimmerPopup } from 'Actions/Dimmer';
import VerticalSlider from './VerticalSlider';
import PseudoOffButton from './PseudoOffButton';
import PseudoOnButton from './PseudoOnButton';
import throttle from 'lodash/throttle';

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

class DimmerDashboardTile extends View {
  constructor(props) {
    super(props);
    const { item, onDimmerSlide } = this.props;
    const { value, isInState } = item;
    this.parentScrollEnabled = true;
    this.state = {
      bodyWidth: 0,
      bodyHeight: 0,
      value: getDimmerValue(value, isInState),
    };

    this.onValueChangeThrottled = throttle(onDimmerSlide, 200, {
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
    const { value, isInState } = nextProps.item;

    const dimmerValue = getDimmerValue(value, isInState);
    this.setState({ value: dimmerValue });
  }

  layoutView(x) {
    let { width, height } = x.nativeEvent.layout;
    this.setState({
      bodyWidth: width,
      bodyHeight: height,
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

  render() {
    const { item, tileWidth } = this.props;
    const { name, isInState, supportedMethods, methodRequested } = item;
    const { TURNON, TURNOFF, DIM } = supportedMethods;

    const onButton = <PseudoOnButton ref={'onButton'} isInState={isInState} enabled={!!TURNON} style={styles.turnOn} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested} />;
    const offButton = <PseudoOffButton ref={'offButton'} isInState={isInState} enabled={!!TURNOFF} style={styles.turnOff} fontSize={Math.floor(tileWidth / 8)} methodRequested={methodRequested} />;
    const slider = DIM ?
			<VerticalSlider
				style={[styles.slider, { width: this.state.bodyWidth, height: this.state.bodyHeight, left: 0, bottom: 0 }]}
				thumbWidth={this.state.bodyWidth / 5}
				item={item}
				value={toSliderValue(this.state.value)}
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
			<DashboardShadowTile
				isEnabled={isInState === 'TURNON' || isInState === 'DIM'}
				name={name}
				tileWidth={tileWidth}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={styles.body} onLayout={this.layoutView}>
					{ offButton }
					{ onButton }
					{ slider }
				</View>
			</DashboardShadowTile>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  body: {
    flex: 30,
    flexDirection: 'row',
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
  },
  turnOn: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    borderTopRightRadius: 7,
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

module.exports = connect(null, mapDispatchToProps)(DimmerDashboardTile);

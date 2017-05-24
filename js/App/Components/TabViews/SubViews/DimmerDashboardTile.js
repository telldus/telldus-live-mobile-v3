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
import { StyleSheet, Animated } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import { showDimmerPopup, hideDimmerPopup } from 'Actions/Dimmer';
import VerticalSlider from './VerticalSlider';

import throttle from 'lodash/throttle';

const PseudoOffButton = ({ isInState, enabled, tileWidth, fadeAnim }) => (
	<View style={[styles.turnOffButtonContainer, isInState === 'TURNOFF' && enabled ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled]}>
		<Animated.Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style = {[styles.buttonText, isInState === 'TURNOFF' ? styles.buttonOffEnabled : styles.buttonOffDisabled,
				{ fontSize: Math.floor(tileWidth / 8),
					opacity: fadeAnim }]}>
			{'Off'}
		</Animated.Text>
	</View>
);

const PseudoOnButton = ({ isInState, enabled, tileWidth, fadeAnim }) => (
	<View style={[styles.turnOnButtonContainer, isInState !== 'TURNOFF' && enabled ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled]}>
		<Animated.Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style = {[styles.buttonText, isInState !== 'TURNOFF' ? styles.buttonOnEnabled : styles.buttonOnDisabled,
				{ fontSize: Math.floor(tileWidth / 8),
					opacity: fadeAnim }]}>
			{'On'}
		</Animated.Text>
	</View>
);

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
			offButtonFadeAnim: new Animated.Value(1),
			onButtonFadeAnim: new Animated.Value(1),
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
		if (value === this.props.item.value && isInState === this.props.item.isInState) {
			return;
		}
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
		const { item, tileWidth } = this.props;
		const { name, isInState, supportedMethods } = item;
		const { TURNON, TURNOFF, DIM } = supportedMethods;
		const turnOnButton = <PseudoOnButton isInState={isInState} enabled={!!TURNON} tileWidth={tileWidth} fadeAnim={this.state.onButtonFadeAnim}/>;
		const turnOffButton = <PseudoOffButton isInState={isInState} enabled={!!TURNOFF} tileWidth={tileWidth} fadeAnim={this.state.offButtonFadeAnim}/>;
		const slider = DIM ?
			<VerticalSlider
				style={[styles.slider, {
					width: this.state.bodyWidth,
					height: this.state.bodyHeight,
					left: 0,
					bottom: 0,
				}]}
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
				style={[this.props.style, {
					width: tileWidth,
					height: tileWidth,
				}]}>
				<View style={styles.body} onLayout={this.layoutView}>
					{ turnOffButton }
					{ turnOnButton }
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
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	slider: {
		flex: 1,
		position: 'absolute',
	},
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
		justifyContent: 'center',
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
		justifyContent: 'center',
	},
	buttonBackgroundEnabled: {
		backgroundColor: 'white',
	},
	buttonBackgroundDisabled: {
		backgroundColor: '#eeeeee',
	},
	buttonOnEnabled: {
		color: 'green',
	},
	buttonOnDisabled: {
		color: '#a0a0a0',
	},
	buttonOffEnabled: {
		color: 'red',
	},
	buttonOffDisabled: {
		color: '#a0a0a0',
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

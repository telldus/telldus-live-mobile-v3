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
import { Text, View } from '../../../../BaseComponents';
import { PanResponder, Animated, StyleSheet, Vibration, Platform } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import Theme from 'Theme';

function getSliderLabel(value:number, intl: intlShape):string {
	return value.toString();
}

type Props = {
	setScrollEnabled: boolean => void,
	thumbHeight: number,
	thumbWidth: number,
	sensitive: number,
	value: number,
	onSlidingStart: (string, number) => void,
	onSlidingComplete: number => void,
	onValueChange: number => void,
	onLeftStart: () => void,
	onLeftEnd: () => void,
	onLeft: () => void,
	onRightStart: () => void,
	onRightEnd: () => void,
	onRight: () => void,
	item: Object,
	fontSize: number,
	style: Object,
	intl: intlShape.isRequired,
	isGatewayActive: boolean,
	isInState: string,
};

type State = {
	containerWidth: number,
	containerHeight: number,
	scaleWidth: number,
	scaleHeight: number,
	value: Object,
	minimumValue: number,
	maximumValue: number,
	step: number,
	displayedValue: string,
};

class HorizontalSlider extends View {
	props: Props;
	state: State;

	activeSlider: boolean;
	layoutView: Object => void;
	layoutScale: Object => void;

	constructor(props: Props) {
		super(props);
		this.parentScrollEnabled = true;
		this.state = {
			containerWidth: 0,
			containerHeight: 0,
			scaleWidth: 0,
			scaleHeight: 0,
			value: new Animated.Value(this.props.value),
			minimumValue: 0,
			maximumValue: 100,
			step: 1,
			displayedValue: getSliderLabel(this.props.value, this.props.intl),
		};
		this.activeSlider = false;

		this.layoutView = this.layoutView.bind(this);
		this.layoutScale = this.layoutScale.bind(this);
	}

	componentWillMount() {
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
			onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
			onPanResponderGrant: this.handlePanResponderGrant,
			onPanResponderMove: this.handlePanResponderMove,
			onPanResponderRelease: this.handlePanResponderEnd,
			onPanResponderTerminationRequest: this.handlePanResponderTerminationRequest,
			onPanResponderTerminate: this.handlePanResponderEnd,
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		const newValue = nextProps.value;
		this.setCurrentValueAnimate(newValue);
		this.onValueChange(newValue);
	}

	handleStartShouldSetPanResponder = (e: Object, /* gestureState: Object */): boolean => {
		// Should we become active when the user presses down on the thumb?
		return true;
	};

	handleMoveShouldSetPanResponder = (/* e: Object, gestureState: Object */): boolean => {
		// Should we become active when the user moves a touch over the thumb?
		return false;
	};

	handlePanResponderGrant = (e: Object, gestureState: Object) => {
		this.longPressTimeout = setTimeout(this.startSliding, 500);

		if (e.nativeEvent.locationX <= this.state.containerWidth / 2) {
			this.props.onLeftStart();
			this.pressOnLeft = true;
			this.pressOnRight = false;
		} else {
			this.props.onRightStart();
			this.pressOnLeft = false;
			this.pressOnRight = true;
		}
	};

	startSliding = () => {
		const { item, onLeftEnd, onRightEnd, onSlidingStart } = this.props;
		this.previousLeft = this.getThumbLeft(this.state.value.__getValue());

		if (onSlidingStart) {
			onSlidingStart(item.name, this.state.value.__getValue());
		}
		this.activeSlider = true;
		if (this.parentScrollEnabled) {
			// disable scrolling on the listView parent
			this.parentScrollEnabled = false;
			this.props.setScrollEnabled && this.props.setScrollEnabled(false);
		}
		onLeftEnd();
		onRightEnd();
		this.pressOnLeft = this.pressOnRight = false;

		if (Platform.OS === 'android') {
			Vibration.vibrate([0, 25]);
		}
	};

	handlePanResponderMove = (e: Object, gestureState: Object) => {
		if (this.activeSlider) {

			this.setCurrentValue(this.getValue(gestureState));

			if (this.props.onValueChange) {
				this.props.onValueChange(this.state.value.__getValue());
			}

			// update the progress text
			this.onValueChange(this.state.value.__getValue());
		}
	};

	handlePanResponderEnd = (e: Object, gestureState: Object) => {
		if (this.activeSlider) {
			// re-enable scrolling on listView parent
			if (!this.parentScrollEnabled) {
				this.parentScrollEnabled = true;
				this.props.setScrollEnabled && this.props.setScrollEnabled(true);
			}

			this.setCurrentValue(this.getValue(gestureState));

			if (this.props.onSlidingComplete) {
				this.props.onSlidingComplete(this.state.value.__getValue());
			}
		}
		this.pressOnLeft = this.pressOnRight = false;
		this.props.onLeftEnd();
		this.props.onRightEnd();
		this.activeSlider = false;
		clearTimeout(this.longPressTimeout);
	};

	handlePanResponderTerminationRequest = (e: Object, gestureState: Object) => {
		return false;
	}

	handlePanResponderTerminate = (e: Object, gestureState: Object) => {
		if (e.nativeEvent.locationX <= this.state.containerWidth / 2) {
			this.props.onLeftEnd();
		} else {
			this.props.onRightEnd();
		}

		this.activeSlider = false;
		clearTimeout(this.longPressTimeout);
	};

	getThumbLeft(value: number) {
		const ratio = this.getRatio(value);
		return ratio * (this.state.scaleWidth - this.props.thumbWidth);
	}

	getRatio(value: number): number {
		return (value - this.state.minimumValue) / (this.state.maximumValue - this.state.minimumValue);
	}

	setCurrentValue(value: number) {
		this.state.value.setValue(value);
	}

	setCurrentValueAnimate(value: number) {
		Animated.timing(this.state.value, { toValue: value, duration: 250 }).start();
	}

	getValue(gestureState: Object) {
		const length = this.state.scaleWidth - this.props.thumbWidth;
		const thumbLeft = this.previousLeft + gestureState.dx / this.props.sensitive;
		const ratio = thumbLeft / length;
		if (this.state.step) {
			return Math.max(
				this.state.minimumValue,
				Math.min(
					this.state.maximumValue,
					this.state.minimumValue + Math.round(ratio * (this.state.maximumValue - this.state.minimumValue)
					                                     / this.state.step) * this.state.step
				)
			);
		}
		return Math.max(
			this.state.minimumValue,
			Math.min(
				this.state.maximumValue,
				ratio * (this.state.maximumValue - this.state.minimumValue) + this.state.minimumValue
			)
		);
	}

	layoutView(x: Object) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			containerWidth: width,
			containerHeight: height,
		});
	}

	layoutScale(event: Object) {
		let { width, height } = event.nativeEvent.layout;
		this.setState({
			scaleWidth: width,
			scaleHeight: height,
		});
	}

	onValueChange(val: number) {
		this.setState({ displayedValue: getSliderLabel(val, this.props.intl) });
	}

	render() {
		const { minimumValue, maximumValue, value, containerHeight, containerWidth, scaleWidth } = this.state;
		const { thumbWidth, thumbHeight, isGatewayActive, isInState } = this.props;
		const thumbLeft = value.interpolate({
			inputRange: [minimumValue, maximumValue],
			outputRange: [0, scaleWidth - thumbWidth],
		});

		let thumbStyle = !isGatewayActive ? styles.offline :
			(isInState === 'TURNOFF' ? styles.enabledOff : styles.enabled);
		let scaleStyle = !isGatewayActive ? styles.offline :
			(isInState === 'TURNOFF' ? styles.enabledOff : styles.enabled);
		let styleBackground = styles.disabled;

		return (
			<View style={[this.props.style, styleBackground]} onLayout={this.layoutView} {...this.panResponder.panHandlers}>
				<View style={[styles.sliderScale, scaleStyle, {
					height: thumbHeight / 3,
					width: (containerWidth - (2 * thumbWidth)),
					marginLeft: thumbWidth,
				}]} onLayout={this.layoutScale}/>
				<Animated.View style={[
					styles.thumb, thumbStyle, {
						width: thumbWidth,
						height: thumbHeight,
						borderRadius: thumbHeight / 2,
						left: thumbWidth,
						transform: [{ translateX: thumbLeft }],
					},
				]}/>
				<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {[styles.thumbText, {
						fontSize: this.props.fontSize,
						bottom: (containerHeight - thumbHeight) / 3.8,
					}]}>
					{this.state.displayedValue}%
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	enabledBackground: {
		backgroundColor: '#fff',
	},
	enabled: {
		backgroundColor: Theme.Core.brandSecondary,
	},
	enabledOff: {
		backgroundColor: Theme.Core.brandPrimary,
	},
	disabled: {
		backgroundColor: '#eeeeee',
	},
	offline: {
		backgroundColor: '#a2a2a2',
	},
	thumb: {
		flex: 1,
		position: 'absolute',
		justifyContent: 'center',
		elevation: 2,
	},
	sliderScale: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	thumbText: {
		position: 'absolute',
		color: '#a2a2a2',
		textAlign: 'center',
		textAlignVertical: 'center',
		alignSelf: 'center',
	},
});

HorizontalSlider.defaultProps = {
	thumbHeight: 12,
	thumbWidth: 12,
	fontSize: 10,
	sensitive: 1,
	value: 0,
};

module.exports = injectIntl(HorizontalSlider);

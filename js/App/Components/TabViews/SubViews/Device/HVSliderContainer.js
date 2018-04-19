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
import { PanResponder, Animated, StyleSheet, Vibration, Platform, TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import { View } from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

function getSliderLabel(value: number, intl: intlShape): string {
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
	onPress: () => void;
	item: Object,
	fontSize: number,
	style: Object,
	intl: intlShape.isRequired,
	isGatewayActive: boolean,
	isInState: string,
	screenReaderEnabled: boolean,
	showDimmerStep: (number) => void;
	accessibilityLabel?: string,
	children?: Object | Array<any>,
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
	DimmerStep: boolean,
};

class HVSliderContainer extends View {
	props: Props;
	state: State;

	activeSlider: boolean;
	hasMoved: boolean;
	layoutView: Object => void;
	onPressDimmer: () => void;

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
			DimmerStep: false,
		};
		this.activeSlider = false;
		this.hasMoved = false;

		this.layoutView = this.layoutView.bind(this);
		this.onPressDimmer = this.onPressDimmer.bind(this);

		this.buttonOpacity = new Animated.Value(1);
	}

	componentWillMount() {
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
			onStartShouldSetPanResponderCapture: this.handleStartShouldSetPanResponderCapture,
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

	handleStartShouldSetPanResponderCapture = (e: Object, /* gestureState: Object */): boolean => {
		// Should we become active when the user presses down on the thumb, preventing any child node?
		return true;
	};

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
		let { screenReaderEnabled, onPress } = this.props;
		if (onPress && !screenReaderEnabled) {
			this.onPressIn();
		}
	};

	startSliding = () => {
		let { screenReaderEnabled, onPress, item, onSlidingStart } = this.props;
		if (onPress && !screenReaderEnabled) {
			this.buttonOpacity.setValue(1);
		}
		this.previousLeft = this.getThumbLeft(this.state.value.__getValue());
		this.previousBottom = this.getThumbBottom(this.state.value.__getValue());

		if (onSlidingStart) {
			onSlidingStart(item.name, this.state.value.__getValue());
		}
		this.activeSlider = true;
		if (this.parentScrollEnabled) {
			// disable scrolling on the listView parent
			this.parentScrollEnabled = false;
			this.props.setScrollEnabled && this.props.setScrollEnabled(false);
		}

		if (Platform.OS === 'android') {
			Vibration.vibrate([0, 25]);
		}
	};

	handlePanResponderMove = (e: Object, gestureState: Object) => {
		const { dx, dy } = 	gestureState;
		if (dx !== 0 || dy !== 0) {
			this.hasMoved = true;
		}
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
		let { screenReaderEnabled, onPress } = this.props;
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
		} else if (!this.hasMoved && onPress) {
			onPress();
		}
		if (onPress && !screenReaderEnabled) {
			this.onPressOut();
		}

		this.activeSlider = false;
		this.hasMoved = false;
		clearTimeout(this.longPressTimeout);
	};

	handlePanResponderTerminationRequest = (e: Object, gestureState: Object): boolean => {
		return false;
	}

	handlePanResponderTerminate = (e: Object, gestureState: Object) => {
		this.activeSlider = false;
		clearTimeout(this.longPressTimeout);
	};

	getThumbLeft(value: number): number {
		const ratio = this.getRatio(value);
		return ratio * (this.state.containerWidth - this.props.thumbWidth);
	}

	getThumbBottom(value: number): number {
		const ratio = this.getRatio(value);
		return ratio * (this.state.containerHeight - this.props.thumbHeight);
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

	getValue(gestureState: Object): number {
		if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
			return this.getValueHorizontal(gestureState);
		}
		return this.getValueVertical(gestureState);
	}

	getValueVertical(gestureState: Object): number {
		const length = this.state.containerHeight - this.props.thumbHeight;
		const thumbBottom = this.previousBottom - gestureState.dy / this.props.sensitive;
		const ratio = thumbBottom / length;

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

	getValueHorizontal(gestureState: Object): number {
		const length = this.state.containerWidth - this.props.thumbWidth;
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

	onValueChange(val: number) {
		this.setState({ displayedValue: getSliderLabel(val, this.props.intl) });
	}

	onPressDimmer() {
		let { showDimmerStep, item } = this.props;
		if (showDimmerStep) {
			showDimmerStep(item.id);
		}
	}

	render(): Object {
		const { screenReaderEnabled, children, accessibilityLabel } = this.props;
		const { containerWidth, containerHeight, displayedValue, value } = this.state;

		let styleBackground = styles.disabled;

		let Parent = Animated.View;
		let parentProps = {
			...this.panResponder.panHandlers,
		};
		if (screenReaderEnabled) {
			Parent = TouchableOpacity;
			parentProps = {
				disabled: !screenReaderEnabled,
				onPress: this.onPressDimmer,
			};
		}

		return (
			<Parent style={[this.props.style, styleBackground, {opacity: this.buttonOpacity}]} onLayout={this.layoutView} {...parentProps} accessibilityLabel={accessibilityLabel}>
				{
					React.Children.map(children, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							return React.cloneElement(child, {
								value,
								displayedValue,
								containerWidth,
								containerHeight,
							});
						}
						return null;
					})
				}
			</Parent>
		);
	}

	onPressIn = () => {
		Animated.timing(
			this.buttonOpacity,
			{
				toValue: 0.2,
				duration: 10,
				useNativeDriver: true,
			},
		).start();
	};

	onPressOut = () => {
		Animated.timing(
			this.buttonOpacity,
			{
				toValue: 1,
				duration: 10,
				useNativeDriver: true,
			},
		).start();
	};
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
		textAlign: 'center',
		textAlignVertical: 'center',
		alignSelf: 'center',
	},
});

HVSliderContainer.defaultProps = {
	thumbHeight: 12,
	thumbWidth: 12,
	fontSize: 10,
	sensitive: 1,
	value: 0,
};

module.exports = injectIntl(HVSliderContainer);

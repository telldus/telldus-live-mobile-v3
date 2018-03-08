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

import i18n from '../../../Translations/common';

function getSliderLabel(value: number, intl: intlShape): string {
	if (value === 100) {
		return intl.formatMessage(i18n.on);
	}
	if (value === 0) {
		return intl.formatMessage(i18n.off);
	}
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
};

type State = {
	containerWidth: number,
	containerHeight: number,
	value: Object,
	minimumValue: number,
	maximumValue: number,
	step: number,
	displayedValue: string,
};

class VerticalSlider extends View {
	props: Props;
	state: State;

	activeSlider: boolean;
	layoutView: Object => void;

	constructor(props: Props) {
		super(props);
		this.parentScrollEnabled = true;
		this.state = {
			containerWidth: 0,
			containerHeight: 0,
			value: new Animated.Value(this.props.value),
			minimumValue: 0,
			maximumValue: 100,
			step: 1,
			displayedValue: getSliderLabel(this.props.value, this.props.intl),
		};
		this.activeSlider = false;

		this.layoutView = this.layoutView.bind(this);
	}

	componentWillMount() {
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
			onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
			onPanResponderGrant: this.handlePanResponderGrant,
			onPanResponderMove: this.handlePanResponderMove,
			onPanResponderRelease: this.handlePanResponderEnd,
			onPanResponderTerminationRequest: this.handlePanResponderEnd,
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
		} else if (e.nativeEvent.locationX <= this.state.containerWidth / 2) {
			if (this.pressOnLeft) {
				this.props.onLeft();
			}

		} else if (this.pressOnRight) {
			this.props.onRight();
		}
		this.pressOnLeft = this.pressOnRight = false;
		this.props.onLeftEnd();
		this.props.onRightEnd();
		this.activeSlider = false;
		clearTimeout(this.longPressTimeout);
	};

	handlePanResponderTerminate = (e: Object, gestureState: Object) => {
		if (e.nativeEvent.locationX <= this.state.containerWidth / 2) {
			this.props.onLeftEnd();
		} else {
			this.props.onRightEnd();
		}

		this.activeSlider = false;
		clearTimeout(this.longPressTimeout);
	};

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

	render(): React$Element<any> {
		const { minimumValue, maximumValue, value, containerHeight } = this.state;
		const { thumbWidth, thumbHeight } = this.props;
		const thumbBottom = value.interpolate({
			inputRange: [minimumValue, maximumValue],
			outputRange: [0, thumbHeight - containerHeight],
		});

		return (
			<View style={[this.props.style]} onLayout={this.layoutView} {...this.panResponder.panHandlers}>
				<Animated.View style={[
					styles.thumb, {
						width: thumbWidth,
						height: thumbHeight,
						left: (this.state.containerWidth - thumbWidth) / 2,
						transform: [{ translateY: thumbBottom }],
					},
				]}>
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						style = {[styles.thumbText, { fontSize: this.props.fontSize }]}>
						{this.state.displayedValue}
					</Text>
				</Animated.View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	thumb: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		justifyContent: 'center',
		borderRadius: 7,
		borderWidth: 1,
		borderColor: 'gray',
		elevation: 2,
		backgroundColor: 'white',
	},
	thumbText: {
		color: '#a2a2a2',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});

VerticalSlider.defaultProps = {
	thumbHeight: 12,
	thumbWidth: 36,
	fontSize: 10,
	sensitive: 1,
	value: 0,
};

module.exports = injectIntl(VerticalSlider);

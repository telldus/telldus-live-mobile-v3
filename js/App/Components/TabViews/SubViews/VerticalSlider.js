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

import React, { PropTypes } from 'react';
import { Text, View } from 'BaseComponents';
import { PanResponder, Animated, StyleSheet } from 'react-native';

function getSliderLabel(value) {
	if (value === 100) {
		return 'On';
	}
	if (value === 0) {
		return 'Off';
	}
	return value;
}

class VerticalSlider extends View {
	constructor(props) {
		super(props);
		this.parentScrollEnabled = true;
		this.state = {
			containerWidth: 0,
			containerHeight: 0,
			value: new Animated.Value(this.props.value),
			minimumValue: 0,
			maximumValue: 100,
			step: 1,
			displayedValue: getSliderLabel(this.props.value),
		};
	}

	componentWillMount() {
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
			onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
			onPanResponderGrant: this.handlePanResponderGrant,
			onPanResponderMove: this.handlePanResponderMove,
			onPanResponderRelease: this.handlePanResponderEnd,
			onPanResponderTerminationRequest: this.handlePanResponderRequestEnd,
			onPanResponderTerminate: this.handlePanResponderEnd,
		});
	}

	componentWillReceiveProps(nextProps) {
		const newValue = nextProps.value;
		this.setCurrentValue(newValue);
		this.onValueChange(this.state.value.__getValue());
	}

	handleStartShouldSetPanResponder = (e: Object, /*gestureState: Object*/): boolean => {
        // Should we become active when the user presses down on the thumb?
		return true;
	}

	handleMoveShouldSetPanResponder = (/*e: Object, gestureState: Object*/): boolean => {
        // Should we become active when the user moves a touch over the thumb?
		return false;
	}

	handlePanResponderGrant = (/*e: Object, gestureState: Object*/) => {
		const { item, onSlidingStart } = this.props;
		this.previousBottom = this.getThumbBottom(this.state.value.__getValue());
		if (onSlidingStart) {
			onSlidingStart(item.name, this.state.value.__getValue());
		}
	}

	handlePanResponderMove = (e: Object, gestureState: Object) => {
		if (this.parentScrollEnabled) {
			// disable scrolling on the listView parent
			this.parentScrollEnabled = false;
			this.props.setScrollEnabled && this.props.setScrollEnabled(false);
		}

		this.setCurrentValue(this.getValue(gestureState));

		if (this.props.onValueChange) {
			this.props.onValueChange(this.state.value.__getValue());
		}

        // update the progress text
		this.onValueChange(this.state.value.__getValue());
	}

	handlePanResponderEnd = (e: Object, gestureState: Object) => {
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

	getThumbBottom(value) {
		const ratio = this.getRatio(value);
		return ratio * (this.state.containerHeight - this.props.thumbHeight);
	}

	getRatio(value) {
		return (value - this.state.minimumValue) / (this.state.maximumValue - this.state.minimumValue);
	}

	setCurrentValue(value) {
		this.state.value.setValue(value);
	}

	getValue(gestureState) {
		const length = this.state.containerHeight - this.props.thumbHeight;
		const thumbBottom = this.previousBottom - gestureState.dy;
		const ratio = thumbBottom / length;

		if (this.state.step) {
			return Math.max(this.state.minimumValue,
                Math.min(this.state.maximumValue,
                this.state.minimumValue + Math.round(ratio * (this.state.maximumValue - this.state.minimumValue) / this.state.step) * this.state.step)
            );
		}
		return Math.max(this.state.minimumValue,
            Math.min(this.state.maximumValue,
                ratio * (this.state.maximumValue - this.state.minimumValue) + this.state.minimumValue)
        );
	}

	layoutView(x) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			containerWidth: width,
			containerHeight: height,
		});
	}

	onValueChange(val) {
		this.setState({ displayedValue: getSliderLabel(val) });
	}

	render() {
		const { minimumValue, maximumValue, value, containerHeight } = this.state;
		const { thumbHeight } = this.props;
		const thumbBottom = value.interpolate({
			inputRange: [minimumValue, maximumValue],
			outputRange: [0, thumbHeight - containerHeight],
		});
		return (
            <View style={[this.props.style]}
                onLayout={this.layoutView.bind(this)}>
                <Animated.View style={[styles.thumb, {
	width: this.state.containerWidth,
	height: thumbHeight,
	transform: [{ translateY: thumbBottom }],
}]}
                    {...this.panResponder.panHandlers}>
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

VerticalSlider.propTypes = {
	setScrollEnabled: PropTypes.func,
	thumbHeight: PropTypes.number,
	value: PropTypes.number,
	onSlidingStart: PropTypes.func,
	onSlidingComplete: PropTypes.func,
	onValueChange: PropTypes.func,
};

VerticalSlider.defaultProps = {
	thumbHeight: 12,
	fontSize: 10,
	value: 0,
};

module.exports = VerticalSlider;

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

import React, { Component } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION = INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

class DimmerProgressBar extends Component {
	constructor(props) {
		super(props);
		const progress = Math.min(Math.max(props.progress, 0), 1);
		this.state = {
			progress: new Animated.Value(props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress),
			animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION),
			containerWidth: 0,
			containerHeight: 0,
		};

		this.layoutView = this.layoutView.bind(this);
	}

	componentDidMount() {
		if (this.props.indeterminate) {
			this.animate();
		}
	}

	componentWillReceiveProps(props) {
		if (props.indeterminate !== this.props.indeterminate) {
			if (props.indeterminate) {
				this.animate();
			} else {
				Animated.spring(this.state.animationValue, {
					toValue: BAR_WIDTH_ZERO_POSITION,
				}).start();
			}
		}

		if (props.indeterminate !== this.props.indeterminate ||
            props.progress !== this.props.progress) {
			const progress = (props.indeterminate
                ? INDETERMINATE_WIDTH_FACTOR
                : Math.min(Math.max(props.progress, 0), 1));

			if (props.animated) {
				Animated.spring(this.state.progress, {
					toValue: progress,
					bounciness: 0,
				}).start();
			} else {
				this.state.progress.setValue(progress);
			}
		}
	}

	layoutView(x) {
		let { width, height } = x.nativeEvent.layout;
		this.setState({
			containerWidth: width,
			containerHeight: height,
		});
	}

	animate() {
		this.state.animationValue.setValue(0);
		Animated.timing(this.state.animationValue, {
			toValue: 1,
			duration: 1000,
			easing: Easing.linear,
			isInteraction: false,
		}).start((endState) => {
			if (endState.finished) {
				this.animate();
			}
		});
	}

	render() {
		const { borderColor, borderRadius, borderWidth, color, height, style, unfilledColor, width, ...restProps } = this.props;

		const innerWidth = width - (borderWidth * 2);
		const containerStyle = {
			width,
			borderWidth,
			borderColor: borderColor || color,
			borderRadius,
			overflow: 'hidden',
			backgroundColor: unfilledColor,
			justifyContent: 'center', alignItems: 'center',
		};

		const progressStyle = {
			backgroundColor: color,
			height,
			width: innerWidth,
			transform: [{
				translateX: this.state.animationValue.interpolate({
					inputRange: [0, 1],
					outputRange: [innerWidth * -INDETERMINATE_WIDTH_FACTOR, innerWidth],
				}),
			}, {
				translateX: this.state.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [innerWidth / -2, 0],
				}),
			}, {
				scaleX: this.state.progress,
			}],
		};

		let progressText = '';

		if (this.props.progress === 0) {
			progressText = 'Off';
		} else if (this.props.progress === 1) {
			progressText = 'On';
		} else {
			progressText = `${Math.round(this.props.progress * 100)}%`;
		}

		return (
            <View
                onLayout={this.layoutView}
                style={[containerStyle, style]}
                {...restProps}>
                <Animated.View style={progressStyle} />
                <View style={[styles.textContainer, {
	width: this.state.containerWidth,
	height: this.state.containerHeight }]}>
                    <Text ellipsizeMode="middle"
                        style={styles.text}>
                        {progressText}
                    </Text>
                </View>
            </View>
		);
	}
}

const styles = StyleSheet.create({
	textContainer: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#1a355b',
		backgroundColor: 'transparent',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});

DimmerProgressBar.propTypes = {
	animated: React.PropTypes.bool,
	borderColor: React.PropTypes.string,
	borderRadius: React.PropTypes.number,
	borderWidth: React.PropTypes.number,
	children: React.PropTypes.node,
	color: React.PropTypes.string,
	height: React.PropTypes.number,
	indeterminate: React.PropTypes.bool,
	progress: React.PropTypes.number,
	unfilledColor: React.PropTypes.string,
	width: React.PropTypes.number,
};

DimmerProgressBar.defaultProps = {
	animated: true,
	borderRadius: 4,
	borderWidth: 1,
	color: 'rgba(0, 122, 255, 1)',
	height: 6,
	indeterminate: false,
	progress: 0,
	width: 150,
};
module.exports = DimmerProgressBar;

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

import React, { Component } from 'react';
import { Animated, Easing, View } from 'react-native';

import {
	withTheme,
} from '../App/Components/HOC/withTheme';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION = INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

type Props = {|
	progress: number,
	indeterminate: boolean,
	animated: boolean,
	borderColor?: string,
	borderRadius: number,
	borderWidth: number,
	color: string,
	height: number,
	style: Object,
	unfilledColor?: string,
	width: number,
	colors: Object,
|};

type DefaultProps = {
	animated: boolean,
	borderRadius: number,
	borderWidth: number,
	height: number,
	indeterminate: boolean,
	progress: number,
	width: number,
};

type State = {
	progress: Object,
	animationValue: Object,
	indeterminate: boolean,
};

const animate = (animationValue: any) => {
	animationValue.setValue(0);
	Animated.timing(animationValue, {
		toValue: 1,
		duration: 1000,
		easing: Easing.linear,
		isInteraction: false,
		useNativeDriver: true,
	}).start((endState: Object) => {
		if (endState.finished) {
			animate(animationValue);
		}
	});
};

class ProgressBarLinear extends Component<Props, State> {
	props: Props;
	static defaultProps: DefaultProps;
	state: State;

	static getDerivedStateFromProps(props: Object, state: Object): Object | null {
		if (props.indeterminate !== state.indeterminate) {
			if (props.indeterminate) {
				animate(state.animationValue);
			} else {
				Animated.spring(state.animationValue, {
					toValue: BAR_WIDTH_ZERO_POSITION,
					useNativeDriver: true,
				}).start();
			}
		}

		if (props.indeterminate !== state.indeterminate ||
		    props.progress !== state.progress) {
			const progress = (props.indeterminate
				? INDETERMINATE_WIDTH_FACTOR
				: Math.min(Math.max(props.progress, 0), 1));
			if (props.animated) {
				Animated.spring(state.progress, {
					toValue: progress,
					bounciness: 0,
					useNativeDriver: true,
				}).start();
			} else {
				state.progress.setValue(progress);
			}
		}
		if (props.indeterminate !== state.indeterminate) {
			return {
				indeterminate: props.indeterminate,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		const progress = Math.min(Math.max(props.progress, 0), 1);
		this.state = {
			progress: new Animated.Value(props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress),
			animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION),
			indeterminate: props.indeterminate,
		};
	}

	componentDidMount() {
		if (this.props.indeterminate) {
			animate(this.state.animationValue);
		}
	}

	render(): React$Element<any> {
		this.state.progress._value = Math.max(0.0001, this.state.progress._value); // fix a bug in android :
	                                                                               // https://github.com/facebook/react-native/issues/6278

		const {
			borderColor,
			borderRadius,
			borderWidth,
			color,
			height,
			style,
			unfilledColor,
			width,
			colors,
			// eslint-disable-next-line no-unused-vars
			animated, indeterminate, progress,
			...restProps
		} = this.props;

		const {
			inAppBrandSecondary,
		} = colors;

		const _color = color || inAppBrandSecondary;

		const innerWidth = width - (borderWidth * 2);
		const containerStyle = {
			width,
			borderWidth,
			borderColor: borderColor || _color,
			borderRadius,
			overflow: 'hidden',
			backgroundColor: unfilledColor,
			justifyContent: 'center',
			alignItems: 'center',
		};

		const progressStyle = {
			backgroundColor: _color,
			height,
			width: innerWidth,
			transform: [
				{
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
				},
			],
		};

		return (
			<View
				{...restProps}
				style={[containerStyle, style]}>
				<Animated.View style={progressStyle}/>
			</View>
		);
	}
}

ProgressBarLinear.defaultProps = {
	animated: true,
	borderRadius: 4,
	borderWidth: 1,
	height: 6,
	indeterminate: false,
	progress: 0,
	width: 150,
};
module.exports = (withTheme(ProgressBarLinear): Object);

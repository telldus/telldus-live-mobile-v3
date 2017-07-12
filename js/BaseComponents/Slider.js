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

import React, { PropTypes, PureComponent } from 'react';
import { Animated, Dimensions, Easing, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import Theme from 'Theme';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rect.prototype.containsPoint = function(x, y) {
	return (
		x >= this.x &&
		y >= this.y &&
		x <= this.x + this.width &&
		y <= this.y + this.height
	);
};

const DEFAULT_ANIMATION_CONFIGS = {
	spring: {
		friction: 7,
		tension: 100,
	},
	timing: {
		duration: 150,
		easing: Easing.inOut(Easing.ease),
		delay: 0,
	},
};

type Props = {
	value: number,
	disabled: boolean,
	minimumValue: number,
	maximumValue: number,
	step: number,
	minimumTrackTintColor: string,
	maximumTrackTintColor: string,
	thumbTintColor: string,
	thumbTouchSize: Object,
	onValueChange: Function,
	onSlidingStart: Function,
	onSlidingComplete: Function,
	style: Object,
	trackStyle: Object,
	thumbStyle: Object,
	valueStyle: Object,
	legendStyle: Object,
	thumbImage: number,
	debugTouchArea: boolean,
	animateTransitions: boolean,
	animationType: 'spring' | 'timing',
	animationConfig: Object,
	showValue: boolean,
	legend: boolean,
};

type Size = {
	width: number,
	height: number,
};

type State = {
	containerSize: Size,
	trackSize: Size,
	thumbSize: Size,
	allMeasured: boolean,
	value: Object,
};

export default class Slider extends PureComponent {

	props: Props;
	state: State;

	static propTypes = {
		/**
		 * Initial value of the slider. The value should be between minimumValue
		 * and maximumValue, which default to 0 and 1 respectively.
		 * Default value is 0.
		 *
		 * *This is not a controlled component*, e.g. if you don't update
		 * the value, the component won't be reset to its inital value.
		 */
		value: PropTypes.number,

		/**
		 * If true the user won't be able to move the slider.
		 * Default value is false.
		 */
		disabled: PropTypes.bool,

		/**
		 * Initial minimum value of the slider. Default value is 0.
		 */
		minimumValue: PropTypes.number,

		/**
		 * Initial maximum value of the slider. Default value is 1.
		 */
		maximumValue: PropTypes.number,

		/**
		 * Step value of the slider. The value should be between 0 and
		 * (maximumValue - minimumValue). Default value is 0.
		 */
		step: PropTypes.number,

		/**
		 * The color used for the track to the left of the button. Overrides the
		 * default blue gradient image.
		 */
		minimumTrackTintColor: PropTypes.string,

		/**
		 * The color used for the track to the right of the button. Overrides the
		 * default blue gradient image.
		 */
		maximumTrackTintColor: PropTypes.string,

		/**
		 * The color used for the thumb.
		 */
		thumbTintColor: PropTypes.string,

		/**
		 * The size of the touch area that allows moving the thumb.
		 * The touch area has the same center has the visible thumb.
		 * This allows to have a visually small thumb while still allowing the user
		 * to move it easily.
		 * The default is {width: 40, height: 40}.
		 */
		thumbTouchSize: PropTypes.shape({
			width: PropTypes.number,
			height: PropTypes.number,
		}),

		/**
		 * Callback continuously called while the user is dragging the slider.
		 */
		onValueChange: PropTypes.func,

		/**
		 * Callback called when the user starts changing the value (e.g. when
		 * the slider is pressed).
		 */
		onSlidingStart: PropTypes.func,

		/**
		 * Callback called when the user finishes changing the value (e.g. when
		 * the slider is released).
		 */
		onSlidingComplete: PropTypes.func,

		/**
		 * The style applied to the slider container.
		 */
		style: View.propTypes.style,

		/**
		 * The style applied to the track.
		 */
		trackStyle: View.propTypes.style,

		/**
		 * The style applied to the thumb.
		 */
		thumbStyle: View.propTypes.style,

		/**
		 * The style applied to the displayed value
		 */
		valueStyle: Text.propTypes.style,

		/**
		 * The style applied to the values under the track
		 */
		legendStyle: View.propTypes.style,

		/**
		 * Sets an image for the thumb.
		 */
		thumbImage: Image.propTypes.source,

		/**
		 * Set this to true to visually see the thumb touch rect in green.
		 */
		debugTouchArea: PropTypes.bool,

		/**
		 * Set to true to animate values with default 'timing' animation type
		 */
		animateTransitions: PropTypes.bool,

		/**
		 * Custom Animation type. 'spring' or 'timing'.
		 */
		animationType: PropTypes.oneOf(['spring', 'timing']),

		/**
		 * Used to configure the animation parameters.
		 * These are the same parameters in the Animated library.
		 */
		animationConfig: PropTypes.object,

		/**
		 * Set to true to show current value above the thumb
		 */
		showValue: PropTypes.bool,

		/**
		 * Set to true to show slider values under the track
		 */
		legend: PropTypes.bool,

		/**
		 * Defines either exact values or number of equal slices to display under the track
		 */
		displayValues: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.number),
			PropTypes.number,
		]),
	};

	static defaultProps = {
		value: 0,
		minimumValue: 0,
		maximumValue: 1,
		step: 0,
		minimumTrackTintColor: Theme.Core.brandSecondary,
		maximumTrackTintColor: '#bdbdbd',
		thumbTintColor: '#343434',
		thumbTouchSize: {
			width: 40,
			height: 40,
		},
		valueStyle: {},
		legendStyle: {},
		debugTouchArea: false,
		animationType: 'timing',
		showValue: false,
		legend: false,
	};

	state = {
		containerSize: {
			width: 0,
			height: 0,
		},
		trackSize: {
			width: 0,
			height: 0,
		},
		thumbSize: {
			width: 0,
			height: 0,
		},
		allMeasured: false,
		value: new Animated.Value(this.props.value),
	};

	componentWillMount() {
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
			onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
			onPanResponderGrant: this._handlePanResponderGrant,
			onPanResponderMove: this._handlePanResponderMove,
			onPanResponderRelease: this._handlePanResponderEnd,
			onPanResponderTerminationRequest: this._handlePanResponderRequestEnd,
			onPanResponderTerminate: this._handlePanResponderEnd,
		});
	};

	componentWillReceiveProps(nextProps) {
		const newValue = nextProps.value;

		if (this.props.value !== newValue) {
			if (this.props.animateTransitions) {
				this._setCurrentValueAnimated(newValue);
			} else {
				this._setCurrentValue(newValue);
			}
		}
	};

	render() {
		const {
			minimumValue,
			maximumValue,
			minimumTrackTintColor,
			maximumTrackTintColor,
			thumbTintColor,
			thumbImage,
			styles,
			style,
			trackStyle,
			thumbStyle,
			valueStyle: propValueStyle,
			debugTouchArea,
			showValue,
			legend,
			displayValues,
			...other
		} = this.props;

		const {
			value,
			containerSize,
			trackSize,
			thumbSize,
			allMeasured
		} = this.state;


		const thumbLeft = value.interpolate({
			inputRange: [minimumValue, maximumValue],
			outputRange: [0, containerSize.width - thumbSize.width],
		});

		const valueVisibleStyle = {
			opacity: allMeasured ? 1 : 0,
		};
		this.defaultStyles = this._getDefaultStyles();
		const mainStyles = styles || this.defaultStyles;
		const minimumTrackStyle = {
			position: 'absolute',
			width: Animated.add(thumbLeft, thumbSize.width / 2),
			backgroundColor: minimumTrackTintColor,
			...valueVisibleStyle
		};
		const touchOverflowStyle = this._getTouchOverflowStyle();
		const valueStyle = this._getValueStyle();

		return (
			<View {...other} style={[mainStyles.container, style]} onLayout={this._measureContainer}>
				<View style={mainStyles.trackWrapper}>
					<View
						style={[
							mainStyles.track,
							{ backgroundColor: maximumTrackTintColor },
							trackStyle
						]}
						renderToHardwareTextureAndroid={true}
						onLayout={this._measureTrack}
					/>
					<Animated.View
						renderToHardwareTextureAndroid={true}
						style={[mainStyles.track, minimumTrackStyle, trackStyle]}
					/>
					<Animated.View
						onLayout={this._measureThumb}
						renderToHardwareTextureAndroid={true}
						style={[
							{ backgroundColor: thumbTintColor },
							mainStyles.thumb,
							thumbStyle,
							{
								transform: [
									{ translateX: thumbLeft },
									{ translateY: 0 },
								],
								...valueVisibleStyle,
							},
						]}
					>
						{this._renderThumbImage()}
					</Animated.View>
					<View
						renderToHardwareTextureAndroid={true}
						style={[this.defaultStyles.touchArea, touchOverflowStyle]}
						{...this._panResponder.panHandlers}>
						{debugTouchArea === true && this._renderDebugThumbTouchRect(thumbLeft)}
					</View>
				</View>
				{showValue && (
					<Text style={[mainStyles.showValue, valueStyle, propValueStyle]}>
						{value._value}
					</Text>
				)}
				{this._renderLegend(displayValues)}
			</View>
		);
	};

	_renderLegend = (displayValues?: Array | number = null): Object => {
		const {legend, minimumValue, maximumValue} = this.props;
		if (!legend) {
			return;
		}

		const values = [minimumValue, maximumValue];

		if (displayValues) {
			if (Array.isArray(displayValues)) {
				values.push(...displayValues);
			}
			if (typeof displayValues === 'number' && displayValues > 0) {
				const diff = maximumValue - minimumValue;
				const slice = diff / (displayValues + 1);
				for (let i = 1; i <= displayValues; i++) {
					values.push(minimumValue + slice * i);
				}
			}
		}

		values.sort((a, b) => {
			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		});

		return (
			<View
				style={{
					bottom: 0,
					position: 'absolute',
					justifyContent: 'flex-end',
					zIndex: 5,
				}}
			>
				{values.map(value => this._renderLegendValue(value))}
			</View>
		);
	};

	_getTextWidth = (fontSize: number): number => {
		const { minimumValue, maximumValue } = this.props;

		const minimumValueSymbols = minimumValue.toString().length;
		const maximumValueSymbols = maximumValue.toString().length;
		const maximumSymbols = Math.max(minimumValueSymbols, maximumValueSymbols);

		return maximumSymbols * fontSize;
	};

	_renderLegendValue = (value: number): Object => {
		const { minimumValue, maximumValue } = this.props;
		const renderVerticalDash = value > minimumValue && value < maximumValue;

		const { container, dash, text } = this._getLegendItemStyle(value);

		return (
			<View style={container} key={value}>
				{renderVerticalDash && (
					<View style={dash}/>
				)}
				<Text style={text}>
					{Math.round(value)}
				</Text>
			</View>
		);
	};

	_getLegendItemStyle = (value: number): Object => {
		const { trackSize } = this.state;

		const fontSize = this._getSize(0.024);
		const width = this._getTextWidth(fontSize);
		const dashHeight = trackSize.height + 6;

		return {
			container: {
				alignItems: 'center',
				justifyContent: 'center',
				position: 'absolute',
				left: trackSize.width * this._getRatio(value),
				transform: [
					{
						translateX: width / -2,
					},
				],
				width,
				zIndex: 1,
			},
			dash: {
				width: 1,
				backgroundColor: '#888',
				height: dashHeight,
				transform: [
					{ translateY: -3 }
				],
			},
			text: {
				fontSize,
				textAlign: 'center',
				marginTop: this._getSize(0.010666667),
				backgroundColor: 'transparent',
			},
		};
	};

	_getDeviceWidth = (): number => {
		return Dimensions.get('window').width;
	};

	_getSize = (ratio: number): number => {
		const deviceWidth = this._getDeviceWidth();
		return deviceWidth * ratio;
	};

	_getValueStyle = () => {
		const { value, thumbSize } = this.state;
		const { valueStyle } = this.props;

		const valueLeft = this._getLeftPosition(value._value);

		const fontSize = valueStyle.fontSize || this._getSize(0.037333333);
		const valueDisplayedWidth = this._getTextWidth(fontSize);
		const translateX = (thumbSize.width / 2) + valueLeft - (valueDisplayedWidth / 2);

		return {
			transform: [
				{ translateX },
			],
			fontSize,
			width: valueDisplayedWidth,
		};
	};

	_getPropsForComponentUpdate(props) {
		const {
			value,
			onValueChange,
			onSlidingStart,
			onSlidingComplete,
			style,
			trackStyle,
			thumbStyle,
			...otherProps,
		} = props;

		return otherProps;
	};

	_handleStartShouldSetPanResponder = (e: Object): boolean => {
		return this._thumbHitTest(e);
	};

	_handleMoveShouldSetPanResponder( /*e: Object, gestureState: Object*/ ): boolean {
		// Should we become active when the user moves a touch over the thumb?
		return false;
	};

	_handlePanResponderGrant = () => {
		this._previousLeft = this._getLeftPosition(this._getCurrentValue());
		this._fireChangeEvent('onSlidingStart');
	};

	_handlePanResponderMove = (e: Object, gestureState: Object) => {
		if (this.props.disabled) {
			return;
		}

		this._setCurrentValue(this._getValue(gestureState));
		this._fireChangeEvent('onValueChange');
	};

	_handlePanResponderRequestEnd(e: Object, gestureState: Object) {
		// Should we allow another component to take over this pan?
		return false;
	};

	_handlePanResponderEnd = (e: Object, gestureState: Object) => {
		if (this.props.disabled) {
			return;
		}

		this._setCurrentValue(this._getValue(gestureState));
		this._fireChangeEvent('onSlidingComplete');
	};

	_measureContainer = (x: Object) => {
		this._handleMeasure('containerSize', x);
	};

	_measureTrack = (x: Object) => {
		this._handleMeasure('trackSize', x);
	};

	_measureThumb = (x: Object) => {
		this._handleMeasure('thumbSize', x);
	};

	_handleMeasure = (name: string, x: Object) => {
		const { width, height } = x.nativeEvent.layout;

		const size = {
			width,
			height,
		};

		const storeName = `_${name}`;

		const currentSize = this[storeName];

		if (currentSize && width === currentSize.width && height === currentSize.height) {
			return;
		}

		this[storeName] = size;

		if (this._containerSize && this._trackSize && this._thumbSize) {
			this.setState({
				containerSize: this._containerSize,
				trackSize: this._trackSize,
				thumbSize: this._thumbSize,
				allMeasured: true,
			});
		}
	};

	_getRatio = (value: number): number => {
		const { minimumValue, maximumValue } = this.props;
		return (value - minimumValue) / (maximumValue - minimumValue);
	};

	_getLeftPosition = (value: number): number => {
		const { containerSize, thumbSize } = this.state;
		const ratio = this._getRatio(value);
		return ratio * (containerSize.width - thumbSize.width);
	};

	_getValue = (gestureState: Object): number => {
		const { step, minimumValue, maximumValue } = this.props;
		const length = this.state.containerSize.width - this.state.thumbSize.width;
		const thumbLeft = this._previousLeft + gestureState.dx;

		const ratio = thumbLeft / length;

		if (step) {
			return Math.max(
				minimumValue,
				Math.min(
					maximumValue,
					minimumValue + Math.round(ratio * (maximumValue - minimumValue) / step) * step
				)
			);
		} else {
			return Math.max(
				minimumValue,
				Math.min(
					maximumValue,
					ratio * (maximumValue - minimumValue) + minimumValue
				)
			);
		}
	};

	_getCurrentValue = (): number => {
		return this.state.value.__getValue();
	};

	_setCurrentValue = (value: number): void => {
		this.state.value.setValue(value);
	};

	_setCurrentValueAnimated = (value: number): void => {
		const animationType = this.props.animationType;

		const animationConfig = Object.assign(
			{},
			DEFAULT_ANIMATION_CONFIGS[animationType],
			this.props.animationConfig,
			{ toValue: value },
		);

		Animated[animationType](this.state.value, animationConfig).start();
	};

	_fireChangeEvent = (event): void => {
		if (this.props[event]) {
			this.props[event](this._getCurrentValue());
		}
	};

	_getTouchOverflowSize = (): Object => {
		const { allMeasured, thumbSize, containerSize } = this.state;
		const { thumbTouchSize } = this.props;

		const size = {};

		if (allMeasured === true) {
			size.width = Math.max(0, thumbTouchSize.width - thumbSize.width);
			size.height = Math.max(0, thumbTouchSize.height - containerSize.height);
		}

		return size;
	};

	_getTouchOverflowStyle = (): Object => {
		const {
			width,
			height
		} = this._getTouchOverflowSize();

		const touchOverflowStyle = {};

		if (width !== undefined && height !== undefined) {
			const verticalMargin = height / -2;
			touchOverflowStyle.marginTop = verticalMargin;
			touchOverflowStyle.marginBottom = verticalMargin;

			const horizontalMargin = width / -2;
			touchOverflowStyle.marginLeft = horizontalMargin;
			touchOverflowStyle.marginRight = horizontalMargin;
		}

		if (this.props.debugTouchArea === true) {
			touchOverflowStyle.backgroundColor = 'orange';
			touchOverflowStyle.opacity = 0.5;
		}

		return touchOverflowStyle;
	};

	_thumbHitTest = (e: Object) => {
		const nativeEvent = e.nativeEvent;
		const thumbTouchRect = this._getThumbTouchRect();
		return thumbTouchRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY);
	};

	_getThumbTouchRect = () => {
		const { thumbSize, containerSize } = this.state;
		const { thumbTouchSize } = this.props;
		const touchOverflowSize = this._getTouchOverflowSize();
		const thumbLeft = this._getLeftPosition(this._getCurrentValue());

		const x = touchOverflowSize.width / 2 + thumbLeft + (thumbSize.width - thumbTouchSize.width) / 2;
		const y = touchOverflowSize.height / 2 + (containerSize.height - thumbTouchSize.height) / 2;

		return new Rect(x, y, thumbTouchSize.width, thumbTouchSize.height);
	};

	_renderDebugThumbTouchRect = (thumbLeft) => {
		const thumbTouchRect = this._getThumbTouchRect();

		const positionStyle = {
			left: thumbLeft,
			top: thumbTouchRect.y,
			width: thumbTouchRect.width,
			height: thumbTouchRect.height,
		};

		return (
			<Animated.View
				style={[this.defaultStyles.debugThumbTouchArea, positionStyle]}
				pointerEvents='none'
			/>
		);
	};

	_renderThumbImage = () => {
		const { thumbImage } = this.props;

		if (!thumbImage) {
			return;
		}

		return <Image source={thumbImage}/>;
	};

	_getDefaultStyles = () => {
		const { showValue, legend, valueStyle, legendStyle } = this.props;
		const { thumbSize } = this.state;

		const halfThumbHeight = thumbSize.height / 2;

		let height = thumbSize.height;
		const legendFontSize = legendStyle.fontSize || this._getSize(0.024);

		if (showValue) {
			height += halfThumbHeight + (valueStyle.fontSize || this._getSize(0.037333333)) / 2;
		}
		if (legend) {
			height += legendFontSize;
		}

		const marginBottom = legend ? 3 : 0;

		return StyleSheet.create({
			container: {
				height,
				justifyContent: 'center',
			},
			trackWrapper: {
				justifyContent: 'center',
				height: thumbSize.height,
				marginBottom,
			},
			track: {
				height: TRACK_SIZE,
				borderRadius: TRACK_SIZE / 2,
			},
			thumb: {
				position: 'absolute',
				width: THUMB_SIZE,
				height: THUMB_SIZE,
				borderRadius: THUMB_SIZE / 2,
				zIndex: 10,
			},
			showValue: {
				position: 'absolute',
				textAlign: 'center',
				top: 0,
				left: 0,
				backgroundColor: 'transparent',
			},
			touchArea: {
				position: 'absolute',
				backgroundColor: 'transparent',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			},
			debugThumbTouchArea: {
				position: 'absolute',
				backgroundColor: 'green',
				opacity: 0.5,
			}
		});
	};
}

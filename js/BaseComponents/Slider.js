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

import React, { PropTypes } from 'react';
import { Dimensions } from 'react-native';
import Slider from 'react-native-slider';
import View from './View';
import Text from './Text';
import Theme from 'Theme';

type Props = {
	minimumValue: number,
	minimumTrackTintColor: string,
	maximumValue: number,
	maximumTrackTintColor: string,
	value: number,
	trackStyle: Object,
	thumbStyle: Object,
	caption: boolean,
};

type State = {
	trackWidth: number,
	value: number,
};

export default class SliderComponent extends View {

	props: Props;
	state: State;

	static propTypes = {
		minimumValue: PropTypes.number.isRequired,
		maximumValue: PropTypes.number.isRequired,
		onValueChange: PropTypes.func.isRequired,
		minimumTrackTintColor: PropTypes.string,
		maximumTrackTintColor: PropTypes.string,
		value: PropTypes.number,
		trackStyle: PropTypes.object,
		thumbStyle: PropTypes.object,
		caption: PropTypes.bool,
	};

	static defaultProps = {
		minimumTrackTintColor: Theme.Core.brandSecondary,
		maximumTrackTintColor: '#bdbdbd',
		trackStyle: {},
		thumbStyle: {
			height: 20,
			width: 20,
		},
		caption: false,
	};

	constructor(props) {
		super(props);

		const { minimumValue, maximumValue } = props;
		const minimumValueSymbols = minimumValue.toString().length;
		const maximumValueSymbols = maximumValue.toString().length;
		this.maxValueSymbols = Math.max(minimumValueSymbols, maximumValueSymbols);

		this.state = {
			trackWidth: props.trackStyle.width,
			value: typeof props.value === 'number' ? props.value : props.minimumValue,
		};
	}

	getStyles = () => {
		const { trackWidth } = this.state;
		this.deviceWidth = Dimensions.get('window').width;

		return {
			container: {
				flex: trackWidth ? 0 : 1,
				opacity: trackWidth ? 1 : 0,
				width: trackWidth ? trackWidth : null,
			},
		};
	};

	getCaptionStyles = () => {
		const { trackStyle, thumbStyle, maximumValue, minimumValue } = this.props;
		const { value, trackWidth: stateTrackWidth } = this.state;

		const trackWidth = trackStyle.width || stateTrackWidth;

		const containerWidth = trackWidth - thumbStyle.width;
		const valuePosition = (value - minimumValue) / (Math.abs(maximumValue) + Math.abs(minimumValue));
		const valueLeft = containerWidth * valuePosition;

		const fontSize = this.deviceWidth * 0.037333333;
		const valueDisplayedWidth = this.maxValueSymbols * fontSize;
		const translateX = (thumbStyle.width / 2) + valueLeft - (valueDisplayedWidth / 2);
		const translateY = thumbStyle.height / -1.5;

		return {
			caption: {
				position: 'absolute',
				transform: [
					{
						translateX,
					},
					{
						translateY,
					},
				],
				fontSize,
				width: valueDisplayedWidth,
				textAlign: 'center',
			},
		};
	};

	setTrackWidth = e => {
		const { trackStyle } = this.props;
		if (!trackStyle.width) {
			const trackWidth = e.nativeEvent.layout.width;
			if (trackWidth !== this.state.trackWidth) {
				this.setState({ trackWidth });
			}
		}
	};

	onValueChange = value => {
		this.setState({ value });
		this.props.onValueChange(value);
	};

	render() {
		const { caption, ...sliderProps } = this.props;
		const { value } = this.state;

		const style = this.getStyles();

		if (caption) {
			Object.assign(style, this.getCaptionStyles());
		}

		// TODO: fix null-width slider
		return (
			<View style={style.container} onLayout={this.setTrackWidth}>
				{caption && (
					<Text style={style.caption}>{value}</Text>
				)}
				<Slider
					{...sliderProps}
					step={1}
					onValueChange={this.onValueChange}
				/>
			</View>
		);
	}
}

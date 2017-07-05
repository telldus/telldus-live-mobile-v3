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

const THUMB_SIZE = 20;

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
		caption: false,
	};

	constructor(props) {
		super(props);

		this.state = {
			trackWidth: 0,
			value: props.value || props.minimumValue,
		};
	}

	getStyles = () => {
		this.deviceWidth = Dimensions.get('window').width;

		return {
			container: {
				flex: 1,
				alignItems: 'center',
				opacity: this.state.trackWidth ? 1 : 0,
			}
		};
	};

	getCaptionStyles = () => {
		const { trackStyle, thumbStyle, maximumValue } = this.props;
		const { value, trackWidth: stateTrackWidth } = this.state;

		const trackWidth = (trackStyle && trackStyle.width) ? trackStyle.width : stateTrackWidth;
		const thumbWidth = (thumbStyle && thumbStyle.width) ? thumbStyle.width : THUMB_SIZE;

		const captionContainerWidth = trackWidth - thumbWidth;
		const captionLeft = captionContainerWidth * (value / maximumValue);

		const captionWidth = this.deviceWidth * 0.09;
		const translateX = (thumbWidth / 2) + captionLeft - (captionWidth / 2);
		const translateY = ((thumbStyle && thumbStyle.height) ? thumbStyle.height : THUMB_SIZE) / -1.5;

		return {
			captionWrapper: {
				width: trackWidth,
			},
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
				fontSize: this.deviceWidth * 0.037333333,
				width: captionWidth,
				textAlign: 'center',
			},
		};
	};

	setTrackWidth = e => {
		const { trackStyle } = this.props;
		if (!trackStyle || !trackStyle.width) {
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

		caption && Object.assign(style, this.getCaptionStyles());

		// TODO: fix null-width slider
		return (
			<View style={style.container} onLayout={this.setTrackWidth}>
				{caption && (
					<View style={style.captionWrapper}>
						<Text style={style.caption}>{value}</Text>
					</View>
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

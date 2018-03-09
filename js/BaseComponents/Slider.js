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
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import View from './View';
import Text from './Text';
import Slider from 'react-native-slider';
import Theme from '../App/Theme';
import { getDeviceWidth } from '../App/Lib';

type DefaultProps = {
	minimumTrackTintColor: string,
	maximumTrackTintColor: string,
	trackStyle: {},
	thumbStyle: Object,
	step: number,
	showValue: boolean,
	valueStyle: {},
};

type Props = {
	value: number,
	minimumValue: number,
	maximumValue: number,
	minimumTrackTintColor: string,
	maximumTrackTintColor: string,
	onValueChange: Function,
	step: number,
	trackStyle: Object,
	thumbStyle: Object,
	showValue: boolean,
	valueStyle: Object,
};

type State = {
	containerSize: Object,
	value: number,
};

export default class SliderComponent extends Component<Props, State> {
	props: Props;
	state: State;

	static propTypes = {
		minimumValue: PropTypes.number.isRequired,
		maximumValue: PropTypes.number.isRequired,
		onValueChange: PropTypes.func.isRequired,
		value: PropTypes.number,
		minimumTrackTintColor: PropTypes.string,
		maximumTrackTintColor: PropTypes.string,
		step: PropTypes.number,
		trackStyle: PropTypes.object,
		thumbStyle: PropTypes.object,
		showValue: PropTypes.bool,
		valueStyle: PropTypes.object,
	};

	static defaultProps: DefaultProps = {
		minimumTrackTintColor: Theme.Core.brandSecondary,
		maximumTrackTintColor: Theme.Core.inactiveGray,
		trackStyle: {},
		thumbStyle: {
			height: 20,
			width: 20,
		},
		step: 1,
		showValue: false,
		valueStyle: {},
	};

	state = {
		containerSize: {
			width: this.props.trackStyle.width,
			height: this.props.trackStyle.height,
		},
		value: typeof this.props.value === 'number' ? this.props.value : this.props.minimumValue,
	};

	onValueChange = (value: number) => {
		this.setState({ value });
		this.props.onValueChange(value);
	};

	render(): React$Element<any> {
		const { showValue, ...sliderProps } = this.props;

		const { container } = this._getMainStyles();

		return (
			<View style={container} onLayout={this._setTrackWidth}>
				{this._renderValue(showValue, this.state.value)}
				<Slider
					{...sliderProps}
					onValueChange={this.onValueChange}
				/>
			</View>
		);
	}

	_renderValue = (showValue: boolean, value: number): Object | null => {
		if (!showValue) {
			return null;
		}

		const defaultValueStyle = this._getValueStyle();

		return (
			<Text style={[defaultValueStyle, this.props.valueStyle]}>
				{value}
			</Text>
		);
	};

	_getValueStyle = (): Object => {
		const { value } = this.state;
		const { thumbStyle } = this.props;

		const fontSize = this._getValueFontSize();
		const width = this._getTextWidth(fontSize);
		const translateX = (thumbStyle.width / 2) + this._getLeftPosition(value) - (width / 4);

		return {
			backgroundColor: 'transparent',
			color: '#555555',
			fontFamily: Theme.Core.fonts.robotoMedium,
			position: 'absolute',
			left: 0,
			top: 0,
			textAlign: 'center',
			transform: [
				{ translateX },
			],
			fontSize,
			width,
		};
	};

	_getValueFontSize = (): number => {
		return this.props.valueStyle.fontSize || this._getRelativeSize(0.037333333);
	};

	_getTextWidth = (fontSize: number): number => {
		const { minimumValue, maximumValue } = this.props;

		const maxSymbols = Math.max(
			minimumValue.toString().length,
			maximumValue.toString().length,
		);

		return maxSymbols * fontSize;
	};

	_getRelativeSize = (ratio: number): number => {
		return getDeviceWidth() * ratio;
	};

	_getRatio = (value: number): number => {
		const { minimumValue, maximumValue } = this.props;
		return (value - minimumValue) / (maximumValue - minimumValue);
	};

	_getLeftPosition = (value: number): number => {
		const ratio = this._getRatio(value);
		return ratio * (this.state.containerSize.width - this.props.thumbStyle.width);
	};

	_setTrackWidth = (e: Object) => {
		if (!this.props.trackStyle.width) {
			const { containerSize: stateContainerSize } = this.state;
			const { width, height } = e.nativeEvent.layout;

			if (width !== stateContainerSize.width || height !== stateContainerSize.height) {
				const containerSize = {
					width,
					height,
				};
				this.setState({ containerSize });
			}
		}
	};

	_getMainStyles = (): Object => {
		const { showValue, thumbStyle } = this.props;
		const valueFontSize = this._getValueFontSize();

		let height = thumbStyle.height;
		let width = this.state.containerSize.width;

		if (showValue) {
			height += thumbStyle.height / 2 + valueFontSize;
			width += this._getTextWidth(valueFontSize) / 2;
		}

		return StyleSheet.create({
			container: {
				height,
				alignItems: 'center',
				justifyContent: 'flex-end',
				flex: width ? 0 : 1,
				opacity: width ? 1 : 0,
				width: width ? width : null,
			},
		});
	};
}

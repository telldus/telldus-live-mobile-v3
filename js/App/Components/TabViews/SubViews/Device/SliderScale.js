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
import { Animated, StyleSheet } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import { Text, View } from '../../../../../BaseComponents';

import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

type Props = {
	setScrollEnabled: boolean => void,
	thumbHeight: number,
	thumbWidth: number,
	sensitive: number,
	value: Object,
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
	screenReaderEnabled: boolean,
	containerWidth: number,
	containerHeight: number,
	displayedValue: string,
};

type State = {
	scaleWidth: number,
	scaleHeight: number,
	minimumValue: number,
	maximumValue: number,
	step: number,
	DimmerStep: boolean,
};

class SliderScale extends View {
	props: Props;
	state: State;

	activeSlider: boolean;
	layoutScale: Object => void;

	labelPhraseOne: string;
	labelPhraseTwo: string;

	constructor(props: Props) {
		super(props);
		this.parentScrollEnabled = true;
		this.state = {
			containerWidth: 0,
			containerHeight: 0,
			scaleWidth: 0,
			scaleHeight: 0,
			minimumValue: 0,
			maximumValue: 100,
			step: 1,
			DimmerStep: false,
		};
		this.activeSlider = false;

		this.layoutScale = this.layoutScale.bind(this);

		let { formatMessage } = this.props.intl;
		this.labelPhraseOne = formatMessage(i18n.dimLevel);
		this.labelPhraseTwo = formatMessage(i18n.messageControlDimStep);
	}

	layoutScale(event: Object) {
		let { width, height } = event.nativeEvent.layout;
		this.setState({
			scaleWidth: width,
			scaleHeight: height,
		});
	}

	render(): Object {
		const { minimumValue, maximumValue, scaleWidth } = this.state;
		const { thumbWidth, thumbHeight, isGatewayActive, containerHeight, containerWidth, displayedValue, style, value } = this.props;
		const thumbLeft = value.interpolate({
			inputRange: [minimumValue, maximumValue],
			outputRange: [0, scaleWidth - thumbWidth],
		});

		let thumbStyle = !isGatewayActive ? styles.offline : styles.enabled;
		let scaleStyle = !isGatewayActive ? styles.offline : styles.enabled;
		let valueColor = !isGatewayActive ? '#a2a2a2' : Theme.Core.brandSecondary;
		let bottomValue = (containerHeight / 2) - (thumbHeight * 2);

		return (
			<View style={[{flex: 1, justifyContent: 'center'}, style]}>
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
						bottom: bottomValue,
						color: valueColor,
					}]}>
					{displayedValue}%
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
		textAlign: 'center',
		textAlignVertical: 'center',
		alignSelf: 'center',
	},
});

SliderScale.defaultProps = {
	thumbHeight: 12,
	thumbWidth: 12,
	fontSize: 10,
	sensitive: 1,
};

module.exports = injectIntl(SliderScale);

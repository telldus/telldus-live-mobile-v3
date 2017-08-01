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
import { Animated, Image, TouchableOpacity, View } from 'react-native';
import { Poster } from 'BaseComponents';
import getDeviceWidth from '../../../Lib/getDeviceWidth';
import Theme from 'Theme';

type Props = {
	days: string[],
	todayIndex: number,
};

type State = {
	todayIndex: number,
};

export default class JobsPoster extends View<null, Props, State> {

	static propTypes = {
		days: PropTypes.arrayOf(PropTypes.string).isRequired,
		todayIndex: PropTypes.number.isRequired,
	};

	constructor(props: Props) {
		super(props);

		this.scrollDays = new Animated.Value(0);
		this.leftButton = new Animated.Value(1);
		this.rightButton = new Animated.Value(1);

		this.state = {
			todayIndex: this.props.todayIndex,
		};
	}

	componentWillReceiveProps(nextProps: Props) {
		const { todayIndex } = nextProps;

		if (todayIndex !== this.props.todayIndex) {
			Animated
				.timing(this.scrollDays, { toValue: 1 })
				.start(({ finished }: { finished: boolean }) => {
					if (finished) {
						this.setState({ todayIndex }, () => {
							this.scrollDays.setValue(0);
						});
					}
				});
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const newProps = nextProps.todayIndex !== this.props.todayIndex;
		const newState = nextState.todayIndex !== this.state.todayIndex;
		return newProps || newState;
	}

	render() {
		const { todayIndex } = this.state;
		const { daysContainer, arrowContainer, arrowContainerRight, arrow } = this._getStyle();
		const image = require('../../../../BaseComponents/img/keyboard-left-arrow-button.png');

		return (
			<Poster>
				<View style={daysContainer}>
					{this.props.days.map((day: string, i: number): React$Element<Animated.Text> => {
						const animation = this._getAnimation(i);

						let simulateClick = {};

						if (i === todayIndex - 1) {
							simulateClick = { opacity: this.leftButton };
						}
						if (i === todayIndex + 1) {
							simulateClick = { opacity: this.rightButton };
						}

						return (
							<Animated.View
								style={[animation.container, simulateClick]}
								key={`${day}${i}`}
							>
								<Animated.Text style={animation.text}>
									{day}
								</Animated.Text>
							</Animated.View>
						);
					})}
				</View>
				<TouchableOpacity
					onPress={this._scrollToYesterday}
					onPressIn={this._leftButtonPressIn}
					onPressOut={this._leftButtonPressOut}
					style={arrowContainer}
				>
					<Image source={image} style={arrow}/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={this._scrollToTomorrow}
					onPressIn={this._rightButtonPressIn}
					onPressOut={this._rightButtonPressOut}
					style={[arrowContainer, arrowContainerRight]}
				>
					<Image source={image} style={arrow}/>
				</TouchableOpacity>
			</Poster>
		);
	}

	_scrollToYesterday = () => {
		this.props.scroll(-1);
	};

	_scrollToTomorrow = () => {
		this.props.scroll(1);
	};

	_leftButtonPressIn = () => {
		Animated.timing(
			this.leftButton,
			{
				toValue: 0.2,
				duration: 10,
			},
		).start();
	};

	_leftButtonPressOut = () => {
		Animated.timing(
			this.leftButton,
			{
				toValue: 1,
				duration: 10,
			},
		).start();
	};

	_rightButtonPressIn = () => {
		Animated.timing(
			this.rightButton,
			{
				toValue: 0.2,
				duration: 10,
			},
		).start();
	};

	_rightButtonPressOut = () => {
		Animated.timing(
			this.rightButton,
			{
				toValue: 1,
				duration: 10,
			},
		).start();
	};

	_getAnimation = (index: number): Object => {
		const { todayIndex } = this.state;
		const animatedStyle = this._getAnimatedStyle();

		switch (index) {
			case todayIndex - 1:
				return animatedStyle.yesterday;

			case todayIndex:
				return animatedStyle.today;

			case todayIndex + 1:
				return animatedStyle.tomorrow;

			default:
				return animatedStyle.day;
		}
	};

	_interpolate = (...outputRange: any[]): Object => {
		return this.scrollDays.interpolate({
			inputRange: [0, 1],
			outputRange,
		});
	};

	_getAnimatedStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const dayHeight = deviceWidth * 0.1;
		const todayWidth = deviceWidth * 0.44;

		const yesterdayLeft = 0;
		const todayLeft = deviceWidth * 0.205333333;
		const tomorrowLeft = deviceWidth * 0.652;

		const todayTop = '22.933333333%';

		const todayFontSize = deviceWidth * 0.084;

		const dayTranslateY = dayHeight / -2;

		const day = {
			container: {
				position: 'absolute',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				width: deviceWidth * 0.196,
				height: dayHeight,
				top: '50%',
				left: '100%',
				transform: [
					{ translateY: dayTranslateY },
				],
			},
			text: {
				backgroundColor: 'transparent',
				color: '#fff',
				fontSize: deviceWidth * 0.037333333,
				fontFamily: Theme.Core.fonts.robotoLight,
			},
		};

		return {
			day,
			yesterday: {
				container: {
					...day.container,
					left: this._interpolate(yesterdayLeft, -100),
				},
				text: day.text,
			},
			today: {
				container: {
					...day.container,
					width: this._interpolate(todayWidth, day.container.width),
					left: this._interpolate(todayLeft, yesterdayLeft),
					top: this._interpolate(todayTop, day.container.top),
					transform: [
						{ translateY: this._interpolate(0, dayTranslateY) },
					],
				},
				text: {
					...day.text,
					fontSize: this._interpolate(todayFontSize, day.text.fontSize),
				},
			},
			tomorrow: {
				container: {
					...day.container,
					left: this._interpolate(tomorrowLeft, todayLeft),
					top: this._interpolate(day.container.top, todayTop),
					width: this._interpolate(day.container.width, todayWidth),
					transform: [
						{ translateY: this._interpolate(dayTranslateY, 0) },
					],
				},
				text: {
					...day.text,
					fontSize: this._interpolate(day.text.fontSize, todayFontSize),
				},
			},
		};
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			daysContainer: {
				position: 'absolute',
				left: deviceWidth * 0.076,
				top: 0,
				bottom: 0,
				right: deviceWidth * 0.076,
				overflow: 'hidden',
			},
			arrowContainer: {
				position: 'absolute',
				width: deviceWidth * 0.196,
				height: deviceWidth * 0.036,
				left: deviceWidth * 0.026666667,
				top: '50%',
				transform: [
					{ translateY: deviceWidth * 0.036 / -2 },
				],
			},
			arrowContainerRight: {
				left: null,
				right: deviceWidth * 0.026666667,
				transform: [
					{ translateY: deviceWidth * 0.036 / -2 },
					{ scaleX: -1 },
				],
			},
			arrow: {
				position: 'absolute',
				height: deviceWidth * 0.036,
				width: deviceWidth * 0.022666667,
				resizeMode: 'contain',
			},
		};
	};

}

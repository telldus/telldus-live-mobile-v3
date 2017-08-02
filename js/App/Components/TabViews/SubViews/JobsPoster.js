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

		this.scrollDays = new Animated.Value(1);
		this.leftButton = new Animated.Value(1);
		this.rightButton = new Animated.Value(1);

		this.state = {
			todayIndex: props.todayIndex,
		};
	}

	componentWillReceiveProps(nextProps: Props) {
		const { todayIndex } = this.state;
		const newTodayIndex = nextProps.todayIndex;

		if (newTodayIndex !== todayIndex) {
			this.scrollRight = newTodayIndex > todayIndex;
			Animated
				.timing(this.scrollDays, { toValue: this.scrollRight ? 0 : 2 })
				.start(({ finished }: { finished: boolean }) => {
					if (finished) {
						this.setState({ todayIndex: newTodayIndex }, () => {
							this.scrollDays.setValue(1);
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
		const animatedStyle = this._getAnimatedStyle(index);

		switch (index) {
			case todayIndex - 2:
				return animatedStyle.beforeYesterday;

			case todayIndex - 1:
				return animatedStyle.yesterday;

			case todayIndex:
				return animatedStyle.today;

			case todayIndex + 1:
				return animatedStyle.tomorrow;

			case todayIndex + 2:
				return animatedStyle.afterTomorrow;

			default:
				return animatedStyle.day;
		}
	};

	_interpolate = (...outputRange: any[]): Object => {
		return this.scrollDays.interpolate({
			inputRange: [0, 1, 2],
			outputRange,
		});
	};

	_getAnimatedStyle = (index: number): Object => {
		const deviceWidth = getDeviceWidth();

		const dayWidth = this._getDayWidth(this.props.days[index]);
		const dayHeight = deviceWidth * 0.1;
		const todayWidth = deviceWidth * 0.44;

		const todayLeft = deviceWidth * 0.205333333;

		const dayTop = deviceWidth * 0.117333333;
		const todayTop = deviceWidth * 0.058666667;

		const dayFontSize = Math.floor(deviceWidth * 0.037333333);
		const todayFontSize = Math.floor(deviceWidth * 0.084);

		const day = {
			container: {
				position: 'absolute',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				height: dayHeight,
				top: dayTop,
				left: '100%',
			},
			text: {
				backgroundColor: 'transparent',
				color: '#fff',
				fontSize: dayFontSize,
				fontFamily: Theme.Core.fonts.robotoLight,
			},
		};

		return {
			day,
			beforeYesterday: {
				container: {
					...day.container,
					left: this._interpolate(0 - 2 * dayWidth, 0 - dayWidth, 0),
				},
				text: day.text,
			},
			yesterday: {
				container: {
					...day.container,
					width: this._interpolate(dayWidth, dayWidth, todayWidth),
					left: this._interpolate(0 - dayWidth, 0, todayLeft),
					top: this._interpolate(dayTop, dayTop, todayTop),
				},
				text: {
					...day.text,
					fontSize: this._interpolate(dayFontSize, dayFontSize, todayFontSize),
				},
			},
			today: {
				container: {
					...day.container,
					width: this._interpolate(dayWidth, todayWidth, dayWidth),
					left: this.scrollRight ? this._interpolate(0, todayLeft, 100) : null,
					right: this.scrollRight ? null : this._interpolate(100, todayLeft, 0),
					top: this._interpolate(dayTop, todayTop, dayTop),
				},
				text: {
					...day.text,
					fontSize: this._interpolate(dayFontSize, todayFontSize, dayFontSize),
				},
			},
			tomorrow: {
				container: {
					...day.container,
					width: this._interpolate(todayWidth, dayWidth, dayWidth),
					left: null,
					right: this._interpolate(todayLeft, 0, 0 - dayWidth),
					top: this._interpolate(todayTop, dayTop, dayTop),
				},
				text: {
					...day.text,
					fontSize: this._interpolate(todayFontSize, dayFontSize, dayFontSize),
				},
			},
			afterTomorrow: {
				container: {
					...day.container,
					left: null,
					right: this._interpolate(0, 0 - dayWidth, 0 - 2 * dayWidth),
				},
				text: day.text,
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
				height: deviceWidth * 0.1,
				left: deviceWidth * 0.026666667,
				top: deviceWidth * 0.117333333,
				justifyContent: 'center',
			},
			arrowContainerRight: {
				left: null,
				right: deviceWidth * 0.026666667,
				transform: [
					{ scaleX: -1 },
				],
			},
			arrow: {
				height: deviceWidth * 0.036,
				width: deviceWidth * 0.022666667,
			},
		};
	};

	_getDayWidth = (day: string): number => {
		const deviceWidth = getDeviceWidth();

		switch (day) {
			case 'Monday':
				return deviceWidth * 0.132;

			case 'Tuesday':
				return deviceWidth * 0.137333333;

			case 'Wednesday':
				return deviceWidth * 0.189333333;

			case 'Thursday':
				return deviceWidth * 0.153333333;

			case 'Friday':
				return deviceWidth * 0.1;

			case 'Saturday':
				return deviceWidth * 0.145333333;

			default:
				return deviceWidth * 0.121333333;
		}
	};

}

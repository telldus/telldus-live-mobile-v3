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
import PropTypes from 'prop-types';
import { Animated, Image, PanResponder } from 'react-native';
import Platform from 'Platform';
import { defineMessages } from 'react-intl';
import Ripple from 'react-native-material-ripple';

import { Poster, View, CheckBoxIconText } from '../../../../BaseComponents';
import Weekdays from './Jobs/Weekdays';
import Theme from '../../../Theme';

const messages = defineMessages({
	checkBoxText: {
		id: 'jobsposter.checkBoxText',
		defaultMessage: 'Show inactive',
	},
});

type Props = {
	days: Object[],
	todayIndex: number,
	appLayout: Object,
	onToggleVisibility: (boolean) => void,
	intl: Object,
	currentScreen: string,
};

type State = {
	todayIndex?: number,
	showLeftButton?: boolean,
	showRightButton?: boolean,
	dragDir?: string,
	showInactive: boolean,
	daysLayout: Object,
};

export default class JobsPoster extends View<null, Props, State> {

	onLayout: (number, number, string) => void;
	_panResponder: Object;
	distMoved: number;
	onToggleVisibilty: (boolean) => void;

	static propTypes = {
		days: PropTypes.arrayOf(PropTypes.object).isRequired,
		todayIndex: PropTypes.number.isRequired,
	};

	constructor(props: Props) {
		super(props);

		this.scrollDays = new Animated.Value(1);

		this.state = {
			todayIndex: props.todayIndex,
			showLeftButton: false,
			showRightButton: true,
			daysLayout: {},
			dragDir: undefined,
			showInactive: true,
		};
		// weekdays animation ranges from value (1 -> 0) while dragging/sliding left(visiting yesterday)
		// weekdays animation ranges from value (1 -> 2) while dragging/sliding right(visiting tomorrow)
		// so the animating range is 1.
		this.animLeftVal = 0;
		this.animMidVal = 1;
		this.animRightVal = 2;
		this.animationRange = this.animRightVal - this.animMidVal;
		this.weekDaysLayout = {};
		this.onLayout = this.onLayout.bind(this);
		this.distMoved = 0;
		this.finalValue = null;

		this.onToggleVisibilty = this.onToggleVisibilty.bind(this);

		const { formatMessage } = props.intl;
		this.checkBoxText = formatMessage(messages.checkBoxText);

		this._panResponder = PanResponder.create({
			// Ask to be the responder:
			onStartShouldSetPanResponder: this.onStartShouldSetPanResponderHandler.bind(this),
			onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapturehHandler.bind(this),
			onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponderHandler.bind(this),
			onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapturerHandler.bind(this),
			onPanResponderGrant: this.onPanResponderGrantHandler.bind(this),
			onPanResponderMove: this.onPanResponderMoveHandler.bind(this),
			onPanResponderTerminationRequest: this.onPanResponderTerminationRequestHandler.bind(this),
			onPanResponderRelease: this.onPanResponderReleaseHandler.bind(this),
			onPanResponderTerminate: this.onPanResponderTerminateHandler.bind(this),
			onShouldBlockNativeResponder: this.onShouldBlockNativeResponderHandler.bind(this),
		});
	}

	onStartShouldSetPanResponderHandler(event: Object, gestureState: Object): boolean {
		return false;
	}

	onStartShouldSetPanResponderCapturehHandler(event: Object, gestureState: Object): boolean {
		return false;
	}

	onMoveShouldSetPanResponderHandler(event: Object, gestureState: Object): boolean {
		return true;
	}

	onMoveShouldSetPanResponderCapturerHandler(event: Object, gestureState: Object): boolean {
		return true;
	}

	onPanResponderGrantHandler(event: Object, gestureState: Object) {
		const { moveX } = gestureState;
		this.moveX = moveX;
		this.distMoved = 0;
	}

	onPanResponderMoveHandler(event: Object, gestureState: Object) {
		const { dx, moveX } = gestureState;
		if (dx !== 0) {
			const distX = moveX - this.moveX;
			this.moveX = moveX;
			this.distMoved = this.getRange(dx);
			if (distX < 0) {
				let toVal = this.animMidVal + this.distMoved;
				// Prevent animation range from going beyond it's left & right limits.
				toVal = toVal <= this.animLeftVal ? this.animLeftVal : toVal;
				toVal = toVal >= this.animRightVal ? this.animRightVal : toVal;
				if (toVal < this.animMidVal) {
					// Doing setState only to cause a re-render and make the 'this.scrollRight' value reflect at weekdays animation method.
					this.scrollRight = true;
					this.setState({
						dragDir: 'right',
					});
				}
				this.finalValue = toVal;
				let config = {
					toValue: toVal,
					duration: 10,
				};
				this.animate(config);
			}
			if (distX > 0) {
				let toVal = this.animMidVal + this.distMoved;
				// Prevent animation range from going beyond it's left & right limits.
				toVal = toVal >= this.animRightVal ? this.animRightVal : toVal;
				toVal = toVal <= this.animLeftVal ? this.animLeftVal : toVal;
				if (toVal >= this.animMidVal) {
					// Doing setState only to cause a re-render and make the 'this.scrollRight' value reflect at weekdays animation method.
					this.scrollRight = false;
					this.setState({
						dragDir: 'left',
					});
				}
				this.finalValue = toVal;
				let config = {
					toValue: toVal,
					duration: 10,
				};
				this.animate(config);
			}
		}
	}
	// Calculates percentage of distance moved with respect to poster width and convert it to animation range[1-0 or 1-2]
	getRange(dx: number): number {
		const { appLayout } = this.props;
		const { width } = appLayout;
		const percentMoved = dx * (100 / width);
		return (this.animationRange * (percentMoved / 100)) * 4.0;
	}

	animate(config: Object) {
		Animated
			.timing(this.scrollDays, config)
			.start();
	}

	onPanResponderTerminationRequestHandler(event: Object, gestureState: Object): boolean {
		return true;
	}

	onPanResponderReleaseHandler(event: Object, gestureState: Object) {
		let { todayIndex } = this.state;
		// On dragging left more than 40%, scroll to tomorrow.
		if (this.finalValue !== null && this.finalValue <= 0.4 && todayIndex <= 6) {
			this._scrollToTomorrow();

			// On dragging right more than 40%, scroll to yesterday.
		} else if (this.finalValue !== null && this.finalValue >= 1.4 && todayIndex !== 0) {
			this._scrollToYesterday();

			// Animate back to previous state.
		} else {
			let config = {
				toValue: 1,
				duration: 400,
			};
			Animated
				.timing(this.scrollDays, config)
				.start();
		}
		this.distMoved = 0;
		this.setState({
			dragDir: undefined,
		});
		this.finalValue = null;
	}

	onPanResponderTerminateHandler(event: Object, gestureState: Object) {
		this.distMoved = 0;
		this.setState({
			dragDir: undefined,
		});
		this.finalValue = null;
	}

	onShouldBlockNativeResponderHandler(event: Object, gestureState: Object): boolean {
		return false;
	}

	componentDidUpdate(prevProps: Props, prevState: Object) {
		const { todayIndex } = this.state;
		const { todayIndex: newTodayIndex } = this.props;
		if (newTodayIndex !== todayIndex) {
			this.scrollRight = newTodayIndex > todayIndex;
			const dragDir = newTodayIndex > todayIndex ? 'right' : 'left';

			const updateButtonsVisibility = {
				showLeftButton: newTodayIndex > 0,
				showRightButton: newTodayIndex < (this.props.days.length - 1),
			};

			this.setState({
				...updateButtonsVisibility,
				dragDir,
			});

			const config = {
				toValue: this.scrollRight ? 0 : 2,
				duration: 600,
			};

			Animated
				.timing(this.scrollDays, config)
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
		if (nextProps.currentScreen === 'Scheduler') {
			const { daysLayout } = this.state;
			if (Object.keys(daysLayout).length !== Object.keys(nextState.daysLayout).length) {
				return true;
			}
			const todayIndexChange = (nextState.todayIndex !== this.state.todayIndex) || (nextProps.todayIndex !== this.props.todayIndex);
			if (todayIndexChange) {
				return true;
			}
			const newLayout = nextProps.appLayout.width !== this.props.appLayout.width;
			if (newLayout) {
				return true;
			}
			const newDays = nextProps.days.length !== this.props.days.length;
			const onDragChange = nextState.dragDir !== this.state.dragDir;
			const showInactiveChange = nextState.showInactive !== this.state.showInactive;
			return newDays || onDragChange || showInactiveChange;
		}
		return false;
	}

	getPosterWidth(): number {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		return (Platform.OS === 'android' && !isPortrait) ? (width - ((width * 0.11) + (height * 0.13))) : width;
	}

	onToggleVisibilty() {
		const { showInactive } = this.state;
		const { onToggleVisibility } = this.props;
		this.setState({
			showInactive: !showInactive,
		}, () => {
			onToggleVisibility(this.state.showInactive);
		});
	}

	render(): React$Element<any> {
		const { showLeftButton, showRightButton, showInactive } = this.state;
		const {
			container,
			daysContainer,
			dateContainer,
			arrowContainer,
			arrowContainerRight,
			arrow,
		} = this._getStyle();
		const image = require('../../../../BaseComponents/img/keyboard-left-arrow-button.png');
		const posterWidth = this.getPosterWidth();
		const { rippleColor, rippleOpacity } = Theme.Core;

		return (
			<Poster posterWidth={posterWidth}>
				<View style={container} pointerEvents={'box-none'}>
					<View style={container} {...this._panResponder.panHandlers} pointerEvents={'box-only'}>
						<View style={daysContainer}>
							{this._renderDays()}
							<View style={dateContainer}>
								{this._renderDate()}
							</View>
						</View>
					</View>
					<CheckBoxIconText
						style={{
							marginBottom: 5,
						}}
						onToggleCheckBox={this.onToggleVisibilty}
						isChecked={showInactive}
						text={this.checkBoxText}
					/>
					{showLeftButton && (
						<Ripple
							rippleColor={rippleColor}
							rippleOpacity={rippleOpacity}
							rippleDuration={400}
							style={arrowContainer}
							onPress={this._scrollToYesterday}>
							<Image source={image} style={arrow}/>
						</Ripple>
					)}
					{showRightButton && (
						<Ripple
							rippleColor={rippleColor}
							rippleOpacity={rippleOpacity}
							rippleDuration={400}
							style={[arrowContainer, arrowContainerRight]}
							onPress={this._scrollToTomorrow}>
							<Image source={image} style={[arrow, {
								transform: [{rotateZ: '180deg'}],
							}]}/>
						</Ripple>
					)}
				</View>
			</Poster>
		);
	}

	_renderDays = (): React$Element<Animated.View>[] => {

		return this.props.days.map((day: Object, i: number): React$Element<Animated.View> => {
			const animation = this._getDayAnimation(i, day.day);

			return (
				<Weekdays
					key={i}
					i={i}
					day={day}
					animation={animation}
					onLayout={this.onLayout}/>
			);
		});
	};

	_renderDate = (): React$Element<Animated.Text>[] => {
		return this.props.days.map((day: Object, i: number): React$Element<Animated.Text> => {
			const animation = this._getDateAnimation(i);

			return (
				<Animated.Text style={animation} key={day.date}>
					{day.date}
				</Animated.Text>
			);
		});
	};

	_scrollToYesterday = () => {
		this.props.scroll(-1);
	};

	_scrollToTomorrow = () => {
		this.props.scroll(1);
	};

	_getDayAnimation = (index: number, weekday: string): Object => {
		const { todayIndex } = this.state;
		const animatedStyle = this._getDayAnimatedStyle(index, weekday);

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

	_getDateAnimation = (index: number): Object => {
		const { todayIndex } = this.state;
		const animatedStyle = this._getDateAnimatedStyle();

		switch (index) {
			case todayIndex - 1:
				return animatedStyle.yesterday;

			case todayIndex:
				return animatedStyle.today;

			case todayIndex + 1:
				return animatedStyle.tomorrow;

			default:
				return animatedStyle.date;
		}
	};

	_interpolate = (...outputRange: any[]): Object => {
		return this.scrollDays.interpolate({
			inputRange: [0, 1, 2],
			outputRange,
		});
	};

	_interpolateFontSize = (...outputRange: any[]): Object => {
		return this.scrollDays.interpolate({
			inputRange: [0, 0.5, 1, 1.5, 2],
			outputRange,
		});
	};

	_getDayAnimatedStyle = (index: number, weekday: string): Object => {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.1111) + (height * 0.13) : 0;

		const dayWidth = this._getDayWidth(weekday);
		const dayHeight = deviceWidth * 0.1;
		const todayWidth = (width - headerHeight) * 0.44;
		const todayOffset = (width - headerHeight) * 0.205333333;

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
				zIndex: -1,
			},
			text: {
				backgroundColor: 'transparent',
				color: '#fff',
				fontSize: dayFontSize,
				fontFamily: Theme.Core.fonts.robotoLight,
				textAlign: 'center',
				zIndex: -1,
			},
		};

		return {
			day,
			beforeYesterday: {
				container: {
					...day.container,
					left: dayWidth ?
						this._interpolate(0 - (2 * dayWidth), 0 - dayWidth, 0)
						:
						0,
				},
				text: day.text,
			},
			yesterday: {
				container: {
					...day.container,
					left: dayWidth ?
						this._interpolate(0 - dayWidth, 0, todayOffset)
						:
						0,
					top: this._interpolate(dayTop, dayTop, todayTop),
					width: dayWidth ? this._interpolate(dayWidth, dayWidth, todayWidth) : undefined,
				},
				text: {
					...day.text,
					fontSize: this._interpolateFontSize(dayFontSize, dayFontSize, dayFontSize, dayFontSize, todayFontSize),
				},
			},
			today: {
				container: {
					...day.container,
					left: this.scrollRight ? this._interpolate(0, todayOffset, 100) : null,
					right: this.scrollRight ? null : this._interpolate(100, todayOffset, 0),
					top: this._interpolate(dayTop, todayTop, dayTop),
					width: dayWidth ? this._interpolate(dayWidth, todayWidth, dayWidth) : todayWidth,
				},
				text: {
					...day.text,
					fontSize: this._interpolateFontSize(dayFontSize, dayFontSize, todayFontSize, dayFontSize, dayFontSize),
				},
			},
			tomorrow: {
				container: {
					...day.container,
					left: null,
					right: dayWidth ?
						this._interpolate(todayOffset, 0, 0 - dayWidth)
						:
						0,
					top: this._interpolate(todayTop, dayTop, dayTop),
					width: dayWidth ? this._interpolate(todayWidth, dayWidth, dayWidth) : undefined,
				},
				text: {
					...day.text,
					fontSize: this._interpolateFontSize(todayFontSize, dayFontSize, dayFontSize, dayFontSize, dayFontSize),
				},
			},
			afterTomorrow: {
				container: {
					...day.container,
					left: dayWidth ? null : '100%',
					right: dayWidth ?
						this._interpolate(0, 0 - dayWidth, 0 - (2 * dayWidth))
						:
						null,
				},
				text: day.text,
			},
		};
	};

	_getDateAnimatedStyle = (): Object => {
		const { appLayout } = this.props;
		const { width } = appLayout;
		const isPortrait = appLayout.height > width;
		const deviceWidth = isPortrait ? width : appLayout.height;

		const height = deviceWidth * 0.064;

		const date = {
			backgroundColor: 'transparent',
			color: '#fff',
			fontFamily: Theme.Core.fonts.robotoLight,
			fontSize: Math.floor(deviceWidth * 0.052),
			height,
			width: '100%',
			textAlign: 'center',
			position: 'absolute',
			left: 0,
			top: 0,
			transform: [
				{ translateY: height },
			],
			textAlignVertical: 'center',
			includeFontPadding: false,
		};

		return {
			date,
			yesterday: {
				...date,
				transform: [
					{ translateY: this._interpolate(-2 * height, -height, 0) },
				],
			},
			today: {
				...date,
				transform: [
					{ translateY: this._interpolate(-height, 0, height) },
				],
			},
			tomorrow: {
				...date,
				transform: [
					{ translateY: this._interpolate(0, height, 2 * height) },
				],
			},
		};
	};

	_getStyle = (): Object => {
		const { todayIndex } = this.state;
		const { appLayout, days } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.1111) + (height * 0.13) : 0;
		const prevDay = days[todayIndex - 1];
		const nextDay = days[todayIndex + 1];
		const prevDayWidth = prevDay ? this._getDayWidth(prevDay.day) + (width * 0.0555) : undefined;
		const nextDayWidth = nextDay ? this._getDayWidth(nextDay.day) + (width * 0.0555) : undefined;

		return {
			container: {
				flex: 1,
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				borderWidth: 0,
				alignItems: 'center',
				justifyContent: 'flex-end',
			},
			daysContainer: {
				borderWidth: 0,
				position: 'absolute',
				left: (width - headerHeight) * 0.076,
				top: 0,
				bottom: 0,
				right: (width - headerHeight) * 0.076,
				overflow: 'hidden',
			},
			dateContainer: {
				borderWidth: 0,
				alignItems: 'center',
				justifyContent: 'center',
				height: deviceWidth * 0.064,
				width: (width - headerHeight) * 0.44,
				overflow: 'hidden',
				position: 'absolute',
				left: (width - headerHeight) * 0.205333333,
				top: deviceWidth * 0.176,
			},
			arrowContainer: {
				position: 'absolute',
				width: prevDayWidth ? prevDayWidth : deviceWidth * 0.196,
				height: deviceWidth * 0.1,
				left: deviceWidth * 0.026666667,
				top: deviceWidth * 0.117333333,
				justifyContent: 'center',
				borderRadius: 5,
				zIndex: 3,
			},
			arrowContainerRight: {
				left: null,
				right: deviceWidth * 0.026666667,
				width: nextDayWidth ? nextDayWidth : deviceWidth * 0.196,
				alignItems: 'flex-end',
			},
			arrow: {
				height: deviceWidth * 0.036,
				width: deviceWidth * 0.022666667,
			},
		};
	};

	_getDayWidth = (weekday: string): any => {
		const { daysLayout } = this.state;
		return daysLayout[weekday] ? daysLayout[weekday] : undefined;
	};

	onLayout(width: number, i: number, weekday: string) {
		const { todayIndex } = this.state;
		if (!this.weekDaysLayout[weekday] && i !== todayIndex) {
			this.weekDaysLayout[weekday] = width;
			let length = Object.keys(this.weekDaysLayout).length;
			if (length > 5) {
				this.setState({
					daysLayout: this.weekDaysLayout,
				});
			}
		}
	}

}

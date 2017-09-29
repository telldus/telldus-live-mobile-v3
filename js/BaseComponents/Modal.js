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

import React, {Component} from 'react';
import { Animated, Easing } from 'react-native';

type Props = {
	showModal: any,
	children: any,
	entry?: string,
	exit?: string,
	entryDuration?: number,
	exitDuration?: number,
	startValue?: number,
	endValue?: number,
	onOpen?: () => void,
	onClose?: () => void,
};

export default class Modal extends Component {
	animationZoomOut: (duration?: number) => void;
	animationZoomIn: (duration?: number) => void;
	animationSlideInY: (duration?: number) => void;
	animationSlideOutY: (duration?: number) => void;
	onOpen: (nextProps: Object) => void;
	onClose: (nextProps: Object) => void;
	animatedScale: any;
	animatedOpacity: any;
	animatedYValue: any;

	static defaultProps: Object;
	props: Props;

	constructor(props: Props) {
		super(props);

		this.animationZoomOut = this.animationZoomOut.bind(this);
		this.animationZoomIn = this.animationZoomIn.bind(this);
		this.animationSlideInY = this.animationSlideInY.bind(this);
		this.animationSlideOutY = this.animationSlideOutY.bind(this);

		this.animatedScale = new Animated.Value(0.01);
		this.animatedOpacity = new Animated.Value(0);
		this.animatedYValue = new Animated.Value(props.startValue ? props.startValue : 0);
	}

	animationZoomIn(duration?: number) {
		Animated.parallel([
			this._startOpacity(duration),
			this._startScale(duration),
		]).start();
	}

	animationZoomOut(duration?: number) {
		Animated.parallel([
			this._stopOpacity(duration),
			this._stopScale(duration),
		]).start();
	}

	animationSlideInY(duration?: number) {
		Animated.parallel([
			this.startSlideInY(duration),
			this._startOpacity(duration),
		]).start();
	}

	animationSlideOutY(duration?: number) {
		Animated.parallel([
			this.startSlideOutY(duration),
			this._stopOpacity(duration),
		]).start();
	}

	startSlideInY(duration?: number) {
		Animated.timing(this.animatedYValue,
			{
				toValue: this.props.endValue,
				duration: 500,
			}).start();
	}

	startSlideOutY(duration?: number) {
		Animated.timing(this.animatedYValue,
			{
				toValue: this.props.startValue,
				duration: 500,
			}).start();
	}

	_startScale(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 1,
				duration: duration,
				easing: Easing.easeOutBack,
			}).start();
	}

	_stopScale(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 0.01,
				duration: duration,
				easing: Easing.easeOutBack,
			}).start();
	}

	_startOpacity(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 1,
				duration: duration,
			}).start();
	}

	_stopOpacity(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 0,
				duration: duration,
			}).start();
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.showModal && !this.props.showModal) {
			this.onOpen(nextProps);
			this.animatedOpacity.setValue(0);
			this.animatedScale.setValue(0.01);
			let entryAnimationType = this.handleAnimationEntryType(nextProps.entry);
			entryAnimationType(nextProps.entryDuration);
		}
		if (!nextProps.showModal && this.props.showModal) {
			this.onClose(nextProps);
			let exitAnimationType = this.handleAnimationExitType(nextProps.exit);
			exitAnimationType(nextProps.exitDuration);
		}
	}

	handleAnimationEntryType(type?: string) {
		switch (type) {
			case 'ZoomIn':
				return this.animationZoomIn;
			case 'SlideInY':
				return this.animationSlideInY;
			default:
				return this.animationZoomIn;
		}
	}

	handleAnimationExitType(type?: string) {
		switch (type) {
			case 'ZoomOut':
				return this.animationZoomOut;
			case 'SlideOutY':
				return this.animationSlideOutY;
			default:
				return this.animationZoomOut;
		}
	}

	onClose(nextProps: Object) {
		if (nextProps.onClose) {
			if (typeof nextProps.onClose === 'function') {
				nextProps.onClose();
			} else {
				console.warn('Invalid Prop Passed : onClose expects a Function.');
			}
		}
	}

	onOpen(nextProps: Object) {
		if (nextProps.onOpen) {
			if (typeof nextProps.onOpen === 'function') {
				nextProps.onOpen();
			} else {
				console.warn('Invalid Prop Passed : onOpen expects a Function.');
			}
		}
	}

	render() {
		let animatedProps = {};
		if (this.props.entry === 'ZoomIn' && this.props.exit === 'ZoomOut') {
			let scaleAnim = this.animatedScale.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 1],
			});
			animatedProps = {scale: scaleAnim};
		} else if (this.props.entry === 'SlideInY' && this.props.exit === 'SlideOutY') {
			let YAnimatedValue = this.animatedYValue.interpolate({
				inputRange: [this.props.startValue, this.props.endValue],
				outputRange: [this.props.startValue, this.props.endValue],
			});
			animatedProps = {translateY: YAnimatedValue};
		}
		let opacityAnim = this.animatedScale.interpolate({
			inputRange: [0, 0.2, 0.5, 1],
			outputRange: [0, 0.5, 1, 1],
		});
		return (
			<Animated.View style={[ this.props.modalStyle, {transform: [animatedProps],
				opacity: opacityAnim,
			}]}>
				{this.props.children}
			</Animated.View>
		);
	}
}

Modal.defaultProps = {
	entryDuration: 500,
	exitDuration: 500,
	startValue: 0,
	endValue: 100,
};

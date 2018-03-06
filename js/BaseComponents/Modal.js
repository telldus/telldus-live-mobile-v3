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
import { ifIphoneX } from 'react-native-iphone-x-helper';

import { connect } from 'react-redux';
import { clearData } from 'Actions_Modal';

import Theme from 'Theme';

type Props = {
	dispatch: Function,
	showModal: any,
	showOverlay?: boolean,
	modalStyle?: Array<any> | number | Object,
	modalContainerStyle?: Array<any> | number | Object,
	children: any,
	entry?: string,
	exit?: string,
	entryDuration?: number,
	exitDuration?: number,
	startValue?: number,
	endValue?: number,
	onOpen?: () => void,
	onClose?: () => void,
	onOpened?: () => void,
	onClosed?: () => void,
	appLayout: Object,
};

class Modal extends Component<Props, void> {
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

	componentWillUnmount() {
		this.props.dispatch(clearData());
	}

	animationZoomIn(duration?: number) {
		Animated.parallel([
			this._startOpacity(duration),
			this._startScale(duration),
		]).start((event: Object) => {
			if (event.finished) {
				this.onOpened();
			}
		});
	}

	animationZoomOut(duration?: number) {
		Animated.parallel([
			this._stopOpacity(duration),
			this._stopScale(duration),
		]).start((event: Object) => {
			if (event.finished) {
				this.onClosed();
			}
		});
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
				easing: Easing.linear,
			}).start();
	}

	_stopScale(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 0.01,
				duration: duration,
				easing: Easing.linear,
			}).start();
	}

	_startOpacity(duration?: number) {
		Animated.timing(this.animatedOpacity,
			{
				toValue: 1,
				duration: duration,
				easing: Easing.linear,
			}).start();
	}

	_stopOpacity(duration?: number) {
		Animated.timing(this.animatedOpacity,
			{
				toValue: 0,
				duration: duration,
				easing: Easing.linear,
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

	handleAnimationEntryType(type?: string): (number) => void {
		switch (type) {
			case 'ZoomIn':
				return this.animationZoomIn;
			case 'SlideInY':
				return this.animationSlideInY;
			default:
				return this.animationZoomIn;
		}
	}

	handleAnimationExitType(type?: string): (number) => void {
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

	onClosed() {
		let { onClosed } = this.props;
		if (onClosed) {
			if (typeof onClosed === 'function') {
				onClosed();
			} else {
				console.warn('Invalid Prop Passed : onClosed expects a Function.');
			}
		}
	}

	onOpened() {
		let { onOpened } = this.props;
		if (onOpened) {
			if (typeof onOpened === 'function') {
				onOpened();
			} else {
				console.warn('Invalid Prop Passed : onOpened expects a Function.');
			}
		}
	}

	render(): Object {
		let animatedProps = {};
		let { showOverlay, modalContainerStyle, modalStyle, children,
			entry, exit, startValue, endValue, appLayout } = this.props;
		let styles = this.getStyles(appLayout);

		if (entry === 'ZoomIn' && exit === 'ZoomOut') {
			let scaleAnim = this.animatedScale.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 1],
			});
			animatedProps = {scale: scaleAnim};
		} else if (entry === 'SlideInY' && exit === 'SlideOutY') {
			let YAnimatedValue = this.animatedYValue.interpolate({
				inputRange: [startValue, endValue],
				outputRange: [startValue, endValue],
			});
			animatedProps = {translateY: YAnimatedValue};
		}
		let opacityAnim = this.animatedOpacity.interpolate({
			inputRange: [0, 0.2, 0.5, 1],
			outputRange: [0, 0.5, 1, 1],
		});
		let overlayProps = showOverlay ? styles.overlayLayout : null;
		return (
			<Animated.View style={[ styles.modalContainer, modalContainerStyle, overlayProps, {transform: [animatedProps],
				opacity: opacityAnim,
			}]}>
				<Animated.View style={[ styles.modal, modalStyle, {transform: [animatedProps],
					opacity: opacityAnim,
				}]}>
					{children}
				</Animated.View>
			</Animated.View>
		);
	}

	getStyles(appLayout: Object): Object {
		let { height, width } = appLayout;
		return {
			modalContainer: {
				flex: 1,
				position: 'absolute',
				elevation: 8,
				backgroundColor: '#00000060',
				alignItems: 'center',
				justifyContent: 'center',
			},
			overlayLayout: {
				...ifIphoneX({width: '100%', height: '100%'}, {width, height}),
			},
			modal: {
				position: 'absolute',
				...Theme.Core.shadow,
				elevation: 8,
			},
		};
	}
}

Modal.defaultProps = {
	entryDuration: 500,
	exitDuration: 500,
	startValue: 0,
	endValue: 100,
	showOverlay: true,
};

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

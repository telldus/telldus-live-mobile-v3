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
import { clearData } from '../App/Actions/Modal';

import Theme from '../App/Theme';

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

type State = {
	showModal: boolean,
};

type DefaultProps = {
	entryDuration: number,
	exitDuration: number,
	startValue: number,
	endValue: number,
	showOverlay: boolean,
};

class Modal extends Component<Props, State> {
	animationZoomOut: (duration?: number) => void;
	animationZoomIn: (duration?: number) => void;
	animationSlideInY: (duration?: number) => void;
	animationSlideOutY: (duration?: number) => void;
	onOpen: (nextProps: Object) => void;
	onClose: (nextProps: Object) => void;
	animatedScale: any;
	animatedOpacity: any;
	animatedYValue: any;

	static defaultProps: DefaultProps = {
		entryDuration: 500,
		exitDuration: 500,
		startValue: 0,
		endValue: 100,
		showOverlay: true,
	};
	props: Props;
	state: State;

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { showModal } = props;
		if (props.showModal !== state.showModal) {
			return {
				showModal,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		const { showModal } = props;
		this.state = {
			showModal,
		};

		this.animationZoomOut = this.animationZoomOut.bind(this);
		this.animationZoomIn = this.animationZoomIn.bind(this);
		this.animationSlideInY = this.animationSlideInY.bind(this);
		this.animationSlideOutY = this.animationSlideOutY.bind(this);

		this.animatedScale = new Animated.Value(0.01);
		this.animatedOpacity = new Animated.Value(0);
		this.animatedYValue = new Animated.Value(props.startValue ? props.startValue : 0);

		if (showModal) {
			this.onOpen(props);
			this.animatedOpacity.setValue(0);
			this.animatedScale.setValue(0.01);
			let entryAnimationType = this.handleAnimationEntryType(this.props.entry);
			entryAnimationType(this.props.entryDuration);
		}
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
		this.animatedScale.setValue(1);
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
				duration,
				useNativeDriver: true,
			}).start();
	}

	startSlideOutY(duration?: number) {
		Animated.timing(this.animatedYValue,
			{
				toValue: this.props.startValue,
				duration,
				useNativeDriver: true,
			}).start((event: Object) => {
			if (event.finished) {
				this.animatedScale.setValue(0.01);
			}
		});
	}

	_startScale(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 1,
				duration: duration,
				easing: Easing.linear,
				useNativeDriver: true,
			}).start();
	}

	_stopScale(duration?: number) {
		Animated.timing(this.animatedScale,
			{
				toValue: 0.01,
				duration: duration,
				easing: Easing.linear,
				useNativeDriver: true,
			}).start();
	}

	_startOpacity(duration?: number) {
		Animated.timing(this.animatedOpacity,
			{
				toValue: 1,
				duration: duration,
				easing: Easing.linear,
				useNativeDriver: true,
			}).start();
	}

	_stopOpacity(duration?: number) {
		Animated.timing(this.animatedOpacity,
			{
				toValue: 0,
				duration: duration,
				easing: Easing.linear,
				useNativeDriver: true,
			}).start();
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { showModal: prevShowModal } = prevState;
		const { showModal } = this.state;
		if (showModal && !prevShowModal) {
			this.onOpen(this.props);
			this.animatedOpacity.setValue(0);
			this.animatedScale.setValue(0.01);
			let entryAnimationType = this.handleAnimationEntryType(this.props.entry);
			entryAnimationType(this.props.entryDuration);
		}
		if (!showModal && prevShowModal) {
			this.onClose(this.props);
			let exitAnimationType = this.handleAnimationExitType(this.props.exit);
			exitAnimationType(this.props.exitDuration);
		}
	}

	handleAnimationEntryType(type?: string): (any) => void {
		switch (type) {
			case 'ZoomIn':
				return this.animationZoomIn;
			case 'SlideInY':
				return this.animationSlideInY;
			default:
				return this.animationZoomIn;
		}
	}

	handleAnimationExitType(type?: string): (any) => void {
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
		let animatedProps = [];
		let { showOverlay, modalContainerStyle, modalStyle, children,
			entry, exit, startValue, endValue, appLayout } = this.props;
		let styles = this.getStyles(appLayout);

		if (entry === 'ZoomIn' && exit === 'ZoomOut') {
			let scaleAnim = this.animatedScale.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 1],
			});
			animatedProps = [{scale: scaleAnim}];
		} else if (entry === 'SlideInY' && exit === 'SlideOutY') {
			let YAnimatedValue = this.animatedYValue.interpolate({
				inputRange: [startValue, endValue],
				outputRange: [startValue, endValue],
			});
			animatedProps = [{translateY: YAnimatedValue}, {scale: this.animatedScale}];
		}
		let opacityAnim = this.animatedOpacity.interpolate({
			inputRange: [0, 0.2, 0.5, 1],
			outputRange: [0, 0.5, 1, 1],
		});
		let overlayProps = showOverlay ? styles.overlayLayout : null;

		if (!showOverlay) {
			return (
				<Animated.View style={[ styles.modal, modalStyle, {transform: animatedProps,
					opacity: opacityAnim,
				}]}>
					{children}
				</Animated.View>
			);
		}

		return (
			<Animated.View style={[ styles.modalContainer, modalContainerStyle, overlayProps, {transform: animatedProps,
				opacity: opacityAnim,
			}]}>
				<Animated.View style={[ styles.modal, modalStyle, {transform: animatedProps,
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
				flex: 0,
				position: 'absolute',
				elevation: 8,
				alignItems: 'center',
				justifyContent: 'center',
			},
			overlayLayout: {
				...ifIphoneX({width: '100%', height: '100%'}, {width, height}),
				backgroundColor: '#00000060',
			},
			modal: {
				position: 'absolute',
				...Theme.Core.shadow,
				elevation: 8,
			},
		};
	}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

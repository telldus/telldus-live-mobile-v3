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
	onOpen?: () => void,
	onClose?: () => void,
}

export default class Modal extends Component {
	_closeModal: (duration?: number) => void;
	_openModal: (duration?: number) => void;
	onOpen: (nextProps: Object) => void;
	onClose: (nextProps: Object) => void;
	animatedScale: any;
	animatedOpacity: any;

	static defaultProps: Object;
	props : Props;

	constructor(props: Props) {
		super(props);

		this._closeModal = this._closeModal.bind(this);
		this._openModal = this._openModal.bind(this);

		this.animatedScale = new Animated.Value(0.01);
		this.animatedOpacity = new Animated.Value(0);
	}

	_openModal(duration?: number) {
		Animated.parallel([
			this._startOpacity(duration),
			this._startScale(duration),
		]).start();
	}

	_closeModal(duration?: number) {
		Animated.parallel([
			this._stopOpacity(duration),
			this._stopScale(duration),
		]).start();
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

	onClose(nextProps: Object) {
		if (nextProps.onClose) {
			if (typeof nextProps.onClose === 'function') { console.log('test in');
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

	handleAnimationEntryType(type?: string) {
		switch (type) {
			case 'ZoomIn':
				return this._openModal;
			default:
				return this._openModal;
		}
	}

	handleAnimationExitType(type?: string) {
		switch (type) {
			case 'ZoomOut':
				return this._closeModal;
			default:
				return this._closeModal;
		}
	}

	render() {
		const scaleAnim = this.animatedScale.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
		});
		const opacityAnim = this.animatedScale.interpolate({
			inputRange: [0, 0.2, 0.5, 1],
			outputRange: [0, 0.5, 1, 1],
		});
		return (
			<Animated.View style={[ this.props.modalStyle, {transform: [
				{scale: scaleAnim }], opacity: opacityAnim,
			}]}>
				{this.props.children}
			</Animated.View>
		);
	}
}

Modal.defaultProps = {
	entryDuration: 500,
	exitDuration: 500,
};

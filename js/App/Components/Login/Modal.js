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
import { Animated, Easing } from 'react-native';

import { View } from 'BaseComponents';

type Props = {
	showModal: any,
	children: any,
}
export default class Modal extends View {
	_closeModal: () => void;
	props : Props;
	constructor(props: Props) {
		super(props);
		this.state = {

		};

		this._closeModal = this._closeModal.bind(this);

		this.animatedScale = new Animated.Value(0.01);
		this.animatedOpacity = new Animated.Value(0);
	}

	_openModal() {
		Animated.parallel([
			this._startOpacity(),
			this._startScale(),
		]).start();
	}

	_startScale() {
		Animated.timing(this.animatedScale,
			{
				toValue: 1,
				duration: 300,
				easing: Easing.easeOutBack,
			}).start();
	}

	_stopScale() {
		Animated.timing(this.animatedScale,
			{
				toValue: 0.01,
				duration: 200,
				easing: Easing.easeOutBack,
			}).start();
	}

	_startOpacity() {
		Animated.timing(this.animatedScale,
			{
				toValue: 1,
				duration: 300,
			}).start();
	}

	_stopOpacity() {
		Animated.timing(this.animatedScale,
			{
				toValue: 0,
				duration: 200,
			}).start();
	}

	_closeModal() {
		Animated.parallel([
			this._stopOpacity(),
			this._stopScale(),
		]).start();
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.showModal) {
			this._openModal();
		}
		if (!nextProps.showModal) {
			this._closeModal();
		}
	}

	render() {
		if (!this.props.showModal) {
			return null;
		}
		const scaleAnim = this.animatedScale.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
		});
		const opacityAnim = this.animatedScale.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
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

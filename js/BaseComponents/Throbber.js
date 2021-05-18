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
import {Animated, StyleSheet} from 'react-native';

import View from './View';
import IconTelldus from './IconTelldus';
const AnimatedIconTelldus = Animated.createAnimatedComponent(IconTelldus);

type Props = {
	throbberContainerStyle?: Array<any> | Object,
	throbberStyle?: Array<any> | Object,
	throbSpeed?: number,
	level?: number,
};

type DefaultProps = {
	throbSpeed: number,
};

export default class Throbber extends Component<Props, null> {
	props: Props;

	animatedValue: Object;
	nextValue: number;
	currentValue: number;
	startThrob: () => void;

	static defaultProps: DefaultProps = {
		throbSpeed: 10,
	};

	constructor(props: Props) {
		super(props);
		this.animatedValue = new Animated.Value(0);
		this.currentValue = 0;
		this.nextValue = 100;
	}

	componentDidMount() {
		this.startThrob();
	}

	startThrob() {
		Animated.timing(this.animatedValue, {
			toValue: this.nextValue,
			duration: this.props.throbSpeed,
			delay: 10,
			useNativeDriver: true,
		}).start((event: Object) => {
			if (event.finished) {
				this.currentValue = this.nextValue;
				this.nextValue += 100;
				this.startThrob();
			}
		});
	}

	render(): Object {
		let {
			throbberContainerStyle,
			throbberStyle,
			level,
		} = this.props;

		let interpolatedValue = this.animatedValue.interpolate({
			inputRange: [this.currentValue, this.nextValue],
			outputRange: ['0deg', '45deg'],
		});

		return (
			<View style={[styles.throbberContainer, throbberContainerStyle]}>
				<AnimatedIconTelldus
					level={level || 23}
					icon="loading" style={[styles.throbber, throbberStyle, {
						transform: [{
							rotate: interpolatedValue,
						}],
					},
					]}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	throbberContainer: {
		position: 'absolute',
		alignItems: 'center',
	},
	throbber: {
		fontSize: 25,
	},
});

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
import { Animated, Image } from 'react-native';

import View from './View';
import Text from './Text';

import Theme from '../App/Theme';

type Props = {
    top: number,
    right: number,
    left: number,
    distance: number,
    arrowPos: 'left' | 'right',
};

type DefaultProps = {
    top: number,
    right: number,
    left: number,
    distance: number,
    arrowPos: 'left' | 'right',
};

export default class AttentionCatcher extends Component<Props, null> {
props: Props;

static defaultProps: DefaultProps = {
	top: 0,
	right: 0,
	left: 0,
	distance: 10,
	arrowPos: 'right',
};

animatedRight: any;
animatedLeft: any;
bounceToDest: () => void;
bounceFromDest: () => void;
constructor(props: Props) {
	super(props);

	this.animatedRight = new Animated.Value(props.right);
	this.animatedLeft = new Animated.Value(props.left);
	this.bounceToDest = this.bounceToDest.bind(this);
	this.bounceFromDest = this.bounceFromDest.bind(this);
}

componentDidMount() {
	this.bounceFromDest();
}

bounceToDest() {
	const { arrowPos, right, left } = this.props;
	const toVal = arrowPos === 'left' ? left : right;
	const fromVal = arrowPos === 'left' ? this.animatedLeft : this.animatedRight;
	Animated.timing(fromVal,
		{
			toValue: toVal,
			duration: 800,
		}).start((event: Object) => {
		if (event.finished) {
			this.bounceFromDest();
		}
	});
}

bounceFromDest() {
	const { distance, right, arrowPos, left } = this.props;
	const toVal = arrowPos === 'left' ? left : right;
	const fromVal = arrowPos === 'left' ? this.animatedLeft : this.animatedRight;
	Animated.timing(fromVal,
		{
			toValue: toVal + distance,
			duration: 800,
		}).start((event: Object) => {
		if (event.finished) {
			this.bounceToDest();
		}
	});
}

render(): Object {
	const { top, right, left, distance, arrowPos } = this.props;
	let animatedRight, animatedLeft;

	if (arrowPos === 'right') {
		animatedRight = this.animatedRight.interpolate({
			inputRange: [right - distance, right],
			outputRange: [right - distance, right],
		});
	}
	if (arrowPos === 'left') {
		animatedLeft = this.animatedLeft.interpolate({
			inputRange: [left - distance, left],
			outputRange: [left - distance, left],
		});
	}

	const {
		triangleCommon,
	} = this.getStyles();

	return (
		<Animated.View style={{
			position: 'absolute',
			top,
			right: animatedRight,
			left: animatedLeft,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		}}>
			{arrowPos === 'left' && (
				<Image
					source={{uri: 'triangle'}}
					style={[triangleCommon]}
					tintColor={Theme.Core.brandSecondary}
					resizeMode={'stretch'}
				/>
			)}
			<View style={{
				backgroundColor: Theme.Core.brandSecondary,
				justifyContent: 'center',
				padding: 7,
				borderRadius: 4,
			}}>
				<Text style={{
					color: '#fff',
					fontSize: 16,
				}}>
ADD Z-WAVE DEVICE
				</Text>
			</View>
			{arrowPos === 'right' && (
				<Image
					source={{uri: 'triangle'}}
					style={[triangleCommon, {
						transform: [
							{rotate: '180deg'},
						],
					}]}
					tintColor={Theme.Core.brandSecondary}
					resizeMode={'stretch'}
				/>
			)}
		</Animated.View>
	);
}

getStyles(): Object {
	return {
		triangleCommon: {
			height: 15,
			width: 10,
		},
	};
}
}

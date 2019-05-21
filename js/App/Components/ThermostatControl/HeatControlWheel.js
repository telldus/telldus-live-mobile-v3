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
import CircularSlider from 'react-native-circular-slider';

import {
	View,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
};

type State = {
    angleLength: number,
    startAngle: number,
};

class HeatControlWheel extends View<Props, State> {
props: Props;

state: State = {
	startAngle: 3.758784045130155,
	angleLength: 4.993323363832153,
};

onUpdate: (Object) => void;

constructor(props: Props) {
	super(props);

	this.onUpdate = this.onUpdate.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onUpdate = (data: Object) => {
	const {startAngle, angleLength} = data;
	this.setState({
		angleLength,
		startAngle,
	});
}

render(): Object {

	const {
		cover,
		radius,
	} = this.getStyles();

	return (
		<View style={cover}>
			<CircularSlider
				startAngle={this.state.startAngle}
				angleLength={this.state.angleLength}
				onUpdate={this.onUpdate}
				segments={5}
				strokeWidth={20}
				radius={radius}
				gradientColorFrom="#ffcf00"
				gradientColorTo="#ff9800"
				bgCircleColor="#fff"
				keepArcVisible={true}
				showStopKnob={false}
			/>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, shadow } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		cover: {
			...shadow,
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			marginTop: padding,
			marginHorizontal: padding,
			padding: padding * 2,
		},
		radius: deviceWidth * 0.3,
	};
}
}

module.exports = HeatControlWheel;

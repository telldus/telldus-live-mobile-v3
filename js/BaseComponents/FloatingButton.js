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
import { Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import View from './View';
import Theme from 'Theme';

type Props = {
	onPress: Function,
	imageSource: number,
	tabs: boolean,
};

class FloatingButton extends View {

	props: Props;

	static propTypes = {
		onPress: PropTypes.func.isRequired,
		imageSource: PropTypes.number.isRequired,
		tabs: PropTypes.bool,
	};

	constructor(props) {
		super(props);

		this.buttonColor = Theme.Core.brandSecondary;
	}

	getStyles = () => {
		const { tabs = false } = this.props;
		const isIOSTabs = Platform.OS === 'ios' && tabs;

		const deviceWidth = Dimensions.get('window').width;

		const buttonSize = deviceWidth * 0.134666667;
		const buttonOffset = deviceWidth * 0.034666667;
		const buttonIconSize = deviceWidth * 0.056;

		return {
			container: {
				backgroundColor: this.buttonColor,
				borderRadius: buttonSize / 2,
				position: 'absolute',
				height: buttonSize,
				width: buttonSize,
				bottom: buttonOffset + (isIOSTabs ? 50 : 0),
				right: buttonOffset,
				elevation: 2,
				shadowColor: '#000',
				shadowOpacity: 0.5,
				shadowRadius: 2,
				shadowOffset: {
					height: 2,
					width: 0,
				},
			},
			button: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			icon: {
				width: buttonIconSize,
				height: buttonIconSize,
			},
		};
	};

	render() {
		const { container, button, icon } = this.getStyles();

		const { onPress, imageSource } = this.props;

		return (
			<TouchableOpacity style={container} onPress={onPress}>
				<View style={button}>
					<Image source={imageSource} style={icon}/>
				</View>
			</TouchableOpacity>
		);
	}
}

module.exports = FloatingButton;

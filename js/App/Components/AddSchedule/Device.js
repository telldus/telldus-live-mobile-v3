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
import { TouchableOpacity, Image, Dimensions } from 'react-native';
import { View, Text } from 'BaseComponents';

class Device extends View {

	constructor(props) {
		super(props);

		this.deviceWidth = Dimensions.get('window').width;

		// TODO: font-family
		this.styles = {
			container: {
				flex: 1,
				position: 'relative',
			},
			bgImage: {
				height: this.deviceWidth * 0.329333333,
				width: this.deviceWidth,
			},
			backButton: {
				container: {
					width: 50,
					height: this.deviceWidth * 0.036,
					position: 'absolute',
					top: this.deviceWidth * 0.037333333,
					left: this.deviceWidth * 0.026666667,
				},
				wrapper: {
					flexDirection: 'row',
					alignItems: 'center',
				},
				image: {
					width: this.deviceWidth * 0.022666667,
					height: this.deviceWidth * 0.036,
				},
				text: {
					color: '#fff',
					marginLeft: this.deviceWidth * 0.026666667,
					fontSize: this.deviceWidth * 0.037333333,
				},
			},
			header: {
				container: {
					position: 'absolute',
					right: this.deviceWidth * 0.124,
					top: this.deviceWidth * 0.088,
					flex: 1,
					alignItems: 'flex-end',
				},
				h1: {
					color: '#fff',
					fontSize: this.deviceWidth * 0.085333333,
					marginRight: this.deviceWidth * 0.008,
				},
				h2: {
					color: '#fff',
					fontSize: this.deviceWidth * 0.053333333,
				},
			},
		};
	}

	goBack = () => {
		this.props.navigation.goBack();
	};

	render() {
		return (
			<View style={this.styles.container}>
				<Image
					source={require('./img/add-schedule-bg.png')}
					resizeMode="contain"
					style={this.styles.bgImage}
				/>
				<TouchableOpacity onPress={this.goBack} style={this.styles.backButton.container}>
					<View style={this.styles.backButton.wrapper}>
						<Image
							source={require('./img/keyboard-left-arrow-button.png')}
							style={this.styles.backButton.image}
						/>
						<Text style={this.styles.backButton.text}>
							Back
						</Text>
					</View>
				</TouchableOpacity>
				<View style={this.styles.header.container}>
					<Text style={this.styles.header.h1}>
						1. Device
					</Text>
					<Text style={this.styles.header.h2}>
						Choose a device
					</Text>
				</View>
			</View>
		);
	}
}

module.exports = Device;

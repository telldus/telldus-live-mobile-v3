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
import { Dimensions, TouchableOpacity, Image } from 'react-native';
import { View, Text } from 'BaseComponents';
import Theme from 'Theme';

type Props = {
	h1: string,
	h2: string,
	infoButton: Object,
};

class Poster extends View {

	props: Props;

	static propTypes = {
		h1: PropTypes.string.isRequired,
		h2: PropTypes.string.isRequired,
		infoButton: PropTypes.object,
	};

	constructor(props) {
		super(props);
	}

	getStyles = () => {
		const deviceWidth = Dimensions.get('window').width;

		const roundedInfoButtonSize = deviceWidth * 0.042666667;

		// TODO: font-family
		return {
			bgImage: {
				mask: {
					borderWidth: 0,
					height: deviceWidth * 0.333333333,
					width: deviceWidth,
					overflow: 'hidden',
				},
				image: {
					height: deviceWidth * 0.577333333,
					width: deviceWidth,
				},
			},
			header: {
				container: {
					position: 'absolute',
					right: deviceWidth * 0.124,
					top: deviceWidth * 0.088,
					flex: 1,
					alignItems: 'flex-end',
				},
				h1: {
					color: '#fff',
					fontSize: deviceWidth * 0.085333333,
					fontFamily: Theme.Core.fonts.robotoLight,
				},
				h2: {
					color: '#fff',
					fontSize: deviceWidth * 0.053333333,
					fontFamily: Theme.Core.fonts.robotoLight,
				},
			},
			roundedInfoButton: {
				container: {
					position: 'absolute',
					right: deviceWidth * 0.045333333,
					bottom: deviceWidth * 0.036,
				},
				icon: {
					height: roundedInfoButtonSize,
					width: roundedInfoButtonSize,
				},
			},
		};
	};

	renderInfoButton = (button, styles) => {
		return (
			<TouchableOpacity style={styles.container}>
				<Image
					source={require('../img/rounded-info-button.png')}
					style={styles.icon}
				/>
			</TouchableOpacity>
		);
	};

	render() {
		const { bgImage, header, roundedInfoButton } = this.getStyles();
		const { h1, h2, infoButton } = this.props;

		return (
			<View style={bgImage.mask}>
				<Image
					source={require('../img/telldus-geometric-header-bg.png')}
					style={bgImage.image}
				/>
				<View style={header.container}>
					<Text style={header.h1}>
						{h1}
					</Text>
					<Text style={header.h2}>
						{h2}
					</Text>
				</View>
				{infoButton && this.renderInfoButton(infoButton, roundedInfoButton)}
			</View>
		);
	}
}

module.exports = Poster;

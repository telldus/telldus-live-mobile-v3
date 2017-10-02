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
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { Poster } from 'BaseComponents';
import Theme from 'Theme';

type Props = {
	h1: string,
	h2: string,
	infoButton?: Object,
};

export default class SchedulePoster extends View<null, Props, null> {

	static propTypes = {
		h1: PropTypes.string.isRequired,
		h2: PropTypes.string.isRequired,
		infoButton: PropTypes.object,
	};

	render(): React$Element<any> {
		const style = this._getStyle();
		const { h1, h2, infoButton } = this.props;

		return (
			<Poster>
				<View style={style.hContainer}>
					<Text style={[style.h, style.h1]}>
						{h1}
					</Text>
					<Text style={[style.h, style.h2]}>
						{h2}
					</Text>
				</View>
				{!!infoButton && this._renderInfoButton(infoButton)}
			</Poster>
		);
	}

	_renderInfoButton = (button: Object): Object => {
		const { roundedInfoButtonContainer, roundedInfoButton } = this._getStyle();

		return (
			<TouchableOpacity style={roundedInfoButtonContainer}>
				<Image
					source={require('../img/rounded-info-button.png')}
					style={roundedInfoButton}
				/>
			</TouchableOpacity>
		);
	};

	_getStyle = (): Object => {
		const deviceWidth = Dimensions.get('window').width;

		const roundedInfoButtonSize = deviceWidth * 0.042666667;

		return {
			hContainer: {
				position: 'absolute',
				right: deviceWidth * 0.124,
				top: deviceWidth * 0.088,
				flex: 1,
				alignItems: 'flex-end',
			},
			h: {
				color: '#fff',
				backgroundColor: 'transparent',
				fontFamily: Theme.Core.fonts.robotoLight,
			},
			h1: {
				fontSize: deviceWidth * 0.085333333,
			},
			h2: {
				fontSize: deviceWidth * 0.053333333,
			},
			roundedInfoButtonContainer: {
				position: 'absolute',
				right: deviceWidth * 0.045333333,
				bottom: deviceWidth * 0.036,
			},
			roundedInfoButton: {
				height: roundedInfoButtonSize,
				width: roundedInfoButtonSize,
			},
		};
	};

}

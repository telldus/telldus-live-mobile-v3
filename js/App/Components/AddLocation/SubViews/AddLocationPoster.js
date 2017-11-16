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
import PropTypes from 'prop-types';

import { View, Text, Dimensions, StyleSheet, Poster, RoundedInfoButton } from 'BaseComponents';

import Theme from 'Theme';

const deviceWidth = Dimensions.get('window').width;

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object | number,
	infoButtonStyle?: Array<any> | Object | number,
};

type Props = {
	h1: string,
	h2: string,
	infoButton?: InfoButton,
};

export default class AddLocationPoster extends View {
	props: Props;

	static propTypes = {
		h1: PropTypes.string,
		h2: PropTypes.string,
		infoButton: PropTypes.object,
	};

	constructor(props: Props) {
		super(props);
		this._renderInfoButton = this._renderInfoButton.bind(this);
	}

	_renderInfoButton = (button: Object): Object => {
		return (
			<RoundedInfoButton buttonProps={button}/>
		);
	};

	render(): Object {
		const { h1, h2, infoButton } = this.props;
		return (
			<Poster>
				<View style={styles.hContainer}>
					<Text style={[styles.h, styles.h1]}>
						{!!h1 && h1}
					</Text>
					<Text style={[styles.h, styles.h2]}>
						{!!h2 && h2}
					</Text>
				</View>
				{!!infoButton && this._renderInfoButton(infoButton)}
			</Poster>
		);
	}

}

const styles = StyleSheet.create({
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
});

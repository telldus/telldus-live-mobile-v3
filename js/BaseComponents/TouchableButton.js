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
import { Text } from 'react-native';

import StyleSheet from 'StyleSheet';
import Theme from 'Theme';

type Props = {
	style: any,
	text: string,
	onPress: Function,
};

export default class TouchableButton extends Component {

	props: Props;

	constructor(props: Props) {
		super(props);
	}
	render() {
		return (
			<Text style={[styles.button, this.props.style]} onPress={this.props.onPress} >
				{this.props.text ? this.props.text : null}
			</Text>
		);
	}

}

const styles = StyleSheet.create({
	button: {
		backgroundColor: Theme.Core.btnPrimaryBg,
		color: '#ffffff',

		height: 50,
		width: 180,
		borderRadius: 50,
		minWidth: 100,

		textAlign: 'center',
		textAlignVertical: 'center',
	},
});


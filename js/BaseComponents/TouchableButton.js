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
import { TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import Text from './Text';
import StyleSheet from 'StyleSheet';
import Theme from 'Theme';

type Props = {
	style: Object | number | Array<any>,
	labelStyle?: Object | number | Array<any>,
	text: string | Object,
	onPress?: () => void,
	intl: intlShape.isRequired,
	postScript?: any,
	preScript?: any,
};

class TouchableButton extends Component {

	onPress: () => void;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);
	}

	onPress = () => {
		let {onPress} = this.props;
		if (onPress) {
			if (typeof onPress === 'function') {
				onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	render(): Object {
		let { style, labelStyle, intl, text, preScript, postScript} = this.props;
		let label = typeof text === 'string' ? text : intl.formatMessage(text);

		return (
			<TouchableOpacity style={[styles.buttonContainer, style]} onPress={this.onPress}>
				<View style={styles.button}>
					<Text style={[styles.label, labelStyle]}>
						{preScript}{label.toUpperCase()}{postScript}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}

}

const styles = StyleSheet.create({
	buttonContainer: {
		backgroundColor: Theme.Core.btnPrimaryBg,
		height: 50,
		width: 180,
		borderRadius: 50,
		minWidth: 100,
		alignSelf: 'center',
	},
	button: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		color: '#ffffff',

		textAlign: 'center',
		textAlignVertical: 'center',
	},
});

export default injectIntl(TouchableButton);

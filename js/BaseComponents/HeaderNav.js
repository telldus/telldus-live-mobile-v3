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

import React, {Component} from 'react';
import {TouchableOpacity, Dimensions, StyleSheet} from 'react-native';

const deviceHeight = Dimensions.get('window').height;

type Props = {
	/**
	*  @onPressParam will be received as first argument
	*  for function passed as @onPress.(A work around to call onPress function
	*  with some argument/data by not using Arrow Function.)
	*/
	onPressParam?: any,
	onPress?: (onPressParam?: any) => void,
	style?: Object,
	children?: any,
};

export default class HeaderNav extends Component<Props, null> {
	props: Props;

	onPress: () => void;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		let {onPress, onPressParam} = this.props;
		if (onPress) {
			if (typeof onPress === 'function') {
				let param = onPressParam ? onPressParam : null;
				onPress(param);
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	render(): Object {
		let {style} = this.props;
		return (
			<TouchableOpacity
				onPress={this.onPress}
				style={[styles.container, style]}
			>
				{this.props.children}
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: deviceHeight * 0.1,
		width: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

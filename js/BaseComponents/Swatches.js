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
import { TouchableOpacity, StyleSheet } from 'react-native';
import Base from './Base';
import Theme from '../App/Theme';

type Props = {
    swatch: string,

    onPress: (string) => void,
    style: Array<any> | Object | number,
};

export default class Swatches extends Base {
    props: Props;

	onPress: () => void;
	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		const { onPress, swatch } = this.props;
		if (onPress) {
			onPress(swatch);
		}
	}

	render(): React$Element<any> {
		const { style } = this.props;
		return (
			<TouchableOpacity style={[styles.defStyle, style]} onPress={this.onPress}/>
		);
	}
}

const styles = StyleSheet.create({
	defStyle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Theme.Core.inactiveSwitchBackground,
	},
});

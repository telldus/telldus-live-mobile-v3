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
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

import { View } from 'BaseComponents';

type Props = {
	item: string,
	onPress: Function,
	appLayout: Object,
}

export default class ListRow extends View {
	onPress:() => void;

	props: Props;
	constructor(props: Props) {
		super(props);

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		if (this.props.onPress) {
			this.props.onPress(this.props.item);
		}
	}

	render() {
		let { appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<TouchableOpacity onPress={this.onPress}>
				<View style={styles.rowItems}>
					<Text style={styles.text}>{this.props.item}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const width = appLayout.width;

		return {
			rowItems: {
				width: width,
				height: 50,
				backgroundColor: '#ffffff',
				marginTop: 2,
				justifyContent: 'center',
			},
			text: {
				marginLeft: 10,
				color: '#A59F9A',
			},
		};
	}
}


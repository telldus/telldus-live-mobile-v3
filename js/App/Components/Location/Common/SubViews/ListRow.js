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

import {
	View,
	TouchableOpacity,
	Text,
} from '../../../../../BaseComponents';

type Props = {
	item: string,
	onPress: Function,
	appLayout: Object,
};

export default class ListRow extends View {
	onPress: () => void;

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

	render(): Object {
		let { appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<TouchableOpacity
				level={2}
				onPress={this.onPress}>
				<View
					level={2}
					style={styles.rowItems}>
					<Text
						level={6}
						style={styles.text}
						allowFontScaling={false}>{this.props.item}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSize = deviceWidth * 0.035;

		return {
			rowItems: {
				width: width,
				marginTop: 2,
				justifyContent: 'center',
			},
			text: {
				fontSize,
				marginLeft: 10 + (fontSize * 0.2),
				paddingVertical: 10 + (fontSize * 0.2),
			},
		};
	}
}


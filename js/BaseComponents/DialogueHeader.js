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
import { ImageBackground, StyleSheet } from 'react-native';

import Text from './Text';
import Icon from './Icon';

type Props = {
    headerText: string,
    headerStyle: number | Object | Array<Object>,
    textStyle: number | Object | Array<Object>,
    source: number,
    onPressIcon?: () => void;
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
    iconColor?: string,
};

type defaultProps = {
    source: number,
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
    iconColor?: string,
};

export default class DialogueHeader extends Component<Props, null> {
props: Props;
static defaultProps: defaultProps = {
	source: require('./img/telldus-geometric-header-bg.png'),
	showIcon: false,
	iconName: 'times-circle',
	iconSize: 12,
	iconColor: '#fff',
}

onPress: () => void;

constructor(props: Props) {
	super();

	this.onPress = this.onPress.bind(this);
}

onPress() {
	let { onPressIcon } = this.props;
	if (onPressIcon) {
		onPressIcon();
	}
}

render(): Object {
	let { headerText, headerStyle, textStyle, showIcon, iconName, iconSize, iconColor } = this.props;

	return (
		<ImageBackground style={[styles.header, headerStyle]} source={this.props.source}>
			<Text style={[styles.text, textStyle]}>
				{headerText}
			</Text>
			{showIcon && (
				<Icon name={iconName} size={iconSize} color={iconColor} onPress={this.onPress}/>
			)}
		</ImageBackground>
	);
}
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: undefined,
		width: undefined,
		resizeMode: 'contain',
	},
	text: {
		color: '#fff',
		fontSize: 12,
	},
});

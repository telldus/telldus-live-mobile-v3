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
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

import Text from './Text';
import Icon from './Icon';
import capitalize from '../App/Lib/capitalize';

type Props = {
    headerText: string,
    headerStyle: number | Object | Array<Object>,
    textStyle: number | Object | Array<Object>,
    source: Object | number,
	onPressIcon?: () => void,
	onPressHeader?: () => void,
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
	iconColor?: string,
	shouldCapitalize?: boolean,
};

type defaultProps = {
    source: Object | number,
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
	iconColor?: string,
	shouldCapitalize: boolean,
};

export default class DialogueHeader extends Component<Props, null> {
props: Props;
static defaultProps: defaultProps = {
	source: {uri: 'telldus_geometric_bg'},
	showIcon: false,
	iconName: 'times-circle',
	iconSize: 12,
	iconColor: '#fff',
	shouldCapitalize: true,
}

onPressIcon: () => void;
onPressHeader: () => void;

constructor(props: Props) {
	super();

	this.onPressIcon = this.onPressIcon.bind(this);
	this.onPressHeader = this.onPressHeader.bind(this);
}

onPressIcon() {
	let { onPressIcon } = this.props;
	if (onPressIcon) {
		onPressIcon();
	}
}

onPressHeader() {
	let { onPressHeader } = this.props;
	if (onPressHeader) {
		onPressHeader();
	}
}

render(): Object {
	let {
		headerText,
		headerStyle,
		textStyle,
		showIcon,
		iconName,
		iconSize,
		iconColor,
		shouldCapitalize,
		onPressHeader,
	} = this.props;
	headerText = typeof headerText === 'string' && shouldCapitalize ? capitalize(headerText) : headerText;

	return (
		<ImageBackground style={[styles.image, headerStyle]} source={this.props.source}>
			<TouchableOpacity onPress={this.onPressHeader} disabled={!onPressHeader} style={styles.touchable}>

				<Text style={[styles.text, textStyle]}>
					{headerText}
				</Text>
				{showIcon && (
					<Icon name={iconName} size={iconSize} color={iconColor} onPress={this.onPressIcon}/>
				)}

			</TouchableOpacity>
		</ImageBackground>
	);
}
}

const styles = StyleSheet.create({
	touchable: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	image: {
		height: undefined,
		width: undefined,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	text: {
		color: '#fff',
		fontSize: 12,
	},
});

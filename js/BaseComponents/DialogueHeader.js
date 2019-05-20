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
import { StyleSheet, TouchableOpacity } from 'react-native';

import View from './View';
import Text from './Text';
import Icon from './Icon';
import capitalize from '../App/Lib/capitalize';

import GeometricHeader from './GeometricHeader';

type Props = {
    headerText: string,
    headerStyle: number | Object | Array<Object>,
    textStyle: number | Object | Array<Object>,
	onPressIcon?: () => void,
	onPressHeader?: () => void,
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
	iconColor?: string,
	shouldCapitalize?: boolean,
	headerHeight: number,
	headerWidth: number,
};

type defaultProps = {
    showIcon?: boolean,
    iconName?: string,
    iconSize?: number,
	iconColor?: string,
	shouldCapitalize: boolean,
	headerHeight: number,
	headerWidth: number,
};

export default class DialogueHeader extends Component<Props, null> {
props: Props;
static defaultProps: defaultProps = {
	showIcon: false,
	iconName: 'times-circle',
	iconSize: 12,
	iconColor: '#fff',
	shouldCapitalize: true,
	headerHeight: 20,
	headerWidth: 100,
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
		headerHeight,
		headerWidth,
	} = this.props;
	headerText = typeof headerText === 'string' && shouldCapitalize ? capitalize(headerText) : headerText;

	return (
		<View style={{
			height: headerHeight,
			width: headerWidth,
			overflow: 'hidden',
			borderTopRadius: 5,
			justifyContent: 'center',
			alignItems: 'center',
		}}>
			<GeometricHeader headerHeight={headerHeight} headerWidth={headerWidth}/>
			<TouchableOpacity onPress={this.onPressHeader} disabled={!onPressHeader} style={[styles.touchable, headerStyle]}>

				<Text style={[styles.text, textStyle]}>
					{headerText}
				</Text>
				{showIcon && (
					<Icon name={iconName} size={iconSize} color={iconColor} onPress={this.onPressIcon}/>
				)}

			</TouchableOpacity>
		</View>
	);
}
}

const styles = StyleSheet.create({
	touchable: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
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

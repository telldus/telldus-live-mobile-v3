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

import Text from './Text';
import Icon from './Icon';
import capitalize from '../App/Lib/capitalize';

import GeometricHeader from './GeometricHeader';

type Props = {
    headerText: string,
	textStyle: number | Object | Array<Object>,
	iconStyle?: number | Object | Array<Object>,
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
};

onPressIcon: () => void;
onPressHeader: () => void;

constructor(props: Props) {
	super();

	this.onPressIcon = this.onPressIcon.bind(this);
	this.onPressHeader = this.onPressHeader.bind(this);
}

onPressIcon() {
	let { onPressIcon, onPressHeader } = this.props;
	if (onPressIcon) {
		onPressIcon();
	} else if (onPressHeader) {
		onPressHeader();
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
		textStyle,
		showIcon,
		iconName,
		iconSize,
		iconColor,
		shouldCapitalize,
		onPressHeader,
		headerHeight,
		headerWidth,
		iconStyle,
	} = this.props;
	headerText = typeof headerText === 'string' && shouldCapitalize ? capitalize(headerText) : headerText;

	return (
		<TouchableOpacity style={[{
			height: headerHeight,
			width: headerWidth,
		}, styles.touchableCover]} onPress={this.onPressHeader} disabled={!onPressHeader}>
			<GeometricHeader headerHeight={headerHeight} headerWidth={headerWidth} style={{
				marginTop: -2, // TODO: this is a work around for a very narrow line shown on top
				// of the image. Investigate and give a proper fix.
			}}/>
			<Text style={[styles.text, textStyle]}>
				{headerText}
			</Text>
			{showIcon && (
				<Icon style={[styles.iconStyle, iconStyle]} name={iconName} size={iconSize} color={iconColor} onPress={this.onPressIcon}/>
			)}
		</TouchableOpacity>
	);
}
}

const styles = StyleSheet.create({
	touchableCover: {
		overflow: 'hidden',
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	text: {
		color: '#fff',
		fontSize: 12,
		position: 'absolute',
		alignSelf: 'center',
		left: 5,
		fontWeight: '700',
	},
	iconStyle: {
		position: 'absolute',
		right: 5,
		alignSelf: 'center',
	},
});

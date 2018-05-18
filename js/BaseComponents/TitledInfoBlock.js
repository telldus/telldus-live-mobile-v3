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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';

import Text from './Text';
import View from './View';
import Icon from './Icon';

import { getRelativeDimensions } from '../App/Lib';
import Theme from '../App/Theme';

type Props = {
    title?: string,
    label?: string,
    value?: string | number,
    blockContainerStyle?: number | Array<any> | Object,
    titleTextStyle?: number | Array<any> | Object,
    labelTextStyle?: number | Array<any> | Object,
    valueTextStyle?: number | Array<any> | Object,
	appLayout: Object,
	icon?: string,
	iconSize?: number,
	iconColor?: string,
	iconStyle?: number | Array<any> | Object,
	onPress?: () => void;
};

class TitledInfoBlock extends PureComponent<Props, null> {
props: Props;

onPress: () => void;

constructor(props: Props) {
	super(props);

	this.onPress = this.onPress.bind(this);
}

onPress() {
	let { onPress } = this.props;
	if (onPress) {
		if (typeof onPress === 'function') {
			onPress();
		} else {
			console.warn('Invalid Prop Passed : onPress expects a Function.');
		}
	}
}

render(): Object {
	let { title, label, value, appLayout,
		blockContainerStyle, titleTextStyle,
		labelTextStyle, valueTextStyle, icon,
		iconSize, iconColor, iconStyle, onPress,
	} = this.props;
	let styles = this.getStyles(appLayout);
	iconSize = iconSize ? iconSize : styles.iconSize;

	return (
		<View style={[styles.blockContainer, blockContainerStyle]}>
			{!!title && (
				<Text style={[styles.titleStyle, titleTextStyle]}>
					{title}
				</Text>
			)}
			<TouchableOpacity style={styles.infoCover} onPress={this.onPress} disabled={!onPress}>
				<Text style={[styles.infoLabel, labelTextStyle]}>
					{label}
				</Text>
				<Text style={[ styles.infoValue, valueTextStyle]}>
					{value}
				</Text>
				{!!icon && (
					<Icon name={icon} size={iconSize} color={iconColor} style={[styles.nextIcon, iconStyle]}/>
				)}
			</TouchableOpacity>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		iconSize: Math.floor(deviceWidth * 0.08),
		blockContainer: {
			flex: 0,
			alignItems: 'stretch',
			justifyContent: 'center',
			marginBottom: 10,
		},
		titleStyle: {
			marginBottom: 5,
			color: '#b5b5b5',
			fontSize,
		},
		infoCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			padding: fontSize,
		},
		infoLabel: {
			color: '#000',
			fontSize,
		},
		infoValue: {
			color: '#8e8e93',
			fontSize,
		},
		nextIcon: {
			position: 'absolute',
			right: 10,
		},
	};
}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		appLayout: getRelativeDimensions(store.App.layout),
	};
}

module.exports = connect(mapStateToProps, null)(TitledInfoBlock);

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
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
} from '../../../BaseComponents';

import Theme from '../../Theme';
import IconTelldus from '../../../BaseComponents/IconTelldus';

type Props = {
    appLayout: Object,
    label: string,
    edit: boolean,
    icon: string,
    value: number,
    scale: string,
    unit: string,
    active: boolean,
};

type State = {
};

class ModeBlock extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

render(): Object {

	const {
		label,
		value,
		scale,
		unit,
		icon,
		active,
	} = this.props;

	const {
		cover,
		labelStyle,
		leftBlock,
		brandSecondary,
		brandPrimary,
		controlBlockStyle,
		scaleStyle,
		valueStyle,
		unitStyle,
		iconBlockStyle,
		appBackground,
		editIconStyle,
		textCoverStyle,
		rowTextColor,
		editIconSize,
		iconSize,
		controlIconSize,
	} = this.getStyles();

	const iconBGColor = active ? brandSecondary : appBackground;
	const iconColor = active ? '#fff' : brandSecondary;
	const textColor = active ? brandSecondary : rowTextColor;

	return (
		<View style={cover}>
			<View style={leftBlock}>
				<Text style={[labelStyle, { color: textColor }]}>
					{label.toUpperCase()}
				</Text>
				<View style={controlBlockStyle}>
					<View style={{flex: 0}}>
						<IconTelldus icon="up" size={controlIconSize} color={brandSecondary}/>
						<IconTelldus icon="down" size={controlIconSize} color={brandPrimary}/>
					</View>
					<View style={textCoverStyle}>
						<Text style={[scaleStyle, { color: textColor }]}>
							{scale}
						</Text>
						<Text>
							<Text style={[valueStyle, { color: textColor }]}>
								{value}
							</Text>
							<Text style={[unitStyle, { color: textColor }]}>
								{unit}
							</Text>
						</Text>
					</View>
					<Icon name="edit" size={editIconSize} color={brandSecondary} style={editIconStyle}/>
				</View>
			</View>
			<View style={[iconBlockStyle, {backgroundColor: iconBGColor}]}>
				<IconTelldus icon={icon} size={iconSize} color={iconColor}/>
			</View>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		rowTextColor,
		brandSecondary,
		brandPrimary,
		appBackground,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		cover: {
			...shadow,
			flexDirection: 'row',
			alignItems: 'stretch',
			justifyContent: 'flex-start',
			backgroundColor: appBackground,
			marginTop: padding,
			marginHorizontal: padding,
		},
		leftBlock: {
			flex: 1,
			padding: padding,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			...shadow,
			backgroundColor: '#fff',
		},
		labelStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.05,
			flex: 1,
		},
		brandSecondary,
		brandPrimary,
		appBackground,
		rowTextColor,
		controlBlockStyle: {
			flexDirection: 'row',
			width: deviceWidth * 0.25,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 10,
		},
		textCoverStyle: {
			marginLeft: 5,
		},
		scaleStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.03,
		},
		valueStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.055,
		},
		unitStyle: {
			color: rowTextColor,
			fontSize: deviceWidth * 0.035,
		},
		iconBlockStyle: {
			width: deviceWidth * 0.2,
			alignItems: 'center',
			justifyContent: 'center',
			marginLeft: 1,
			...shadow,
		},
		editIconStyle: {
			marginLeft: 5,
		},
		editIconSize: deviceWidth * 0.045,
		iconSize: deviceWidth * 0.08,
		controlIconSize: deviceWidth * 0.06,
	};
}
}

module.exports = ModeBlock;

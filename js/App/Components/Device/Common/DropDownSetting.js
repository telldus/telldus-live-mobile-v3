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
 */

// @flow

'use strict';
import React from 'react';
import { useSelector } from 'react-redux';
import {
	TouchableOpacity,
} from 'react-native';

import {
	DropDown,
	View,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

const DropDownSetting = (props: Object): Object => {
	const {
		items,
		value,
		onValueChange,
		label,
		labelStyle,
		paramUpdatedViaScan,
		textOnPressHelp,
		headerOnPressHelp,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		fontSize,
		pickerContainerStyle,
		pickerStyle,
		optionInputCover,
		optionInputLabelStyle,
		infoIconStyle,
	} = getStyles(layout, paramUpdatedViaScan);

	const accessibilityLabelPrefix = '';

	const { toggleDialogueBoxState } = useDialogueBox();
	function onPressInfo() {
		if (textOnPressHelp && headerOnPressHelp) {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: textOnPressHelp,
				header: headerOnPressHelp,
				showIconOnHeader: true,
				onPressHeader: () => {
					toggleDialogueBoxState({
						show: false,
					});
				},
			});
		}
	}

	return (
		<View style={optionInputCover}>
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
			}}>
				<Text style={[optionInputLabelStyle, labelStyle]}>
					{label}
				</Text>
				<TouchableOpacity onPress={onPressInfo}>
					<IconTelldus icon={'help'} style={infoIconStyle}/>
				</TouchableOpacity>
			</View>
			<DropDown
				items={items}
				value={value}
				onValueChange={onValueChange}
				appLayout={layout}
				pickerContainerStyle={pickerContainerStyle}
				pickerStyle={pickerStyle}
				baseColor={'#000'}
				fontSize={fontSize}
				accessibilityLabelPrefix={accessibilityLabelPrefix}
				animationDuration={50}/>
		</View>
	);
};

const getStyles = (appLayout: Object, paramUpdatedViaScan: boolean): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		brandSecondary,
	} = Theme.Core;

	const ddWidth = deviceWidth * 0.2;

	const fontSizeText = Math.floor(deviceWidth * 0.04);

	const padding = deviceWidth * paddingFactor;

	return {
		fontSize: fontSizeText,
		pickerStyle: {
			width: ddWidth,
			right: padding,
			left: undefined,
		},
		pickerContainerStyle: {
			flex: 0,
			width: ddWidth,
			elevation: 0,
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			marginBottom: 0,
			borderRadius: 2,
		},
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingLeft: padding,
			borderRadius: 2,
			backgroundColor: '#fff',
			...shadow,
			marginBottom: padding / 2,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText,
			color: '#000',
		},
		infoIconStyle: {
			marginLeft: 3,
			fontSize: fontSizeText,
			color: brandSecondary,
		},
	};
};

export default DropDownSetting;

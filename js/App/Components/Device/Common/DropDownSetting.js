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
import { useIntl } from 'react-intl';

import {
	DropDown,
	View,
	Text,
	IconTelldus,
	Throbber,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import i18n from '../../../Translations/common';

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
		isScanning,
		isSaving433MhzParams,
	} = props;

	const intl = useIntl();
	const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		fontSize,
		pickerContainerStyle,
		pickerStyle,
		optionInputCover,
		optionInputLabelStyle,
		infoIconStyle,
		throbberContainerStyle,
		throbberStyle,
		inactiveTintColor,
		statuscheckStyle,
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

	const _value = isScanning ? `${formatMessage(i18n.scanning)}...  ${value}` : value;

	const iconLeftPickerBase = paramUpdatedViaScan ?
		<IconTelldus
			icon="statuscheck"
			style={statuscheckStyle}/> : undefined;

	return (
		<View
			level={2}
			style={optionInputCover}>
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
			}}>
				<Text
					level={3}
					style={[optionInputLabelStyle, labelStyle]}>
					{label}
				</Text>
				<TouchableOpacity onPress={onPressInfo}>
					<IconTelldus
						level={23}
						icon={'help'}
						style={infoIconStyle}/>
				</TouchableOpacity>
			</View>
			<DropDown
				items={items}
				extraData={{
					isScanning,
					paramUpdatedViaScan,
				}}
				baseLeftIcon={isScanning ?
					<Throbber
						throbberContainerStyle={throbberContainerStyle}
						throbberStyle={throbberStyle}
					/>
					: 'down'}
				value={_value}
				iconLeftPickerBase={iconLeftPickerBase}
				disabled={isScanning || isSaving433MhzParams}
				onValueChange={onValueChange}
				appLayout={layout}
				intl={intl}
				pickerContainerStyle={pickerContainerStyle}
				pickerStyle={pickerStyle}
				baseColor={inactiveTintColor}
				fontSize={fontSize}
				accessibilityLabelPrefix={accessibilityLabelPrefix}
				animationDuration={50}
				pickerBaseTextStyle={{flex: 0}}
				pickerBaseCoverStyle={{
					justifyContent: 'flex-end',
				}}/>
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
		inactiveTintColor,
		locationOnline,
		fontSizeFactorFive,
		fontSizeFactorFour,
	} = Theme.Core;

	const ddWidth = deviceWidth * 0.45;

	const fontSizeText = Math.floor(deviceWidth * fontSizeFactorFour);

	const padding = deviceWidth * paddingFactor;

	const iconValueRightSize = deviceWidth * fontSizeFactorFive;

	return {
		inactiveTintColor,
		fontSize: fontSizeText,
		pickerStyle: {
			width: ddWidth,
			right: padding,
			left: undefined,
			justifyContent: 'flex-end',
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
			alignSelf: 'flex-end',
			justifyContent: 'flex-end',
		},
		optionInputCover: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingLeft: padding,
			borderRadius: 2,
			...shadow,
			marginBottom: padding / 2,
		},
		optionInputLabelStyle: {
			fontSize: fontSizeText,
		},
		infoIconStyle: {
			marginLeft: 3,
			fontSize: fontSizeText,
		},
		throbberContainerStyle: {
			backgroundColor: 'transparent',
			position: 'relative',
		},
		throbberStyle: {
			fontSize: iconValueRightSize * 0.8,
			color: inactiveTintColor,
		},
		statuscheckStyle: {
			fontSize: iconValueRightSize * 0.8,
			color: locationOnline,
			textAlignVertical: 'center',
			marginRight: 5,
		},
	};
};

export default (React.memo<Object>(DropDownSetting): Object);

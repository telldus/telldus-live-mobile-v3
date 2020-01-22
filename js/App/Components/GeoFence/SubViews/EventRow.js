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
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';
import DeviceInfo from 'react-native-device-info';

import {
	Text,
	View,
	ListItem,
	CheckBoxIconText,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const EventRow = (props: Object): Object => {

	const {
		event,
		onToggleCheckBox,
		isChecked,
		checkBoxId,
	} = props;
	const {
		description,
	} = event;

	const { layout } = useSelector((state: Object): Object => state.app);

	const intl = useIntl();

	const {
		row,
		touchableContainer,
		cover,
		nameStyle,
		nameTabletStyle,
		textStyle,
		checkButtonStyle,
		checkIconActiveStyle,
		checkIconInActiveStyle,
	} = getStyles(layout);

	function noOp() {}

	const text = description ? description : intl.formatMessage(i18n.unknown);

	function getNameInfo(): Object {

		let coverStyle = nameStyle;
		if (DeviceInfo.isTablet()) {
			coverStyle = nameTabletStyle;
		}

		return (
			<View style={coverStyle}>
				<Text style = {textStyle} numberOfLines={1}>
					{text}
				</Text>
			</View>
		);
	}

	const nameInfo = getNameInfo();

	function _onToggleCheckBox() {
		onToggleCheckBox(checkBoxId);
	}

	const checkIconStyle = isChecked ? checkIconActiveStyle : checkIconInActiveStyle;

	return (
		<ListItem
			style={row}
			// Fixes issue controlling device in IOS, in accessibility mode
			// By passing onPress to visible content of 'SwipeRow', prevents it from
			// being placed inside a touchable.
			onPress={noOp}
			accessible={false}
			importantForAccessibility={'no-hide-descendants'}>
			<View style={cover}>
				<CheckBoxIconText
					style={checkButtonStyle}
					iconStyle={checkIconStyle}
					onToggleCheckBox={_onToggleCheckBox}
					isChecked={isChecked}
					intl={intl}
				/>
				<View style={touchableContainer}>
					{nameInfo}
				</View>
			</View>
		</ListItem>
	);

};

const getStyles = (appLayout: Object): Object => {
	let { height, width } = appLayout;
	let isPortrait = height > width;
	let deviceWidth = isPortrait ? width : height;

	let {
		rowHeight,
		maxSizeRowTextOne,
		brandSecondary,
		shadow,
		paddingFactor,
		rowTextColor,
	} = Theme.Core;

	let nameFontSize = Math.floor(deviceWidth * 0.047);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	const padding = deviceWidth * paddingFactor;

	return {
		touchableContainer: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		row: {
			marginHorizontal: padding,
			marginTop: padding / 2,
			marginBottom: padding,
			backgroundColor: '#FFFFFF',
			height: rowHeight,
			borderRadius: 2,
			...shadow,
		},
		cover: {
			flex: 1,
			overflow: 'hidden',
			justifyContent: 'space-between',
			paddingLeft: 5,
			alignItems: 'stretch',
			flexDirection: 'row',
			borderRadius: 2,
		},
		nameStyle: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		nameTabletStyle: {
			flex: 1,
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			flexDirection: 'row',
		},
		textStyle: {
			color: rowTextColor,
			fontSize: nameFontSize,
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
		},
		checkButtonStyle: {
			paddingHorizontal: padding,
		},
		checkIconActiveStyle: {
			borderColor: brandSecondary,
			backgroundColor: brandSecondary,
			color: '#fff',
		},
		checkIconInActiveStyle: {
			borderColor: rowTextColor,
			backgroundColor: 'transparent',
			color: 'transparent',
		},
	};
};

export default EventRow;

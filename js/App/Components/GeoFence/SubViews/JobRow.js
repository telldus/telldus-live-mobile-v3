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
	Switch,
} from 'react-native';

import {
	Text,
	View,
	ListItem,
	CheckBoxIconText,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const weekdayStrs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const JobRow = React.memo<Object>((props: Object): Object => {

	const {
		job,
		onChangeSelection,
		isChecked,
		device = {},
		checkBoxId,
		toggleActiveState,
		isLast,
	} = props;
	const {
		name,
	} = device;

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
		textTwoStyle,
		switchStyle,
		switchTextStyle,
	} = getStyles(layout, {
		isLast,
	});

	function noOp() {}

	const deviceName = name ? name : intl.formatMessage(i18n.noName);

	function getNameInfo(): Object {

		let coverStyle = nameStyle;
		if (DeviceInfo.isTablet()) {
			coverStyle = nameTabletStyle;
		}

		let dayStrs = [];
		for (let i = 0; i < job.weekdays.length; i++) {
			dayStrs.push(weekdayStrs[job.weekdays[i] - 1]);
		}
		let daysStr = dayStrs.join(',');

		return (
			<View style={coverStyle}>
				<Text style = {textStyle} numberOfLines={1}>
					{deviceName}
				</Text>
				<Text style = {textTwoStyle} numberOfLines={1}>
					{intl.formatMessage(i18n.atWithValue, {
						value: `${job.hour}:${job.minute} - ${daysStr}`,
					})}
				</Text>
			</View>
		);
	}

	const nameInfo = getNameInfo();

	function _onChangeSelection() {
		onChangeSelection('schedule', checkBoxId, job);
	}

	function _toggleActiveState(active: boolean) {
		toggleActiveState('schedule', checkBoxId, {
			...job,
			active,
		});
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
					onToggleCheckBox={_onChangeSelection}
					isChecked={isChecked}
					intl={intl}
				/>
				<View style={touchableContainer}>
					{nameInfo}
				</View>
				{
					isChecked ? (
						<>
							<Text style={switchTextStyle}>
								{intl.formatMessage(i18n.labelActive)}
							</Text>
							<Switch
								style={switchStyle}
								value={job.active}
								onValueChange={_toggleActiveState}/>
						</>
					) : null
				}
			</View>
		</ListItem>
	);

});

const getStyles = (appLayout: Object, {
	isLast,
}: Object): Object => {
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
			marginBottom: isLast ? padding : 0,
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
			alignItems: 'center',
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
		textTwoStyle: {
			color: rowTextColor,
			fontSize: nameFontSize * 0.8,
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
		switchStyle: {
			marginRight: padding,
		},
		switchTextStyle: {
			color: rowTextColor,
			fontSize: nameFontSize * 0.8,
			textAlignVertical: 'center',
			textAlign: 'right',
			marginRight: 5,
		},
	};
};

export default JobRow;


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

import React, {
	useCallback,
} from 'react';
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
	Switch,
	TimezoneFormattedTime,
} from '../../../../BaseComponents';

import {
	getRepeatDescription,
} from '../../../Lib/scheduleUtils';
import {
	useAppTheme,
} from '../../../Hooks/Theme';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

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
	const {
		weekdays,
		active,
		type,
		effectiveHour,
		effectiveMinute,
	} = job;

	const {
		colors,
	} = useAppTheme();

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
	} = getStyles(layout, {
		isLast,
		colors,
	});

	const noOp = useCallback(() => {}, []);

	const deviceName = name ? name : intl.formatMessage(i18n.noName);

	const getNameInfo = useCallback((): Object => {

		let coverStyle = nameStyle;
		if (DeviceInfo.isTablet()) {
			coverStyle = nameTabletStyle;
		}
		const description = getRepeatDescription({
			type, weekdays, intl,
		});
		const date = `01/01/2017 ${effectiveHour}:${effectiveMinute}`;
		const timestamp = Date.parse(date);

		return (
			<View style={coverStyle}>
				<Text style = {textStyle} numberOfLines={1}>
					{deviceName}
				</Text>
				<Text style = {textTwoStyle} numberOfLines={1}>
					{description}{' '}
					{type === 'time' && (
						<TimezoneFormattedTime
							value={timestamp}
							formattingOptions={{
								hour: 'numeric',
								minute: 'numeric',
							}}
							style={textTwoStyle}
						/>)
					}
				</Text>
			</View>
		);
	}, [deviceName, effectiveHour, effectiveMinute, intl, nameStyle, nameTabletStyle, textStyle, textTwoStyle, type, weekdays]);

	const nameInfo = getNameInfo();

	const _onChangeSelection = useCallback(() => {
		onChangeSelection('schedule', checkBoxId, job);
	}, [checkBoxId, job, onChangeSelection]);

	const _toggleActiveState = useCallback((_active: boolean) => {
		toggleActiveState('schedule', checkBoxId, {
			...job,
			active: _active,
		});
	}, [checkBoxId, job, toggleActiveState]);

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
							<Switch
								style={switchStyle}
								value={active}
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
	colors,
}: Object): Object => {
	let { height, width } = appLayout;
	let isPortrait = height > width;
	let deviceWidth = isPortrait ? width : height;

	let {
		rowHeight,
		maxSizeRowTextOne,
		shadow,
		paddingFactor,
		fontSizeFactorOne,
	} = Theme.Core;

	const {
		inAppBrandSecondary,
		card,
		textSeven,
	} = colors;

	let nameFontSize = Math.floor(deviceWidth * fontSizeFactorOne);
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
			backgroundColor: card,
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
			color: textSeven,
			fontSize: nameFontSize,
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
		},
		textTwoStyle: {
			color: textSeven,
			fontSize: nameFontSize * 0.8,
			textAlignVertical: 'center',
			textAlign: 'left',
			marginHorizontal: padding,
		},
		checkButtonStyle: {
			paddingHorizontal: padding,
		},
		checkIconActiveStyle: {
			borderColor: inAppBrandSecondary,
			backgroundColor: inAppBrandSecondary,
			color: '#fff',
		},
		checkIconInActiveStyle: {
			borderColor: textSeven,
			backgroundColor: 'transparent',
			color: 'transparent',
		},
		switchStyle: {
			marginRight: padding,
		},
	};
};

export default (JobRow: Object);


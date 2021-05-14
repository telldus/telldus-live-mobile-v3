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
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

import Text from './Text';
import IconTelldus from './IconTelldus';
import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

import Theme from '../App/Theme';

import i18n from '../App/Translations/common';

type Props = PropsThemedComponent & {
    style?: Array<any> | Object,
    iconStyle?: Object,
    textStyle?: Array<any> | Object,
    onToggleCheckBox: (?Object) => void,
    isChecked: boolean,
    text?: string,
	intl: Object,
	level?: number,
	onPressData?: Object,
};

const CheckBoxIconText: Object = React.memo<Object>((props: Props): Object => {

	const {
		onToggleCheckBox,
		style,
		iconStyle,
		textStyle,
		text,
		isChecked,
		intl,
		colors,
		level,
		dark,
		onPressData,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	function onPress() {
		if (onToggleCheckBox) {
			onToggleCheckBox(onPressData);
		}
	}

	const {
		checkIconStyleActive,
		checkIconStyleInactive,
		textDefaultStyle,
		checkIconCommon,
		container,
	} = getStyle();

	const checkIconStyle = isChecked ? checkIconStyleActive : checkIconStyleInactive;

	const { formatMessage } = intl;
	const labelOne = formatMessage(i18n.labelCheckbox);
	const labelTwo = isChecked ? formatMessage(i18n.labelCheckboxChecked) : formatMessage(i18n.labelCheckboxUnchecked);
	const accessibilityLabel = `${labelOne} ${text || ''}, ${labelTwo}, ${formatMessage(i18n.labelHintChangeTimeZone)}`;

	return (
		<TouchableOpacity
			onPress={onPress}
			accessibilityLabel={accessibilityLabel}
			style={[container, style]}>
			<IconTelldus icon={'checkmark'} style={{ ...checkIconCommon, ...checkIconStyle, ...iconStyle }}/>
			{!!text && (
				<Text style={[textDefaultStyle, textStyle]}>
					{text}
				</Text>
			)}
		</TouchableOpacity>
	);


	function getStyle(): Object {
		const { height, width } = layout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			checkBoxIconActiveOne,
			checkBoxIconInactiveOne,
			checkBoxIconBGActiveOne,
			checkBoxIconBGInactiveOne,
			checkBoxIconBorderActiveOne,
			checkBoxIconBorderInactiveOne,
			checkBoxTextActiveOne,
			textInsidePoster,
		} = colors;
		let _checkBoxIconActiveOne = checkBoxIconActiveOne,
			_checkBoxIconInactiveOne = checkBoxIconInactiveOne,
			_checkBoxIconBGActiveOne = checkBoxIconBGActiveOne,
			_checkBoxIconBGInactiveOne = checkBoxIconBGInactiveOne,
			_checkBoxIconBorderActiveOne = checkBoxIconBorderActiveOne,
			_checkBoxIconBorderInactiveOne = checkBoxIconBorderInactiveOne,
			_checkBoxTextActiveOne = checkBoxTextActiveOne;
		if (level === 1 && dark) {
			_checkBoxIconActiveOne = checkBoxIconActiveOne;
			_checkBoxIconInactiveOne = checkBoxIconInactiveOne;
			_checkBoxIconBGActiveOne = textInsidePoster;
			_checkBoxIconBGInactiveOne = checkBoxIconBGInactiveOne;
			_checkBoxIconBorderActiveOne = checkBoxIconBorderActiveOne;
			_checkBoxIconBorderInactiveOne = textInsidePoster;
			_checkBoxTextActiveOne = textInsidePoster;
		}

		const {
			fontSizeFactorFive,
			fontSizeFactorTen,
			fontSizeFactorEleven,
		} = Theme.Core;

		const fontSize = Math.floor(deviceWidth * fontSizeFactorTen);
		const fontSizeIcon = Math.floor(deviceWidth * fontSizeFactorEleven);

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				borderTopLeftRadius: 2,
				borderBottomLeftRadius: 2,
				overflow: 'hidden',
			},
			textDefaultStyle: {
				marginLeft: 5 + (fontSize * 0.4),
				fontSize: fontSize,
				color: _checkBoxTextActiveOne,
			},
			checkIconCommon: {
				borderWidth: 1,
				fontSize: fontSizeIcon,
				textAlign: 'center',
				textAlignVertical: 'center',
				padding: fontSizeIcon * fontSizeFactorFive,
				borderRadius: 2,
				overflow: 'hidden',
			},
			checkIconStyleActive: {
				color: _checkBoxIconActiveOne,
				backgroundColor: _checkBoxIconBGActiveOne,
				borderColor: _checkBoxIconBorderActiveOne,
			},
			checkIconStyleInactive: {
				color: _checkBoxIconInactiveOne,
				backgroundColor: _checkBoxIconBGInactiveOne,
				borderColor: _checkBoxIconBorderInactiveOne,
			},
		};
	}
});

CheckBoxIconText.defaultProps = {
	isChecked: false,
};

export default (withTheme(CheckBoxIconText): Object);

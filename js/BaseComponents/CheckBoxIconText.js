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

import Theme from '../App/Theme';
import i18n from '../App/Translations/common';

type Props = {
    style?: Array<any> | Object | number,
    iconStyle?: Object,
    textStyle?: Array<any> | Object | number,
    onToggleCheckBox: () => void,
    isChecked: boolean,
    text?: string,
	intl: Object,
};

const CheckBoxIconText = React.memo<Object>((props: Props): Object => {

	const {
		onToggleCheckBox,
		style,
		iconStyle,
		textStyle,
		text,
		isChecked,
		intl,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	function onPress() {
		if (onToggleCheckBox) {
			onToggleCheckBox();
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

		const fontSize = Math.floor(deviceWidth * 0.035);
		const fontSizeIcon = Math.floor(deviceWidth * 0.038);

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
				color: '#fff',
				fontFamily: Theme.Core.fonts.robotoLight,
			},
			checkIconCommon: {
				borderWidth: 1,
				fontSize: fontSizeIcon,
				textAlign: 'center',
				textAlignVertical: 'center',
				padding: fontSizeIcon * 0.05,
				borderRadius: 2,
				overflow: 'hidden',
			},
			checkIconStyleActive: {
				color: Theme.Core.brandSecondary,
				backgroundColor: '#fff',
				borderColor: Theme.Core.brandSecondary,
			},
			checkIconStyleInactive: {
				color: 'transparent',
				backgroundColor: 'transparent',
				borderColor: '#fff',
			},
		};
	}
});

CheckBoxIconText.defaultProps = {
	isChecked: false,
	checkBoxColor: '#fff',
};

export default CheckBoxIconText;

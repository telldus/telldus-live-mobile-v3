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

import React, {
	memo,
	useCallback,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	CheckBoxIconText,
} from '../../../../BaseComponents';

import {
	useAppTheme,
} from '../../../Hooks/Theme';
import Theme from '../../../Theme';

const BitsetConfSetting = (props: Object): Object => {

	const intl = useIntl();

	const {
		colors,
	} = useAppTheme();
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		checkBoxIconStyle,
		checkBoxTextStyle,
		inAppBrandPrimary,
		containerStyle,
	} = getStyles({
		layout,
		colors,
	});

	const onToggleCheckBox = useCallback((v: string) => {
	}, []);

	const isChecked = false;

	return (
		<CheckBoxIconText
			isChecked={isChecked}
			iconStyle={{...checkBoxIconStyle,
				backgroundColor: isChecked ? inAppBrandPrimary : '#fff',
				color: isChecked ? '#fff' : 'transparent',
			}}
			style={containerStyle}
			textStyle={checkBoxTextStyle}
			onToggleCheckBox={onToggleCheckBox}
			intl={intl}/>
	);
};

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const {
		inAppBrandSecondary,
		inAppBrandPrimary,
	} = colors;

	return {
		inAppBrandPrimary,
		containerStyle: {
			overflow: 'visible',
		},
		checkBoxIconStyle: {
			borderColor: inAppBrandPrimary,
			overflow: 'visible',
		},
		textFieldStyle: {
			flex: 1,
			paddingBottom: 0,
			paddingTop: 0,
			fontSize,
			textAlign: 'right',
			borderBottomWidth: 1,
			borderBottomColor: inAppBrandSecondary,
		},
	};
};

export default (memo<Object>(BitsetConfSetting): Object);

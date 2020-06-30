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
import {
	useColorScheme,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import ThemedColors from '../Theme/ThemedColors';
const DEVICE_THEME_KEY = 'OS';
import i18n from '../Translations/common';

const useAppTheme = (): Object => {
	const colorScheme = useColorScheme();
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		themeInApp,
	} = defaultSettings;
	return React.useMemo((): Object => {
		if (themeInApp === DEVICE_THEME_KEY) {
			return {
				colorScheme,
				dark: colorScheme === 'dark',
				themeInApp,
				...getThemeData(colorScheme),
			};
		}
		return {
			colorScheme,
			dark: false,
			themeInApp,
			...getThemeData(themeInApp),
		};
	}, [
		colorScheme,
		themeInApp,
	]);
};

const getThemeData = (themeInApp: string | null = 'light'): Object => {
	const colors = ThemedColors[themeInApp] || ThemedColors.light;
	return {colors};
};

const useAppThemeOptions = (): Object => {
	const colorScheme = useColorScheme();
	const themes = Object.keys(ThemedColors);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	let options = themes.map((value: string): Object => {
		let label = formatMessage(i18n.themeOption1);
		if (value === 'dark') {
			label = formatMessage(i18n.themeOption2);
		}
		return {
			value,
			label,
			shades: [
				ThemedColors[value].ShadeOne,
				ThemedColors[value].ShadeTwo,
				ThemedColors[value].ShadeThree,
			],
		};
	});
	const value = colorScheme || 'light';
	options.push({
		value: DEVICE_THEME_KEY,
		label: formatMessage(i18n.themeOption3),
		shades: [
			ThemedColors[value].ShadeOne,
			ThemedColors[value].ShadeTwo,
			ThemedColors[value].ShadeThree,
		],
	});
	return {
		options,
		colorScheme,
	};
};

module.exports = {
	useAppTheme,
	useAppThemeOptions,
};

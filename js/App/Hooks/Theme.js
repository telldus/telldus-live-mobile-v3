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
import { CONSTANTS } from 'live-shared-data';
const {
	DEVICE_THEME_KEY,
	DARK_THEME_KEY,
} = CONSTANTS;

import ThemedColorsOne from '../Theme/ThemedColors';
import ThemedColorsTwo from '../Theme/ThemedColorsTwo';
import i18n from '../Translations/common';

import {
	getThemeSetOptions,
} from '../Lib/appUtils';

const getThemedColors = (selectedThemeSet: Object): Object => {
	switch (selectedThemeSet.key) {
		case 1:
			return ThemedColorsOne;
		case 2:
			return ThemedColorsTwo;
		default:
			return ThemedColorsTwo;
	}
};

const getThemeData = (themeInApp: string | null = 'light', ThemedColors: Object): Object => {
	const colors = ThemedColors[themeInApp] || ThemedColors.light;
	return {colors};
};

const useAppTheme = (): Object => {
	const colorScheme = useColorScheme();
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		themeInApp = DEVICE_THEME_KEY,
		selectedThemeSet,
	} = defaultSettings;
	const options = getThemeSetOptions();
	const _selectedThemeSet = (selectedThemeSet && selectedThemeSet.key) ? selectedThemeSet : options[1];
	return React.useMemo((): Object => {
		const ThemedColors = getThemedColors(_selectedThemeSet);
		if (themeInApp === DEVICE_THEME_KEY) {
			return {
				colorScheme,
				dark: colorScheme === DARK_THEME_KEY,
				themeInApp,
				selectedThemeSet: _selectedThemeSet,
				...getThemeData(colorScheme, ThemedColors),
			};
		}
		return {
			colorScheme,
			dark: themeInApp === DARK_THEME_KEY,
			themeInApp,
			selectedThemeSet: _selectedThemeSet,
			...getThemeData(themeInApp, ThemedColors),
		};
	}, [
		colorScheme,
		themeInApp,
		_selectedThemeSet,
	]);
};

const useAppThemeOptions = (): Object => {
	const colorScheme = useColorScheme();

	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		selectedThemeSet,
	} = defaultSettings;
	const optionsTS = getThemeSetOptions();
	const _selectedThemeSet = (selectedThemeSet && selectedThemeSet.key) ? selectedThemeSet : optionsTS[0];
	const ThemedColors = getThemedColors(_selectedThemeSet);
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
		};
	});
	options.push({
		value: DEVICE_THEME_KEY,
		label: formatMessage(i18n.themeOption3),
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

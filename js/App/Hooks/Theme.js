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

import Theme from '../Theme';

const {
	Colors,
} = Theme;

const useAppTheme = (): Object => {
	const colorScheme = useColorScheme();
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		themeInApp,
	} = defaultSettings;
	return React.useMemo((): Object => {
		if (colorScheme === 'dark') {
			return {
				colorScheme,
				dark: true,
				themeInApp,
				...getThemeData(themeInApp),
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

const getThemeData = (themeInApp: string | null = 'Gray'): Object => {
	const colors = Colors[themeInApp] || Colors.Gray;
	return {colors};
};

module.exports = {
	useAppTheme,
};

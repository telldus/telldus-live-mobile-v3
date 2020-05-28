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
	memo,
} from 'react';

import {
	useAppTheme,
} from '../../Hooks/Theme';

export interface PropsThemedComponent {
    themeInApp: string,
	colorScheme?: string,
	colors: Object,
}

const withTheme = (Component: Object): Object => {
	return memo<Object>((props: Object): Object => {
		return (
			<Component
				{...props}
				{...useAppTheme()}/>
		);
	});
};

module.exports = {
	withTheme,
};

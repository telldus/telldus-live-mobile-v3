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
 * @providesModule Actions_App
 */

// @flow

'use strict';

import type { Action } from './Types';

type Duration = 'SHORT' | 'LONG';
type POSITION = 'TOP' | 'CENTER' | 'BOTTOM';

const showToast = (source?: string = '', message?: string, duration?: Duration = 'SHORT', position: POSITION = 'TOP'): Action => ({
	type: 'TOAST_SHOW',
	payload: {
		source,
		message,
		duration,
		position,
	},
});

const hideToast = (): Action => ({
	type: 'TOAST_HIDE',
});

module.exports = {
	showToast,
	hideToast,
};

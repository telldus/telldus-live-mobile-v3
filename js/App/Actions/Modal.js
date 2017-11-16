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
 * @providesModule Actions_Modal
 */

// @flow

'use strict';

import type { Action } from './Types';

const showModal = (data?: any, extras?: any): Action => ({
	type: 'REQUEST_MODAL_OPEN',
	payload: {
		data,
		extras,
	},
});

const hideModal = (data?: any, extras?: any): Action => ({
	type: 'REQUEST_MODAL_CLOSE',
	payload: {
		data,
		extras,
	},
});

const clearData = (): Action => ({
	type: 'REQUEST_MODAL_CLEAR_DATA',
});

module.exports = {
	showModal,
	hideModal,
	clearData,
};

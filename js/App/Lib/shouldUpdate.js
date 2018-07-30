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
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

/**
 * 
 * @param {Object} a : List of objects, Either 'this.props' or 'nextProps'(opp. 'b')
 * @param {Object} b : List of objects, Either 'this.props' or 'nextProps'(opp. 'a')
 * @param {Array<any>} paths : Array of 'keys' in 'a' and 'b' to be checked for equality.
 *
 * (Ideally called from 'shoulComponentUpdate' Method)
 * Function to be used as following: pass in the current and next Props of a component as first two
 * arguments, and third argument, pass the keys to be checked for equality as an array. Returns true when
 * any key's value is changed or else false.
 */
export default function shouldUpdate(a: Object, b: Object, paths: Array<any>): boolean {
	for (let i = 0; i < paths.length; i++) {
		const equals = isEqual(get(a, paths[i]), get(b, paths[i]));
		if (!equals) {
			return true;
		}
	}
	return false;
}

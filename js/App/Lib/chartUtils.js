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

const getTickConfigY = ({
	max1 = {},
	max2 = {},
	min1 = {},
	min2 = {},
	showOne,
	showTwo,
}: Object): Object => {
	let ticksYOne, ticksYTwo;
	const f1 = min1.value === max1.value;
	const f2 = min2.value === max2.value;
	const f3 = min1.value === min2.value;

	if (!showOne && showTwo && f2) {
		// When left is not shown and right axis have single/same value make sure different values are shown for each tick.
		ticksYTwo = [min2.value - 1, min2.value, min2.value + 1];
	} else if (!showTwo && showOne && f1) {
		// When right is not shown and left axis have single/same value make sure different values are shown for each tick.
		ticksYOne = [min1.value - 1, min1.value, min1.value + 1];
	} else if (f1 && f2 && f3) {
	// When both axis have single/same value make sure different values are shown for each tick.
		ticksYOne = [min1.value - 1, min1.value, min1.value + 1];
		ticksYTwo = [min2.value - 1, min2.value, min2.value + 1];
	}

	return {
		ticksYOne,
		ticksYTwo,
	};
};

module.exports = {
	getTickConfigY,
};

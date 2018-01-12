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

module.exports = {
	getDimmerValue: (value: number, isInState: string): number => {
		let newValue = value || 0;
		if (isInState === 'TURNON') {
			return 255;
		}
		if (isInState === 'TURNOFF') {
			return 0;
		}

		newValue = parseInt(newValue, 10);
		return newValue;
	},
	toDimmerValue: (sliderValue: number): number => {
		return Math.round(sliderValue * 255 / 100.0);
	},
	toSliderValue: (dimmerValue: number): number => {
		return Math.round(dimmerValue * 100.0 / 255);
	},
};

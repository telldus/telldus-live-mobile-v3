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

import { DAYS } from '../../Constants';

export const getWeekdays = (): string[] => {
	return DAYS.slice(0, 5);
};

export const getWeekends = (): string[] => {
	return DAYS.slice(5, 8);
};

export const getSelectedDays = (storedSelectedDays: number[]): string[] => {
	const selectedDays: string[] = [];

	for (let i = 0; i < storedSelectedDays.length; i++) {
		selectedDays.push(DAYS[storedSelectedDays[i] - 1]);
	}

	return selectedDays;
};

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
import BackgroundTimer from 'react-native-background-timer';
import {
	Platform,
} from 'react-native';

const platformAppStateIndependentSetTimeout = (callback: Function, timeout: number): any => {
	if (Platform.OS === 'android') {
		return BackgroundTimer.setTimeout(callback, timeout);
	}
	// NOTE[iOS]: Make sure BackgroundTimer.start(); is called exactly once before, calling this method
	// for the setTimeout to work
	return setTimeout(callback, timeout);
};

const platformAppStateIndependentClearTimeout = (timeoutId: any) => {
	if (Platform.OS === 'android') {
		BackgroundTimer.clearTimeout(timeoutId);
	}
	clearTimeout(timeoutId);
};


module.exports = {
	platformAppStateIndependentSetTimeout,
	platformAppStateIndependentClearTimeout,
};

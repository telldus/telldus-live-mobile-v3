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

'use strict';

import type { Action } from '../actions/types';
import DeviceInfo from 'react-native-device-info';

import { Analytics, Hits as GAHits } from 'react-native-google-analytics';
import { googleAnalyticsId } from 'Config';

function track(action: Action): void {

	let clientId = DeviceInfo.getUniqueID();
	let ga = new Analytics(googleAnalyticsId, clientId, 1, DeviceInfo.getUserAgent());

	if (action.type === 'SWITCH_TAB') {
		let screenView = new GAHits.ScreenView(
			'Telldus Live! app',
			action.tab,
			DeviceInfo.getVersion(),
			DeviceInfo.getBundleId()
		);
		ga.send(screenView);
	} else {
		let gaEvent = new GAHits.Event('Action', action.type);
		ga.send(gaEvent);
	}
}

module.exports = track;

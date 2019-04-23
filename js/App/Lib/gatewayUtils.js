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
import Theme from '../Theme';
import i18n from '../Translations/common';

function getControlIconColorLabel(isOnline: boolean, websocketOnline: boolean, supportLocalControl: boolean, formatMessage: Function): Object {
	const { locationOffline, locationOnline, locationNoLiveUpdates } = Theme.Core;

	if (isOnline && websocketOnline) {
		return {
			color: locationOnline,
			label: formatMessage(i18n.online),
		};
	}
	if (supportLocalControl && (!isOnline || !websocketOnline)) {
		return {
			color: locationNoLiveUpdates,
			label: formatMessage(i18n.noLiveUpdates),
		};
	}
	if (!supportLocalControl && isOnline && !websocketOnline) {
		return {
			color: locationNoLiveUpdates,
			label: formatMessage(i18n.noLiveUpdates),
		};
	}

	if (!supportLocalControl && !isOnline && websocketOnline) {
		return {
			color: locationOffline,
			label: formatMessage(i18n.offline),
		};
	}
	if (!supportLocalControl && !isOnline && !websocketOnline) {
		return {
			color: locationOffline,
			label: formatMessage(i18n.offline),
		};
	}
	return {
		color: locationOffline,
		label: formatMessage(i18n.offline),
	};
}

module.exports = {
	getControlIconColorLabel,
};

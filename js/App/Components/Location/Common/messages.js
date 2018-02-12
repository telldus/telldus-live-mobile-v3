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
 *
 */

// @flow

'use strict';

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
	invalidLocationName: {
		id: 'addNewLocation.locationName.invalidLocationName',
		defaultMessage: 'Location name can not be empty',
	},
	headerOneTimeZoneCity: {
		id: 'addNewLocation.timeZoneCity.headerOne',
		defaultMessage: 'Time Zone',
		description: 'Main header for the Select City Screen',
	},
	headerTwoTimeZoneCity: {
		id: 'addNewLocation.timeZoneCity.headerTwo',
		defaultMessage: 'Select City',
		description: 'Secondary header for the Select City Screen',
	},
	headerOneTimeZoneContinent: {
		id: 'addNewLocation.timeZoneContinent.headerOne',
		defaultMessage: 'Time Zone',
		description: 'Main header for the Select Continent Screen',
	},
	headerTwoTimeZoneContinent: {
		id: 'addNewLocation.timeZoneContinent.headerTwo',
		defaultMessage: 'Select Continent',
		description: 'Secondary header for the Select Continent Screen',
	},
	labelPosition: {
		id: 'addNewLocation.position.label',
		defaultMessage: 'Address',
		description: 'Label for the Address field',
	},
	headerOnePosition: {
		id: 'addNewLocation.position.headerOne',
		defaultMessage: 'Position',
		description: 'Main Header for the Position Screen',
	},
	headerTwoPosition: {
		id: 'addNewLocation.position.headerTwo',
		defaultMessage: 'Select geographic position',
		description: 'Secondary Header for the Position Screen',
	},
	confirmDelete: {
		id: 'location.message.confirmDelete',
		defaultMessage: 'Are you sure you want to delete this location? This action will remove all ' +
		'settings for this location.',
		description: 'Confirmation message on deleting location',
	},
	geoPosition: {
		id: 'addNewLocation.geoPosition',
		defaultMessage: 'Geographic Position',
	},
	ip: {
		id: 'location.ip',
		defaultMessage: 'ip',
	},
	software: {
		id: 'location.software',
		defaultMessage: 'Software',
	},
	lat: {
		id: 'location.lat',
		defaultMessage: 'lat',
	},
	long: {
		id: 'location.long',
		defaultMessage: 'long',
	},
	autodetect: {
		id: 'location.autodetect',
		defaultMessage: 'Autodetect',
	},
});

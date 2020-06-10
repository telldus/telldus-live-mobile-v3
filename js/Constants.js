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

module.exports = {
	supportedMethods: 4023,
	methods: {
		1: 'TURNON',
		2: 'TURNOFF',
		4: 'BELL',
		8: 'TOGGLE',
		16: 'DIM',
		32: 'LEARN',
		64: 'EXECUTE',
		128: 'UP',
		256: 'DOWN',
		512: 'STOP',
		1024: 'RGB',
		2048: 'THERMOSTAT',
	},
	states: {
		1: 'On',
		2: 'Off',
		4: 'Bell',
		8: 'Toggle',
		16: 'Dim',
		32: 'Learn',
		64: 'Execute',
		128: 'Up',
		256: 'Down',
		512: 'Stop',
		1024: 'RGB',
		2048: 'Thermostat',
	},
	statusMessage: {
		0: 'Success',
		1: 'Unknown/Fallback',
		2: 'No Reply',
		3: 'Timed Out',
	},
	DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	ticketTopicIds: {
		'LOCAL_CONTROL_TROUBLESHOOT': {
			dev: 15,
			release: 21,
		},
		'GENERAL': {
			dev: 17,
			release: 24,
		},
	},
	GatewayTypes: {
		'tellstick net': 'N1',
		'tellstick net v2': 'N2',
		'tellstick znet lite': 'Z1',
		'tellstick znet lite v2': 'Z2',
		'tellstick v3': 'T3',
	},
	GatewayTransports: {
		'zwave': 'ZW',
		'zigbee': 'ZG',
		'e433': '433',
		'433': '433',
	},
	CAMPAIGNS_URL: 'https://live.telldus.com/profile/campaigns',
};

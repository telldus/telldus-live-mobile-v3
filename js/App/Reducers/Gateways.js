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
import partition from 'lodash/partition';

export function parseGatewaysForListView(gateways: Object = {}): Array<any> {
	const list = gateways.allIds.map((gatewayId: number): Array<any> => gateways.byId[gatewayId]);
	const [NamesBegWithSpecialChars, NamesBegWithText] = partition(list, (gateway: Object): any => {
		let { name } = gateway;
		let specialChars = "~`!#$%^&*+=-_[]\\\';,/{}|\":<>?";
		return name && specialChars.indexOf(name.charAt(0)) !== -1;
	});
	NamesBegWithText.sort((a: Object, b: Object): number => {
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});
	const combinedList = NamesBegWithSpecialChars.concat(NamesBegWithText);
	return combinedList;
}

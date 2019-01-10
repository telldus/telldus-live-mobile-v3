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
import orderBy from 'lodash/orderBy';
import map from 'lodash/map';
import { filterGatewaysWithZWaveSupport } from '../Lib/DeviceUtils';

export function parseGatewaysForListView(gateways: Object = {}, filterZWave?: boolean = false): Array<any> {
	let gatewaysById = gateways.byId;
	if (filterZWave) {
		gatewaysById = filterGatewaysWithZWaveSupport(gateways.byId);
	}
	const list = map(gatewaysById, (item: Object): Array<Object> => gatewaysById[item.id]);
	const orderedList = orderBy(list, [(gateway: Object): any => {
		let { name } = gateway;
		return name ? name.toLowerCase() : null;
	}], ['asc']);
	return orderedList;
}

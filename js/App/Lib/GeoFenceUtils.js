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

function deg2rad(deg: number): number {
	return deg * (Math.PI / 180);
}
const GeoFenceUtils = {
	isActive(fromHr: number, fromMin: number, toHr: number, toMin: number): boolean {
		let tNow = new Date();
		const hr = tNow.getHours();
		const min = tNow.getMinutes();

		if ((fromHr * 60 + fromMin) > (hr * 60 + min)) {
			return false;
		}
		if ((toHr * 60 + toMin) < (hr * 60 + min)) {
			return false;
		}

		return true;
	},
	getRadiusFromRegion(region: Object): number {
		return 111.41284 * Math.cos(deg2rad(region.latitude)) * region.longitudeDelta * 0.45;
	},
	getLngDeltaFromRadius(latitude: number, longitude: number, radius: number): number {
		return radius / (111.41284 * Math.cos(deg2rad(latitude)) * 0.45);
	},
	getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
		let R = 6371; // Radius of the earth in km
		let dLat = deg2rad(lat2 - lat1); // deg2rad below
		let dLon = deg2rad(lon2 - lon1);
		let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
		let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		let d = R * c; // Distance in km
		return d;
	},
};

export default GeoFenceUtils;

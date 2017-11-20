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

export default function getLocationImageUrl(deviceType:string) : string {
	if (deviceType === 'TelldusCenter') {

		return 'icon_location_telldus_center';

	}
	if (deviceType === 'TellStick Net') {

		return 'icon_location_tell_stick_net';

	}
	if (deviceType === 'TellStick Net v2') {

		return 'icon_location_tell_stick_netv2';

	}
	if (deviceType === 'TellStick ZNet Lite') {

		return 'icon_location_tell_stick_z_net_lite';

	}
	if (deviceType === 'TellStick ZNet Lite v2') {

		return 'icon_location_tell_stick_z_net_litev2';

	}
	if (deviceType === 'OtioBox') {

		return 'icon_location_otio_box';

	}
	return 'icon_location_otio_box';
}

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
 * @providesModule GatewayIcons
 */

'use strict';

const gatewayIcons = new Map()
	.set('TelldusCenter', require('./TelldusCenter.png'))
	.set('OtioBox', require('./OtioBox.png'))
	.set('TellStick ZNet Pro', require('./TellStickFika.png'))
	.set('TellStick ZNet Lite', require('./TellStickZNetLitev1.png'))
	.set('TellStick ZNet Lite v2', require('./TellStickZNetLitev2.png'))
	.set('TellStick Net v2', require('./TellStickNetv2.png'))
	.set('TellStick Net', require('./TellStickNetv1.png'))
	.set('TellStick Develop', require('./TellStickDevelop.png'));

const gatewayUnknown = require('./GatewayUnknown.png');

module.exports = {
	get: (gatewayType) => { return gatewayIcons.get(gatewayType) || gatewayUnknown }
}

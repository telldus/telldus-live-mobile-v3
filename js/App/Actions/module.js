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
 * @providesModule Actions
 */

'use strict';

import DeviceActions from './Devices';
import GatewayActions from './Gateways';
import LoginActions from './Login';
import NavigationActions from './Navigation';
import SensorActions from './Sensors';
import WebsocketActions from './Websockets';
import LiveApiActions from './LiveApi';
import TabActions from './Tabs';
import DashboardActions from './Dashboard';
import DimmerActions from './Dimmer';
import JobActions from './Jobs';
import AppStateActions from './AppState';

module.exports = {
	...DeviceActions,
	...GatewayActions,
	...LoginActions,
	...NavigationActions,
	...SensorActions,
	...LiveApiActions,
	...WebsocketActions,
	...TabActions,
	...DashboardActions,
	...DimmerActions,
	...JobActions,
	...AppStateActions,
};

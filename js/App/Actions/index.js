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

import GatewayActions from './Gateways';
import LoginActions from './Login';
import NavigationActions from './Navigation';
import SensorActions from './Sensors';
import DeviceActions from './Devices';
import LiveApiActions from './LiveApi';
import DashboardActions from './Dashboard';
import JobActions from './Jobs';
import AppStateActions from './AppState';
import Schedule from './Schedule';
import AppDataActions from './AppData';
import ModalActions from './Modal';
import WebSocketActions from './Websockets';
import AppActions from './App';
import ScheduleActions from './Schedule';
import UserActions from './User';
import LocalTest from './LocalTest';
import LocalControl from './LocalControl';
import Widget from './Widget';
import AddDevice from './AddDevice';
import * as Fences from './Fences';
import * as Events from './Events';
import * as GeoFence from './GeoFence';
import * as Firebase from './Firebase';
import * as Auth from './Auth';
import * as ThirdParties from './ThirdParties';
import * as WebsocketExtras from './WebsocketExtras';
import * as Event from './Event';

module.exports = {
	...GatewayActions,
	...LoginActions,
	...NavigationActions,
	...SensorActions,
	...DeviceActions,
	...LiveApiActions,
	...DashboardActions,
	...JobActions,
	...AppStateActions,
	...Schedule,
	...AppDataActions,
	...ModalActions,
	...WebSocketActions,
	...AppActions,
	...ScheduleActions,
	...UserActions,
	...LocalTest,
	...LocalControl,
	...Widget,
	...AddDevice,
	...Fences,
	...Events,
	...GeoFence,
	...Firebase,
	...Auth,
	...ThirdParties,
	...WebsocketExtras,
	...Event,
};

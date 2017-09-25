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
 * @providesModule Reducers
 */

// @flow

'use strict';

import { combineReducers } from 'redux';

import Devices from './Devices';
import Gateways from './Gateways';
import Navigation from './Navigation';
import Sensors from './Sensors';
import User from './User';
import Tabs from './Tabs';
import Dashboard from './Dashboard';
import Dimmer from './Dimmer';
import Jobs from './Jobs';
import LiveApi from './LiveApi';
import Websockets from './Websockets';
import Modal from './Modal';
import App from './App';
import Schedule from './Schedule';

module.exports = combineReducers({
	devices: Devices,
	gateways: Gateways,
	navigation: Navigation,
	sensors: Sensors,
	user: User,
	tabs: Tabs,
	dashboard: Dashboard,
	dimmer: Dimmer,
	jobs: Jobs,
	liveApi: LiveApi,
	websockets: Websockets,
	modal: Modal,
	App: App,
	schedule: Schedule,
});

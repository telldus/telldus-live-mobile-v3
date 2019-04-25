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

import { persistCombineReducers } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import { localStorageKey } from '../../Config';

import { migrations } from '../Store';
import Navigation from './Navigation';
import User from './User';
import LiveApi from './LiveApi';
import Modal from './Modal';
import sensorsList from './SensorsList';
import jobsList from './Jobs';
import { reducers } from 'live-shared-data';

const config = {
	key: localStorageKey,
	storage: AsyncStorage,
	blacklist: ['dimmer', 'schedule', 'liveApi', 'navigation', 'modal', 'addDevice'],
	migrate: migrations,
};

module.exports = persistCombineReducers(config, {
	navigation: Navigation,
	user: User,
	liveApi: LiveApi,
	modal: Modal,
	sensorsList,
	...reducers,
	jobsList,
});

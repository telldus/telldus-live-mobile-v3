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

import { persistCombineReducers } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import { localStorageKey } from 'Config';

import Navigation from './Navigation';
import User from './User';
import Tabs from './Tabs';
import LiveApi from './LiveApi';
import Websockets from './Websockets';
import Modal from './Modal';
import { reducers } from 'live-shared-data';

const config = {
	key: localStorageKey,
	storage: AsyncStorage,
};

module.exports = persistCombineReducers(config, {
	navigation: Navigation,
	user: User,
	tabs: Tabs,
	liveApi: LiveApi,
	websockets: Websockets,
	modal: Modal,
	...reducers,
});

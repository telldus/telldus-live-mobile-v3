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

'use strict';

import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import promise from './Promise';
import array from './Array';
import analytics from './Analytics';
import reducers from 'Reducers';
import createLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native';

let isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

let logger = createLogger({
	predicate: (getState, action) => isDebuggingInChrome,
	collapsed: true,
	duration: true,
});

let createTheStore = applyMiddleware(thunk, promise, array, analytics, logger)(createStore);

let _store;
export function configureStore(onComplete: ?() => void) {
	const store = autoRehydrate()(createTheStore)(reducers);
	persistStore(store, {storage: AsyncStorage}, onComplete);
	if (isDebuggingInChrome) {
		window.store = store;
	}
	_store = store; // TODO: fix this ugly stuff
	return store;
}
export function getStore() { return _store; }

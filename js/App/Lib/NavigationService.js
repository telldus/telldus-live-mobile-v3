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

'use strict';

import { NavigationActions } from 'react-navigation';

let _navigator;

// Do not use this, as it is already used and the root navigator reference is already set.
function setTopLevelNavigator(navigatorRef: any) {
	_navigator = navigatorRef;
}

/**
 *
 * @param {*} routeName : The route name to navigate to. Must have already added to(/registered at) the navigator route configs.
 * @param {*} params : Any extra parameters need to be added, which can be accessed as 'navigation.state.params'.
 *
 * Use this method inside any component that does not have the 'navigation' property, where you want to navigate to any registered
 * screen/route.
 */
function navigate(routeName: string, params: Object) {
	_navigator.dispatch(
		NavigationActions.navigate({
			routeName,
			params,
		})
	);
}

module.exports = {
	navigate,
	setTopLevelNavigator,
};

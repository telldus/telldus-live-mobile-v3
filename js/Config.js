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
 * @providesModule Config
 */

'use strict';

import localConfig from '../config.local.js';
import Constants from './Constants.js';

/**
 * Create a file in the root of the project called 'config.local.js'
 * with the contents of the script and fill with the valid keys.
 *
 * // Example Script
 * module.exports = {
 * 	key1: value1,
 * 	key2: value2,
 * 	...
 * };
 *
 * // Valid keys
 * version: string - App version
 * apiServer: string - Telldus API server url e.g. https://api.telldus.com
 * publicKey: string - Telldus API public key
 * privateKey: string - Telldus API public key
 * googleAnalyticsId: string - Google Analytics Id
 * testUsername: string - Used as a default username at login
 * testPassword: string - Used as a default passwod at login
 */

const config = Object.assign({
	authenticationTimeOut: 5 * 1000, // 5 secs
	telldusLiveWebAuthenticationUrl: 'https://login.telldus.com/user/register',
}, localConfig, Constants);

module.exports = config;

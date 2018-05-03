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
import { Platform } from 'react-native';
import { RSA } from 'react-native-rsa-native';
import SInfo from 'react-native-sensitive-info';

/**
 * Fetches RSA key if present in the local, if not and if @generate is not set to 'false' then generates one.
 * @generate : boolean value that decides if keys has to be generated if not present in local.
 * default value is true
 * @onSuccess : callback function that will be called with resultant public and private keys
 * as an Object, in PEM format as first argument.
 */
function getRSAKey(generate: boolean = true, onSuccess: (Object) => void): any {
	SInfo.getAllItems({
		sharedPreferencesName: 'TelldusSharedPrefs',
		keychainService: 'TelldusKeychain'}).then((values: any) => {
		if (Platform.OS === 'android') {
			let { pemPub: pemPubS, pemPvt: pemPvtS } = values;
			if (pemPubS && pemPvtS) {
				onSuccess({pemPub: pemPubS, pemPvt: pemPvtS});
			} else if (generate) {
				generateAndStoreRSAKey(({ pemPub, pemPvt }: Object) => {
					onSuccess({pemPub, pemPvt});
				});
			} else {
				onSuccess({pemPub: null, pemPvt: null});
			}
		} else {
			let keys = values[0];
			if (keys && keys.length >= 2) {
				let data = {};
				keys.map((key: Object) => {
					if (key.key === 'pemPub') {
						data.pemPub = key.value;
					}
					if (key.key === 'pemPvt') {
						data.pemPvt = key.value;
					}
				});
				onSuccess(data);
			} else if (generate) {
				generateAndStoreRSAKey(({ pemPub, pemPvt }: Object) => {
					onSuccess({pemPub, pemPvt});
				});
			} else {
				onSuccess({pemPub: null, pemPvt: null});
			}
		}
	});
}

function generateAndStoreRSAKey(onSuccess: (Object) => void) {
	RSA.generateKeys(2048) // set key size
		.then((keypair: Object) => {
			const { public: pemPub, private: pemPvt } = keypair;
			if (pemPub && pemPvt) {
				SInfo.setItem('pemPub', pemPub, {
					sharedPreferencesName: 'TelldusSharedPrefs',
					keychainService: 'TelldusKeychain',
				});
				SInfo.setItem('pemPvt', pemPvt, {
					sharedPreferencesName: 'TelldusSharedPrefs',
					keychainService: 'TelldusKeychain',
				});
				onSuccess({pemPub, pemPvt});
			} else {
				onSuccess({pemPub: null, pemPvt: null});
			}
		});
}

module.exports = {
	getRSAKey,
	generateAndStoreRSAKey,
};

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
import SInfo from 'react-native-sensitive-info';
const forge = require('node-forge');

import { supportRSA } from './appUtils';
const { RSA } = supportRSA() ? require('react-native-rsa-native') : {};// iOS 10 and above is required to use react-native-rsa-native.

/**
 * Fetches RSA key if present in the local, if not and if @generate is not set to 'false' then generates one.
 * @generate : boolean value that decides if keys has to be generated if not present in local.
 * default value is true
 * @onSuccess : callback function that will be called with resultant public and private keys
 * as an Object, in PEM format as first argument.
 */
function getRSAKey(generate: boolean = true, onSuccess: (Object) => void): any {
	if (supportRSA()) {
		SInfo.getAllItems({
			sharedPreferencesName: 'TelldusSharedPrefs',
			keychainService: 'TelldusKeychain'}).then((values: any) => {
			let keys = values[0];
			if (keys && keys.length >= 2) {
				if (onSuccess) {
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
				}
			} else if (generate) {
				generateAndStoreRSAKey(({ pemPub, pemPvt }: Object) => {
					if (onSuccess) {
						onSuccess({pemPub, pemPvt});
					}
				});
			} else if (onSuccess) {
				onSuccess({pemPub: null, pemPvt: null});
			}
		});
	}
}

function generateAndStoreRSAKey(onSuccess: (Object) => void) {
	if (RSA) {
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
					if (onSuccess) {
						onSuccess({pemPub, pemPvt});
					}
				} else if (onSuccess) {
					onSuccess({pemPub: null, pemPvt: null});
				}
			});
	}
}

function decryptLocalControlToken(encrypted: string, onSuccess: (string) => void) {
	if (supportRSA()) {
		getRSAKey(false, ({ pemPvt }: Object) => {
			const privateKey = forge.pki.privateKeyFromPem(pemPvt);
			const decoded64 = forge.util.decode64(encrypted);
			const token = privateKey.decrypt(decoded64, 'RSA-OAEP', {
				md: forge.md.sha256.create(),
			});
			onSuccess(token);
		});
	}
}

module.exports = {
	getRSAKey,
	generateAndStoreRSAKey,
	decryptLocalControlToken,
};

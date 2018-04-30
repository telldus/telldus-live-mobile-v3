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
const forge = require('node-forge');
import SInfo from 'react-native-sensitive-info';

/**
 * Fetches RSA key if present in the local, if not generates one.
 * @onSuccess : callback function that will be called with resultant public and private keys
 * as an Object, in PEM format as first argument.
 */
function getRSAKey(onSuccess: (Object) => void): any {
	SInfo.getAllItems({
		sharedPreferencesName: 'TelldusSharedPrefs',
		keychainService: 'TelldusKeychain'}).then((values: any) => {
		let keys = values[0];
		if (keys && keys.length >= 2) {
			const data = {};
			keys.map((key: Object) => {
				if (key.key === 'pemPub') {
					data.pemPub = key.value;
				}
				if (key.key === 'pemPvt') {
					data.pemPvt = key.value;
				}
			});
			onSuccess(data);
		} else {
			generateAndStoreRSAKey(({ pemPub, pemPvt }: Object) => {
				onSuccess({pemPub, pemPvt});
			});
		}
	});
}

function generateAndStoreRSAKey(onSuccess: (Object) => void) {
	const rsa = forge.pki.rsa;
	rsa.generateKeyPair({bits: 2048, workers: 2}, (err: any, keypair: Object) => {
		if (!err && keypair.publicKey && keypair.privateKey) {
			const pemPub = forge.pki.publicKeyToPem(keypair.publicKey);
			const pemPvt = forge.pki.privateKeyToPem(keypair.privateKey);
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

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
import { Platform, Alert } from 'react-native';

import {
	purchaseErrorListener,
	purchaseUpdatedListener,
	type ProductPurchase,
	type PurchaseError,
	type InAppPurchase,
	type SubscriptionPurchase,
} from 'react-native-iap';

import { useDispatch } from 'react-redux';

import {
	reportIapAtServer,
	updateStatusIAPTransaction,
} from '../Actions/User';

const withInAppPurchaseListeners = ({
	successCallback,
	errorCallback,
}: {successCallback?: Function, errorCallback?: Function}): Object => {

	const isIos = Platform.OS === 'ios';

	let purchaseUpdateSubscription, purchaseErrorSubscription;
	if (isIos) {
		purchaseUpdateSubscription = purchaseUpdatedListener((purchase: InAppPurchase | SubscriptionPurchase | ProductPurchase ) => {
			Alert.alert('TEST purchase listener: ', JSON.stringify(purchase));
			const receipt = purchase.transactionReceipt;
			if (receipt) {
				if (successCallback) {
					successCallback(purchase);
				}
			}
		});

		purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
			Alert.alert('TEST purchase error listener: ', JSON.stringify(error));
			if (errorCallback) {
				errorCallback(error);
			}
		});
	}

	return {
		clearListeners: () => {
			if (purchaseUpdateSubscription) {
				purchaseUpdateSubscription.remove();
				purchaseUpdateSubscription = null;
			}
			if (purchaseErrorSubscription) {
				purchaseErrorSubscription.remove();
				purchaseErrorSubscription = null;
			}
		},
	};
};

const useIAPSuccessFailureHandle = (): Object => {

	const dispatch = useDispatch();

	async function successCallback(purchaseInfo: Object): Promise<any> {
		return dispatch(reportIapAtServer(purchaseInfo)).then((response: Object): Object => {
			dispatch(updateStatusIAPTransaction({
				onGoing: false,
			}));
			Alert.alert('TEST reportIapAtServer success: ', JSON.stringify(response));
			return response;
		}).catch((err: Object) => {
			dispatch(updateStatusIAPTransaction({
				onGoing: false,
			}));
			Alert.alert('TEST reportIapAtServer Error: ', err.message || JSON.stringify(err));
			throw err;
		});
	}

	function errorCallback(purchaseErr: Object) {
		dispatch(updateStatusIAPTransaction({
			onGoing: false,
		}));
	}

	return {
		successCallback,
		errorCallback,
	};
};

module.exports = {
	withInAppPurchaseListeners,
	useIAPSuccessFailureHandle,
};

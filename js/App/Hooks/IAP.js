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

import RNIap, {
	purchaseErrorListener,
	purchaseUpdatedListener,
	type ProductPurchase,
	type PurchaseError,
	type InAppPurchase,
	type SubscriptionPurchase,
} from 'react-native-iap';

import { useDispatch } from 'react-redux';

import {
	createTransaction,
	updateStatusIAPTransaction,
} from '../Actions/User';

const useInAppPurchaseListeners = ({
	successCallback,
	errorCallback,
}: {successCallback?: Function, errorCallback?: Function}): Object => {
	let purchaseUpdateSubscription = purchaseUpdatedListener((purchase: InAppPurchase | SubscriptionPurchase | ProductPurchase ) => {
		console.log('TEST purchaseUpdatedListener', purchase);
		const receipt = purchase.transactionReceipt;
		if (receipt) {
			if (successCallback) {
				successCallback(purchase);
			}
		}
	});

	let purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
		console.log('TEST purchaseErrorListener N', error);
		if (errorCallback) {
			errorCallback(error);
		}
	});

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

const withIAPSuccessFailureHandle = (): Object => {

	const dispatch = useDispatch();

	async function successCallback(purchaseInfo: Object): Promise<any> {
		return dispatch(createTransaction({
			purchaseInfo: JSON.stringify(purchaseInfo),
			paymentProvider: 'apple',
		}, true)).then((response: Object): Object => {
			if (response && response.status && response.status === 'success') {
				try {
					// Tell the store that you have delivered what has been paid for.
					// Failure to do this will result in the purchase being refunded on Android and
					// the purchase event will reappear on every relaunch of the app until you succeed
					// in doing the below. It will also be impossible for the user to purchase consumables
					// again untill you do this.
					RNIap.finishTransactionIOS(purchaseInfo.transactionId);
				} catch (err) {
					// Ignore
				} finally {
					RNIap.finishTransaction(purchaseInfo, false);
					dispatch(updateStatusIAPTransaction({
						onGoing: false,
					}));
					return response;
				}
			}
			dispatch(updateStatusIAPTransaction({
				onGoing: false,
			}));
			RNIap.finishTransaction(purchaseInfo, false);
			return response;
		}).catch((err: Object) => {
			RNIap.finishTransaction(purchaseInfo, false);
			dispatch(updateStatusIAPTransaction({
				onGoing: false,
			}));
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
	useInAppPurchaseListeners,
	withIAPSuccessFailureHandle,
};

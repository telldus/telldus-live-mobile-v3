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

import React, {
	useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';

import {
	View,
	NavigationHeader,
} from '../../../BaseComponents';

import {
	getUserProfile,
} from '../../Actions/Login';

const TransactionWebview = (props: Object): Object => {
	const { navigation, route } = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
	} = getStyles(layout);

	const { params = {} } = route;
	const {
		uri = '',
	} = params;

	const dispatch = useDispatch();
	const onShouldStartLoadWithRequest = useCallback((request: Object): boolean => {
		if (request.url.includes('telldus-live-mobile-common')) {
			navigation.navigate('PostPurchaseScreen', {
				...params,
				success: request.url.includes('status=success'),
			});
			dispatch(getUserProfile());
			return false;
		}
		return true;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	return (
		<View
			level={3}
			style={container}>
			<NavigationHeader
				navigation={navigation}
				showLeftIcon={true}/>
			<WebView
				source={{ uri }}
				onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {

	return {
		container: {
			flex: 1,
		},
	};
};
export default (React.memo<Object>(TransactionWebview): Object);

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

import React from 'react';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';

import {
	View,
	NavigationHeader,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const TransactionWebview = (props: Object): Object => {
	const { navigation } = props;

	const { app: {layout} } = useSelector((state: Object): Object => state);
	const {
		container,
	} = getStyles(layout);

	const uri = navigation.getParam('uri', '');
	return (
		<View style={container}>
			<NavigationHeader
				navigation={navigation}
				showLeftIcon={true}/>
			<WebView
				source={{ uri }}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
	};
};
export default TransactionWebview;

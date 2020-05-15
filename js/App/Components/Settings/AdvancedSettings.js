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

import React, {
	memo,
} from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	NavigationHeader,
	PosterWithText,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

const AdvancedSettings = memo<Object>((props: Props): Object => {

	const {
		navigation,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	return (
		<View style={{
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled
				keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<PosterWithText
						appLayout={layout}
						align={'center'}
						h2={'Advanced settings'}
						navigation={navigation}/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
});

export default AdvancedSettings;

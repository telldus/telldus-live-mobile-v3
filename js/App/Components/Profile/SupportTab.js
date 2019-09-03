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
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	Text,
	TabBar,
} from '../../../BaseComponents';
import Theme from '../../Theme';

const SupportTab = (props: Object): Object => {
	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		container,
		body,
	} = getStyles(layout);

	return (
		<ScrollView style={container}>
			<View style={body}>
				<Text>
                Support Tab
				</Text>
			</View>
		</ScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 1,
			padding,
		},
	};
};

SupportTab.navigationOptions = ({ navigation }: Object): Object => ({
	tabBarLabel: ({ tintColor }: Object): Object => (
		<TabBar
			icon="help"
			tintColor={tintColor}
			label={'Support'} // TODO: translate
			accessibilityLabel={'customer support tab'}/>
	),
	tabBarOnPress: ({scene, jumpToIndex}: Object) => {
		navigation.navigate({
			routeName: 'SupportTab',
			key: 'SupportTab',
		});
	},
});

export default SupportTab;

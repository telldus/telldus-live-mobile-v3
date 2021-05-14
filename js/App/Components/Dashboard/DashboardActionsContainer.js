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
	useState,
	useCallback,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
} from '../../../BaseComponents';

type Props = {
    navigation: Object,
    screenProps: Object,
    children: Object,
    route: Object,
};

const DashboardActionsContainer = memo<Object>((props: Props): Object => {

	const {
		navigation,
		screenProps,
		children,
		route,
	} = props;

	const [ posterInfo, setPosterInfo ] = useState({});
	const { screen: currentScreen } = useSelector((state: Object): Object => state.navigation);

	const onChildDidMount = useCallback((h1: string, h2: string, infoButton?: Object | null = null) => {
		setPosterInfo({
			h1,
			h2,
			infoButton,
		});
	}, []);

	const backIconScreens = [
		'SelectItemsScreen',
		'SelectScaleScreen',
		'SetCoordinates',
		'SelectWeatherAttributes',
		'SelectWeatherForecastDay',
		'SetNameMetWeather',
	];
	const leftIcon = backIconScreens.indexOf(currentScreen) !== -1 ? undefined : 'close';

	return (
		<View
			level={3}
			style={{
				flex: 1,
			}}>
			<NavigationHeaderPoster
				h1={posterInfo.h1}
				h2={posterInfo.h2}
				align={'left'}
				navigation={navigation}
				showLeftIcon={true}
				leftIcon={leftIcon}
				{...screenProps}/>
			{React.cloneElement(
				children,
				{
					onDidMount: onChildDidMount,
					...screenProps,
					currentScreen,
					navigation,
					route,
				},
			)}
		</View>
	);
});

export default (DashboardActionsContainer: Object);

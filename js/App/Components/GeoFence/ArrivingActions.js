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

import React, { useEffect } from 'react';
import {
	View,
	FloatingButton,
} from '../../../BaseComponents';
import Actions from './Actions';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const ArrivingActions = (props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	useEffect(() => {
		onDidMount('2. Arriving actions', 'Select actions for when you arrive');
	}, []);

	function onPressNext() {
		navigation.navigate({
			routeName: 'LeavingActions',
			key: 'LeavingActions',
		});
	}

	const {
		container,
	} = getStyles(appLayout);

	return (
		<View style={container}>
			<Actions
				navigation={navigation}/>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}
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

export default ArrivingActions;

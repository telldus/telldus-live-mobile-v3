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

import React from 'react';
import {
	View,
	Text,
	FloatingButton,
} from '../../../BaseComponents';

type Props = {
    navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const AddEditGeoFence = (props: Props): Object => {
	const {
		navigation,
		appLayout,
	} = props;

	function onPressNext() {
		navigation.navigate({
			routeName: 'SelectArea',
			key: 'SelectArea',
		});
	}

	const {
		container,
	} = getStyles(appLayout);

	return (
		<View style={container}>
			<Text>
            AddEditGeoFence
			</Text>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}
			/>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	// const { height, width } = appLayout;
	// const isPortrait = height > width;
	// const deviceWidth = isPortrait ? width : height;

	return {
		container: {
			flex: 1,
		},
	};
};

export default AddEditGeoFence;

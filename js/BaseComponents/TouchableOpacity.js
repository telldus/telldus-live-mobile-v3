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
	useCallback,
} from 'react';
import { TouchableOpacity } from 'react-native';
import {
	prepareRootPropsView,
} from './prepareRootProps';

import {
	withTheme,
} from '../App/Components/HOC/withTheme';

const TouchableOpacityComponent = memo<Object>((props: Object): Object => {
	const {
		children,
		onPress,
		onPressData,
		...others
	} = props;

	const _onPress = useCallback(() => {
		if (onPress) {
			onPress(onPressData);
		}
	}, [onPress, onPressData]);

	return (
		<TouchableOpacity
			{...prepareRootPropsView(others)}
			onPress={_onPress}>
			{children}
		</TouchableOpacity>
	);
});

export default (withTheme(TouchableOpacityComponent): Object);

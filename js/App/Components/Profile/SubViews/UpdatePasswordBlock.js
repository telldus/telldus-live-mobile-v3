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

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

const UpdatePasswordBlock = (props: Object): Object => {
	const { navigation } = props;

	const { app: {layout}} = useSelector((state: Object): Object => state);

	const {
		fontSize,
		iconStyle,
	} = getStyles(layout);

	function onPress() {
		navigation.navigate({
			routeName: 'UpdatePasswordScreen',
			key: 'UpdatePasswordScreen',
		});
	}

	return (
		<TitledInfoBlock
			label={'Change Password'}
			fontSize={fontSize}
			icon={'angle-right'}
			onPress={onPress}
			iconStyle={iconStyle}
		/>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		fontSize,
		iconStyle: {
			color: '#8e8e93',
		},
	};
};

export default UpdatePasswordBlock;

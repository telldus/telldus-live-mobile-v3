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
import {
	useSelector,
} from 'react-redux';

import {
	FloatingButton,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const MyLocation = React.memo<Object>((props: Object): Object => {

	const {
		onPress,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		iconSize,
		iconStyle,
		buttonStyle,
	} = getStyles(layout);

	return (
		<FloatingButton
			buttonStyle={buttonStyle}
			onPress={onPress}
			customComponent={<ThemedMaterialIcon
				name={'my-location'}
				size={iconSize}
				level={12}
				style={iconStyle}/>}/>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		maxSizeFloatingButton,
	} = Theme.Core;

	let buttonSize = deviceWidth * 0.08;
	buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;

	const offsetBottom = (deviceWidth * 0.046666667) + (buttonSize * 2) + 10;

	return {
		iconSize: buttonSize,
		buttonStyle: {
			bottom: offsetBottom,
		},
		iconStyle: {

		},
	};
};

export default MyLocation;

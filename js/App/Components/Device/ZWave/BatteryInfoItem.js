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
	memo,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    label: string,
    value: string,
};

const BatteryInfoItem = memo<Object>((props: Props): Object => {
	const {
		label,
		value,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		horizontalCoverDef,
		hItemLabelDef,
		hItemValueDef,
	} = getStyles({
		layout,
	});

	return (
		<View
			style={horizontalCoverDef}>
			<Text>
				<Text
					level={3}
					style={hItemLabelDef}>
					{label}
				</Text>
				<Text
					level={4}
					style={hItemValueDef}>
					{value}
				</Text>
			</Text>
		</View>
	);
});

const getStyles = ({
	layout,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		horizontalCoverDef: {
			flexDirection: 'row',
			marginTop: padding,
		},
		hItemLabelDef: {
			fontSize,
		},
		hItemValueDef: {
			fontSize,
		},
	};
};

export default BatteryInfoItem;

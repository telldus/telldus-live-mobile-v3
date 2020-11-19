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
	useCallback,
} from 'react';
import {
	useSelector,
} from 'react-redux';

import {
	Text,
	View,
} from '../../../../BaseComponents';

// import ZWaveFunctions from '../../../Lib/ZWaveFunctions';
import Theme from '../../../Theme';

import {
	useManufacturerInfo,
} from '../../../Hooks';

type Props = {
	parameters: Object,
	manufacturerAttributes: Object,
};

const AdvancedConf = (props: Props): Object => {
	console.log('TEST props', props);
	const {
		// parameters,
		manufacturerAttributes,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		verticalCover,
		coverStyle,
		subTitleTextStyle,
		hItemLabelDef,
	} = getStyles(layout);

	const callback = useCallback((info: Object) => {
		console.log('TEST info', info);
	}, []);
	useManufacturerInfo(manufacturerAttributes, callback);

	return (
		<View
			style={verticalCover}>
			<Text
				level={2}
				style={subTitleTextStyle}>
                 Advanced settings
			</Text>
			<View
				level={2}
				style={coverStyle}>
				<Text
					level={3}
					style={hItemLabelDef}>
					 Advanced settings
				</Text>
			</View>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		coverStyle: {
			justifyContent: 'space-between',
			marginTop: 2,
			marginHorizontal: padding,
			borderRadius: 2,
			padding,
			...shadow,
		},
		verticalCover: {
		},
		subTitleTextStyle: {
			fontSize: fontSize * 1.1,
			marginLeft: padding,
			marginTop: 8,
			marginBottom: 5,
		},
		hItemLabelDef: {
			fontSize,
		},
	};
};

export default memo<Object>(AdvancedConf);

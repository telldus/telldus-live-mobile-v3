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
import {
	TouchableOpacity,
	LayoutAnimation,
} from 'react-native';
import React, {
	memo,
	useState,
	useCallback,
} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import {
	LayoutAnimations,
} from '../../../Lib';

const GeoFenceEventsLogRow = (props: Object): Object => {
	const {
		rowCover,
		rowLabel,
		label,
		val,
		rowValue,
	} = props;

	const ignoreExpand = typeof val === 'string';

	const [ expand, setExpand ] = useState(ignoreExpand);

	const toggle = useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		setExpand(!expand);
	}, [expand]);

	return (
		<View style={rowCover}>
			<TouchableOpacity
				onPress={toggle}
				style={{
					flexDirection: 'row',
				}}
			>
				<Text
					level={3}
					style={rowLabel}>
					{label} :
				</Text>
				{!ignoreExpand && <MaterialIcons
					name={expand ? 'expand-less' : 'expand-more'}
					size={22}
					color={Theme.Core.brandSecondary}/>
				}
			</TouchableOpacity>
			{(expand && !!val) && <Text
				level={6}
				style={rowValue}>
				{ignoreExpand ? val : JSON.stringify(val)}
			</Text>
			}
		</View>
	);
};

export default memo<Object>(GeoFenceEventsLogRow);

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
	useState,
	memo,
	useCallback,
	useEffect,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	FloatingButton,
	ThemedScrollView,
	View,
	DropDown,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
    onDidMount: Function,
    navigation: Object,
};

const NONE_KEY = 'none';
const BLOCKS = [
	{
		key: NONE_KEY,
		value: 'None',
	},
];

const SelectGroup = memo<Object>((props: Props): Object => {
	const {
		onDidMount,
		navigation,
	} = props;

	const intl = useIntl();

	useEffect(() => {
		onDidMount('Add the event to a group', 'Add the event to a group by selecting one'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		layout,
	} = useSelector((state: Object): Object => state.app) || {};
	const {
		dropDownHeaderStyle,
		dropDownContainerStyleDef,
		coverStyle,
	} = getStyles({
		layout,
	});

	const [ value, setValue ] = useState(BLOCKS[0].value);

	const _onPressNext = useCallback(() => {
		navigation.navigate('SelectTriggerType');
	}, [navigation]);

	const items = [...BLOCKS];

	const onValueChange = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		setValue(data[itemIndex].value);
	}, []);

	return (
		<View
			level={2}
			style={{flex: 1}}>
			<ThemedScrollView
				level={2}
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					flexGrow: 1,
				}}>
				<View
					level={2}
					style={coverStyle}>
					<DropDown
						dropDownPosition={'bottom'}
						showMax
						label={'Select group'}
						items={items}
						value={value}
						appLayout={layout}
						intl={intl}
						dropDownContainerStyle={dropDownContainerStyleDef}
						dropDownHeaderStyle={dropDownHeaderStyle}
						onValueChange={onValueChange}/>
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={_onPressNext}
				iconName={'checkmark'}/>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorFour);

	return {
		coverStyle: {
			marginVertical: padding,
			width: width - (padding * 2),
			alignSelf: 'center',
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
		},
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
		},
		labelStyle: {
			flex: 0,
			fontSize,
			flexWrap: 'wrap',
		},
	};
};

export default SelectGroup;

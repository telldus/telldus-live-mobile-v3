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
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import {
	DropDown,
} from '../../../../BaseComponents';

import {
	eventSetGroup,
} from '../../../Actions/Event';

import Theme from '../../../Theme';

type Props = {
    groupsList: Array<Object>,
	groupId?: string,
	dropDownPosition: 'top' | 'bottom',
};

const NONE_KEY = 'none';
const BLOCKS = [
	{
		key: NONE_KEY,
		value: 'None',
	},
];

const SelectGroupDD: Object = memo<Object>((props: Props): Object => {
	const {
		groupsList,
		groupId,
		dropDownPosition,
	} = props;
	const intl = useIntl();

	const {
		layout,
	} = useSelector((state: Object): Object => state.app) || {};
	const {
		dropDownHeaderStyle,
		dropDownContainerStyleDef,
	} = getStyles({
		layout,
	});

	const value = useMemo((): string => {
		let _value = BLOCKS[0].value;
		for (let i = 0; i < groupsList.length; i++) {
			if (groupId && groupsList[i].key === groupId) {
				_value = groupsList[i].value;
				break;
			}
		}
		return _value;
	}, [groupId, groupsList]);

	const items = useMemo((): Array<Object> => {
		return [...groupsList, ...BLOCKS];
	}, [groupsList]);

	const dispatch = useDispatch();
	const onValueChange = useCallback((v: string, itemIndex: number, data: Array<any>) => {
		dispatch(eventSetGroup(data[itemIndex].key));
	}, [dispatch]);

	return (
		<DropDown
			dropDownPosition={dropDownPosition || 'top'}
			showMax
			label={'Select group'}
			items={items}
			value={value}
			appLayout={layout}
			intl={intl}
			dropDownContainerStyle={dropDownContainerStyleDef}
			dropDownHeaderStyle={dropDownHeaderStyle}
			onValueChange={onValueChange}/>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
		},
		dropDownContainerStyleDef: {
			marginBottom: 0,
			flex: 1,
			marginHorizontal: padding,
		},
	};
};

export default SelectGroupDD;

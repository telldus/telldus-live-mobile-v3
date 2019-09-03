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
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import {
	DropDown,
} from '../../../../BaseComponents';

import { changeSortingDB } from '../../../Actions';

import i18n from '../../../Translations/common';

const DBSortControlBlock = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { sortingDB: sortingDBProp } = defaultSettings;

	const {
		dropDownContainerStyle,
		dropDownHeaderStyle,
		fontSize,
	} = getStyles(layout);

	const dispatch = useDispatch();
	function saveSortingDB(value: string, itemIndex: number, data: Array<any>) {
		const { key: sortingDB } = data[itemIndex];
		const settings = { sortingDB };
		dispatch(changeSortingDB(settings));
	}

	const alpha = formatMessage(i18n.labelAlphabetical);
	const chrono = formatMessage(i18n.labelChronological);

	const labelSortingDB = formatMessage(i18n.labelSortingDb);

	return (
		<DropDown
			items={[
				{key: 'Alphabetical', value: alpha},
				{key: 'Chronological', value: chrono},
			]}
			value={sortingDBProp === alpha ? alpha : chrono}
			label={labelSortingDB}
			onValueChange={saveSortingDB}
			appLayout={layout}
			dropDownContainerStyle={dropDownContainerStyle}
			dropDownHeaderStyle={dropDownHeaderStyle}
			baseColor={'#000'}
			fontSize={fontSize}
			accessibilityLabelPrefix={labelSortingDB}
		/>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		dropDownContainerStyle: {
			marginBottom: fontSize / 2,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: '#b5b5b5',
		},
		fontSize,
	};
};

export default DBSortControlBlock;

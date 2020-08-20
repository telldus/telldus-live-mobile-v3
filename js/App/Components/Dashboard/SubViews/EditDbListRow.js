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
import { useIntl } from 'react-intl';

import ListRow from './ListRow';

import {
	getDeviceIcons,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const EditDbListRow = memo<Object>((props: Object): Object => {
	const {
		layout,
		item,
		selectedType,
		onPress,
		selected,
	} = props;

	const {
		formatMessage,
	} = useIntl();

	const {
		brandPrimary,
		brandSecondary,
	} = getStyles({layout});

	const {
		name,
		deviceType,
		id,
	} = item;

	const icon = selectedType === 'sensor' ? 'sensor' : getDeviceIcons(deviceType);

	let iconFav = selected ? 'favorite' : 'favorite-outline';

	const _onPress = useCallback((rowData: any) => {
		if (onPress) {
			onPress(rowData);
		}
	}, [onPress]);

	return (
		<ListRow
			key={`${id}`}
			layout={layout}
			onPress={_onPress}
			label={name || formatMessage(i18n.noName)}
			iconContainerStyle={{
				backgroundColor: selectedType === 'sensor' ? brandPrimary : brandSecondary,
			}}
			rowData={item}
			leftIcon={icon}
			rightIcon={iconFav}/>
	);
});

const getStyles = ({layout}: Object): Object => {
	const {
		brandSecondary,
		brandPrimary,
	} = Theme.Core;
	return {
		brandSecondary,
		brandPrimary,
	};
};

export default EditDbListRow;
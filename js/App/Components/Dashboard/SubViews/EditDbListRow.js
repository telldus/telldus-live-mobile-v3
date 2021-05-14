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
import {
	useAppTheme,
} from '../../../Hooks/Theme';

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
		colors,
		selectedThemeSet,
	} = useAppTheme();

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

	const backgroundColor = selectedThemeSet.key === 2 ? 'transparent' : (selectedType === 'sensor' ? colors.inAppBrandPrimary : colors.inAppBrandSecondary);

	return (
		<ListRow
			key={`${id}`}
			layout={layout}
			onPress={_onPress}
			label={name || formatMessage(i18n.noName)}
			iconContainerStyle={{
				backgroundColor,
			}}
			leftIconStyle={{
				color: colors.baseColor,
			}}
			rowData={item}
			leftIcon={icon}
			rightIcon={iconFav}/>
	);
});

export default (EditDbListRow: Object);

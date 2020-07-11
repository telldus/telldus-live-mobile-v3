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
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import {
	Text,
	BlockIcon,
	TouchableOpacity,
	IconTelldus,
} from '../../../../BaseComponents';

import {
	getDeviceIcons,
} from '../../../Lib';

import {
	removeFromDashboard,
	addToDashboard,
} from '../../../Actions/Dashboard';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const EditDbListRow = memo<Object>((props: Object): Object => {
	const {
		layout,
		item,
		selectedType,
	} = props;

	const {
		formatMessage,
	} = useIntl();

	const {
		coverStyle,
		iconStyle,
		iconContainerStyle,
		textStyle,
		brandPrimary,
		brandSecondary,
		favoriteIcon,
	} = getStyles({layout});

	const dispatch = useDispatch();

	const {
		name,
		deviceType,
		id,
	} = item;

	const icon = selectedType === 'sensor' ? 'sensor' : getDeviceIcons(deviceType);

	const { deviceIds = {}, sensorIds } = useSelector((state: Object): Object => state.dashboard);
	const { userId } = useSelector((state: Object): Object => state.user);
	const { defaultSettings } = useSelector((state: Object): Object => state.app);

	const { activeDashboardId } = defaultSettings || {};
	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];
	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];
	const isOnDB = selectedType === 'sensor' ? sensorIdsInCurrentDb.indexOf(id) !== -1 : deviceIdsInCurrentDb.indexOf(id) !== -1;

	let iconFav = isOnDB ? 'favorite' : 'favorite-outline';

	const _onStarSelected = useCallback(() => {
		const kind = selectedType === 'sensor' ? 'sensor' : 'device';
		if (isOnDB) {
			dispatch(removeFromDashboard(kind, id));
		} else {
			dispatch(addToDashboard(kind, id));
		}
	}, [isOnDB, dispatch, selectedType, id]);

	return (
		<TouchableOpacity
			onPress={_onStarSelected}
			style={coverStyle}>
			<BlockIcon
				icon={icon}
				style={iconStyle}
				containerStyle={[iconContainerStyle, {
					backgroundColor: selectedType === 'sensor' ? brandPrimary : brandSecondary,
				}]}/>
			<Text
				level={6}
				style={textStyle}>
				{name || formatMessage(i18n.noName)}
			</Text>
			<IconTelldus icon={iconFav} style={favoriteIcon}/>
		</TouchableOpacity>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		brandSecondary,
		maxSizeRowTextOne,
		brandPrimary,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	let nameFontSize = Math.floor(deviceWidth * 0.047);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	return {
		brandSecondary,
		brandPrimary,
		coverStyle: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginHorizontal: padding,
			backgroundColor: '#fff',
			marginBottom: padding / 2,
			padding,
			...shadow,
			borderRadius: 2,
		},
		iconStyle: {
			fontSize: 18,
			color: '#fff',
		},
		textStyle: {
			flex: 1,
			marginLeft: 5,
			fontSize: nameFontSize,
		},
		iconContainerStyle: {
			borderRadius: 25,
			width: 25,
			height: 25,
			alignItems: 'center',
			justifyContent: 'center',
			marginHorizontal: 5,
		},
		favoriteIcon: {
			fontSize: 25,
			color: brandSecondary,
			alignSelf: 'flex-end',
		},
	};
};

export default EditDbListRow;

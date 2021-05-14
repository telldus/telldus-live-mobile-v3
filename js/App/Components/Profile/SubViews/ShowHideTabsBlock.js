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
	useMemo,
	useCallback,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { Platform } from 'react-native';

import {
	View,
	Text,
	SettingsRow,
} from '../../../../BaseComponents';

import {
	tabUnhide,
	tabHide,
} from '../../../Actions/Navigation';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const WrappedSettingsRow = memo<Object>((props: Object): Object => {
	const {
		itemKey,
		onValueChange,
		...others
	} = props;

	const _onValueChange = useCallback(() => {
		onValueChange(itemKey);
	}, [onValueChange, itemKey]);

	return (
		<SettingsRow
			{...others}
			onValueChange={_onValueChange}/>
	);
});

const ShowHideTabsBlock = memo<Object>((props: Object): Object => {

	const {
		intl,
		layout,
	} = props;

	const {
		formatMessage,
	} = intl;

	const {
		titleStyle,
		labelTextStyle,
		touchableStyle,
		switchStyle,
		contentCoverStyle,
		containerStyle,
	} = getStyles({layout});

	const {
		hiddenTabs = {},
		defaultStartScreen = {},
	} = useSelector((store: Object): Object => store.navigation);
	const { userId } = useSelector((store: Object): Object => store.user);
	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];
	const defaultStartScreenCurrentUser = defaultStartScreen[userId] || {};

	const dispatch = useDispatch();

	const supportedTabs = [
		{
			label: formatMessage(i18n.dashboard),
			name: 'Dashboard',
		},
		{
			label: formatMessage(i18n.devices),
			name: 'Devices',
		},
		{
			label: formatMessage(i18n.sensors),
			name: 'Sensors',
		},
		{
			label: formatMessage(i18n.scheduler),
			name: 'Scheduler',
		},
	];

	const onValueChange = useCallback((itemKey: string) => {
		if (hiddenTabsCurrentUser.indexOf(itemKey) === -1) {
			if (Platform.OS === 'android') {
				let count = 0;
				supportedTabs.forEach((st: Object) => {
					if (hiddenTabsCurrentUser.indexOf(st.name) !== -1) {
						count++;
					}
				});
				if (count === (supportedTabs.length - 1)) {
					return;
				}
			}
			if (defaultStartScreenCurrentUser.screenKey === itemKey) {
				return;
			}
			dispatch(tabHide(itemKey, userId));
		} else {
			dispatch(tabUnhide(itemKey, userId));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hiddenTabsCurrentUser, userId, supportedTabs]);

	const items = useMemo((): Array<Object> => {
		return supportedTabs.map(({
			label,
			name,
		}: Object, i: number): Object => {
			const value = hiddenTabsCurrentUser.indexOf(name) === -1;
			return (
				<WrappedSettingsRow
					key={`${i}`}
					label={label}
					onValueChange={onValueChange}
					value={value}
					appLayout={layout}
					itemKey={name}
					intl={intl}
					labelTextStyle={labelTextStyle}
					touchableStyle={touchableStyle}
					switchStyle={switchStyle}
					style={[contentCoverStyle, {
						marginTop: 0,
					}]}/>
			);
		});
	}, [contentCoverStyle, hiddenTabsCurrentUser, intl, labelTextStyle, layout, onValueChange, supportedTabs, switchStyle, touchableStyle]);

	return (
		<View style={containerStyle}>
			<Text
				level={2}
				style={titleStyle}>
				{formatMessage(i18n.menuTabToDis)}
			</Text>
			{items}
		</View>
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

	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		containerStyle: {
			marginBottom: padding / 2,
		},
		titleStyle: {
			marginBottom: 5,
			fontSize,
		},
		labelTextStyle: {
			fontSize,
			justifyContent: 'center',
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		switchStyle: {
			transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
		},
		contentCoverStyle: {
			marginBottom: padding / 2,
		},
	};
};

export default (ShowHideTabsBlock: Object);

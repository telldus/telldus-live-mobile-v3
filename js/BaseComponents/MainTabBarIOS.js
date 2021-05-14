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
	useCallback,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';
import { useTheme } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import TouchableOpacity from './TouchableOpacity';
import Text from './Text';
import getTabBarIcon from '../App/Lib/getTabBarIcon';

import i18n from '../App/Translations/common';

const MainTabBarIOS = React.memo<Object>((props: Object): Object => {
	const {
		labelIntl,
		focused,
		screenName,
		tabBarAccesibilityLabelIntl,
		iconHint,
		iconName,
		onPress,
	} = props;

	const { colors } = useTheme();

	const intl = useIntl();
	const { formatMessage } = intl;

	const { screen } = useSelector((state: Object): Object => state.navigation);

	const postScript = screen === screenName ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);

	const {
		containerStyle,
		labelStyle,
	} = getStyles(colors, {
		iconName,
	});

	const tintColor = focused ? colors.activeTintOne : colors.textColorInactive;

	const accessibilityLabel = `${formatMessage(tabBarAccesibilityLabelIntl)}, ${postScript}`;

	let icon = React.useMemo((): Object => {
		return getTabBarIcon(focused, tintColor, iconHint, iconName);
	}, [
		focused,
		tintColor,
		iconHint,
		iconName,
	]);

	const _onPress = useCallback(() => {
		onPress(screenName);
	}, [onPress, screenName]);

	return (
		<TouchableOpacity
			onPress={_onPress}
			style={containerStyle}
			accessibilityLabel={accessibilityLabel}>
			{!!icon && icon}
			<Text
				numberOfLines={1}
				style={[labelStyle, {color: tintColor}]}>
				{formatMessage(labelIntl)}
			</Text>
		</TouchableOpacity>
	);
});

const getStyles = (colors: Object, {
	iconName,
}: Object): Object => {
	return {
		containerStyle: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'flex-end',
			padding: 2,
		},
		labelStyle: {
			marginTop: iconName ? 0 : 5,
			fontSize: DeviceInfo.isTablet() ? 18 : 12,
			color: colors.text,
		},
	};
};

export default (MainTabBarIOS: Object);

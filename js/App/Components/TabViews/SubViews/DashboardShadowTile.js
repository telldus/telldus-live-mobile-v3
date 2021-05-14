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
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
} from 'react-native';
import TextTicker from 'react-native-text-ticker';

import { View, Text, BlockIcon, StyleSheet } from '../../../../BaseComponents';

import {
	useAppTheme,
} from '../../../Hooks/Theme';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const Title = memo<Object>(({
	name,
	tileWidth,
	icon,
	iconContainerStyle,
	iconRightContainerStyle,
	iconStyle,
	info,
	formatMessage,
	iconRight,
	iconRightStyle,
	onPressIconRight,
	titleStyle = {},
}: Object): Object => {

	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		tileNameDisplayMode,
		dBTileDisplayMode,
	} = defaultSettings;

	const isBroard = dBTileDisplayMode !== 'compact';

	const {
		colors,
		selectedThemeSet,
		themeInApp,
		colorScheme,
	} = useAppTheme();

	const NameInfo = useMemo((): Object => {
		return (
			<TextTicker
				disabled={tileNameDisplayMode === 'Truncate'}
				ellipsizeMode={tileNameDisplayMode === 'Truncate' ? 'middle' : undefined}
				numberOfLines={1}
				duration={5000}
				repeatSpacer={50}
				marqueeDelay={5000}
				allowFontScaling={false}
				style={[
					styles.name, {
						fontSize: Math.floor(tileWidth / 10),
						opacity: name ? 1 : 0.7,
						color: colors.baseColorTwo,
						...titleStyle,
					},
				]}
				bounce={false}>
				{name ? name : formatMessage(i18n.noName)}
			</TextTicker>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [titleStyle, name, tileWidth, tileNameDisplayMode, selectedThemeSet.key, themeInApp, colorScheme]);

	return (
		<View
			level={2}
			style={[styles.title, {
				width: tileWidth,
				height: Math.ceil(tileWidth * (isBroard ? 0.6 : 0.22)),
				paddingHorizontal: tileWidth * 0.06,
				paddingVertical: tileWidth * (isBroard ? 0.06 : 0.022),
			}]}>
			{!!iconRight && isBroard && (<BlockIcon
				onPress={onPressIconRight}
				icon={iconRight}
				containerStyle={{
					position: 'absolute',
					right: 5,
					top: 5,
					width: Math.floor(tileWidth / 6),
					height: Math.floor(tileWidth / 6),
					borderRadius: 5,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: selectedThemeSet.key === 2 ? 'transparent' : colors.inAppBrandSecondary,
				}} style={{
					color: colors.baseColorThree,
					fontSize: Math.floor(tileWidth / 8),
					borderRadius: 5,
					textAlign: 'center',
					alignSelf: 'center',
				}}/>)}
			{!!icon && isBroard && (<BlockIcon
				blockLevel={21}
				icon={icon}
				containerStyle={iconContainerStyle}
				style={iconStyle}/>)}
			<View style={styles.textCover}>
				{NameInfo}
				{!!info && isBroard && (
					typeof info === 'string' ?
						<Text
							ellipsizeMode="middle"
							numberOfLines={1}
							style={[
								styles.name, {
									fontSize: Math.floor(tileWidth / 12),
									color: Theme.Core.rowTextColor,
								},
							]}>
							{info}
						</Text>
						:
						info
				)}
			</View>
		</View>
	);
});

type Props = {
	style: Object,
	children: Object,
	item: string,
	intl: Object,
	accessibilityLabel: string,
	icon?: string,
	titleStyle?: Object,
};

class DashboardShadowTile extends View<Props, null> {
	props: Props;

	render(): Object {
		let { accessibilityLabel } = this.props;

		return (
			// Because of the limitation of react-native so we need 2 nested views to create an rounded corner view
			// with shadow
			<View
				level={2}
				accessible={true}
				accessibilityLabel={accessibilityLabel}
				style={[this.props.style, Theme.Core.shadow, {elevation: 3}]}>
				<View style={{
					flexDirection: 'column',
					borderRadius: 2,
					overflow: 'hidden',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<Title {...this.props} />
					{this.props.children}
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	name: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	title: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		borderTopLeftRadius: 2,
		borderTopRightRadius: 2,
	},
	noShadow: {
		borderRadius: 2,
		elevation: 0,
	},
	textCover: {
		flex: 1,
		marginTop: 3,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

module.exports = (DashboardShadowTile: Object);

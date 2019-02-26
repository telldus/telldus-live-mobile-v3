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

import React from 'react';

import { View, Text, BlockIcon, StyleSheet } from '../../../../BaseComponents';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const Title = ({ name, tileWidth, icon, iconContainerStyle, iconStyle, info, formatMessage }: Object): Object => (
	<View style={[styles.title, {
		width: tileWidth,
		height: Math.ceil(tileWidth * 0.6),
		paddingHorizontal: tileWidth * 0.06,
		paddingVertical: tileWidth * 0.06,
	}]}>
		{!!icon && (<BlockIcon icon={icon} containerStyle={iconContainerStyle} style={iconStyle}/>)}
		<View style={styles.textCover}>
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style={[
					styles.name, {
						fontSize: Math.floor(tileWidth / 10),
						opacity: name ? 1 : 0.7,
					},
				]}>
				{name ? name : formatMessage(i18n.noName)}
			</Text>
			{!!info &&
			(<Text
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
			)}
		</View>
	</View>
);

type Props = {
	style: Object,
	children: Object,
	item: string,
	intl: Object,
	accessibilityLabel: string,
	icon?: string,
};

class DashboardShadowTile extends View<Props, null> {
	props: Props;

	render(): Object {
		let { accessibilityLabel } = this.props;

		return (
			// Because of the limitation of react-native so we need 2 nested views to create an rounded corner view
			// with shadow
			<View
				accessible={true}
				accessibilityLabel={accessibilityLabel}
				style={[this.props.style, Theme.Core.shadow, {elevation: 3, backgroundColor: '#fff'}]}>
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
		color: Theme.Core.rowTextColor,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	title: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		borderTopLeftRadius: 2,
		borderTopRightRadius: 2,
		backgroundColor: '#ffffff',
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

module.exports = DashboardShadowTile;

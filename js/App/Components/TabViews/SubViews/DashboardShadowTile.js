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
import PropTypes from 'prop-types';
import { View, Text, BlockIcon } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import Theme from 'Theme';

const Title = ({ isEnabled, name, tileWidth, type = 'device', icon, iconContainerStyle, iconStyle, info, isGatewayActive }: Object) => (
	<View style={[styles.title, {
		width: tileWidth - 4,
		height: tileWidth * 0.6,
	}]}>
		{icon && (<BlockIcon icon={icon} containerStyle={iconContainerStyle} style={iconStyle}/>)}
		<Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style={[
				styles.name, {
					fontSize: Math.floor(tileWidth / 8),
					opacity: name ? 1 : 0.7,
				},
			]}>
			{name ? name : '(no name)'}
		</Text>
		{info && (<Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style={[
				styles.name, {
					fontSize: Math.floor(tileWidth / 10),
					color: Theme.Core.rowTextColor,
				},
			]}>
			{info}
		</Text>)
		}
	</View>
);

type Props = {
	hasShadow: boolean,
	style: Object,
	children: Object,
	type: String,
	item: string,
	intl: Object,
	accessibilityLabel: string,
	icon?: string,
};

class DashboardShadowTile extends View {
	props: Props;

	render() {
		let { accessibilityLabel } = this.props;

		return (
			// Because of the limitation of react-native so we need 2 nested views to create an rounded corner view
			// with shadow
			<View
				accessible={true}
				accessibilityLabel={accessibilityLabel}
				style={[this.props.style, (this.props.hasShadow ? styles.shadow : styles.noShadow)]}>
				<View style={{
					flex: 0.994,
					paddingTop: 3,
					paddingLeft: 2,
					flexDirection: 'column',
					borderRadius: 2,
					overflow: 'hidden',
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
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 2,
		borderTopRightRadius: 2,
		backgroundColor: '#ffffff',
	},
	shadow: {
		borderRadius: 2,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 3,
		shadowOpacity: 1.0,
		elevation: 3,
	},
	noShadow: {
		borderRadius: 2,
		elevation: 0,
	},
});

DashboardShadowTile.propTypes = {
	hasShadow: PropTypes.bool,
	isEnabled: PropTypes.bool,
	name: PropTypes.string,
	tileWidth: PropTypes.number,
};

DashboardShadowTile.defaultProps = {
	hasShadow: true,
};

module.exports = DashboardShadowTile;

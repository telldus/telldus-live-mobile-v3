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
import { View, Text } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import i18n from '../../../Translations/common';

const Title = ({ isEnabled, name, tileWidth, type = 'device' }: Object) => (
	<View style={[styles.title, !isEnabled ? styles.titleDisabled : (type === 'device' ? styles.titleEnabledDevice : styles.titleEnabledSensor)]}>
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
					flex: 1,
					flexDirection: 'column',
					borderRadius: 7,
					overflow: 'hidden',
				}}>
					{this.props.children}
					<Title {...this.props} />
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	name: {
		padding: 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	title: {
		flex: 13,
		justifyContent: 'center',
		borderBottomLeftRadius: 7,
		borderBottomRightRadius: 7,
	},
	titleEnabledDevice: {
		backgroundColor: '#e56e18',
	},
	titleDisabled: {
		backgroundColor: '#bfbfbf',
	},
	titleEnabledSensor: {
		backgroundColor: '#00255e',
	},
	shadow: {
		borderRadius: 7,
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
		borderRadius: 7,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 0,
		shadowOpacity: 1.0,
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

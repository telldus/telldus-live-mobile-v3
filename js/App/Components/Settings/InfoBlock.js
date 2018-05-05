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

import {
	Text,
	View,
	StyleSheet,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const InfoBlock = ({title, label, value}: Object): Object => (
	<View style={styles.blockContainer}>
		<Text style={styles.titleStyle}>
			{title}
		</Text>
		<View style={styles.infoCover}>
			<Text style={[styles.infoStyle, styles.infoLabel]}>
				{label}
			</Text>
			<Text style={[styles.infoStyle, styles.infoValue]}>
				{value}
			</Text>
		</View>
	</View>
);

const styles = StyleSheet.create({
	blockContainer: {
		flex: 0,
		alignItems: 'stretch',
		justifyContent: 'center',
		marginBottom: 10,
	},
	titleStyle: {
		marginBottom: 5,
		fontSize: 14,
		color: '#b5b5b5',
	},
	infoCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		...Theme.Core.shadow,
		padding: 15,
	},
	infoStyle: {
		fontSize: 14,
	},
	infoLabel: {
		color: '#000',
	},
	infoValue: {
		color: '#8e8e93',
	},
});

module.exports = InfoBlock;

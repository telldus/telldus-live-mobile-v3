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
 *
 */

// @flow

'use strict';

import React from 'react';

import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	IconTelldus,
} from 'BaseComponents';
const deviceWidth = Dimensions.get('window').width;

class LabelBox extends View {
	render() {
		let { containerStyle, label, children, showIcon } = this.props;

		return (
			<View style={[styles.container, containerStyle]}>
				<View style={[styles.itemsContainer, styles.shadow]}>
					<Text style={styles.label}>
						{label}
					</Text>
					{!!showIcon &&
						<IconTelldus icon={'location'} size={30} color={'#A59F9A'} style={styles.icon}/>
					}
					{!!children && children}
				</View>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemsContainer: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		marginTop: 15,
		padding: 10,
		alignItems: 'flex-start',
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
	label: {
		color: '#e26901',
		fontSize: 14,
		paddingLeft: 2,
	},
	icon: {
		position: 'absolute',
		top: 40,
		left: deviceWidth * 0.03,
	},
});

export default LabelBox;

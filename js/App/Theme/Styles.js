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

import Color from 'color';
import { StyleSheet } from 'react-native';
import Core from './Core'

const listItemHeight = 56;
const listItemWidth = 30;

export default StyleSheet.create({
	sectionHeader: {
		backgroundColor: '#FAFAFA',
		height: 26,
		borderBottomWidth: 1,
		borderBottomColor: '#EEEEEE',
		flexDirection: 'column',
		justifyContent: 'center'
	},
	sectionHeaderText: {
		color: Core.brandPrimary,
		fontSize: 14,
		marginLeft: 16,
		fontWeight: '500'
	},
	rowFront: {
		backgroundColor: '#FFFFFF',
		borderBottomColor: '#EEEEEE',
		borderBottomWidth: 1,
		flexDirection: 'row',
		height: listItemHeight,
		justifyContent: 'flex-start',
		paddingLeft: 16,
		alignItems: 'center',
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	rowBackButton: {
		height: listItemHeight,
		width: listItemWidth,
		// flex: 1,
		justifyContent: 'center',
	},
	sensorValue: {
		width: 88,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingRight: 12
	},
	sensorTileItem: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
	},
	listItemAvatar: {
		width: 32,
		marginRight: 24,
	},
	dashboardItem: {
		backgroundColor: '#ff9090',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	}
});

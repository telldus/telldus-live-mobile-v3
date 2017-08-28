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

import { StyleSheet, Dimensions } from 'react-native';
import Core from './Core';

const deviceWidth = Dimensions.get('window').width;

const listItemHeight = 56;
const listItemWidth = 30;

export default StyleSheet.create({
	sectionHeader: {
		backgroundColor: '#FAFAFA',
		height: 26,
		borderBottomWidth: 1,
		borderBottomColor: '#EEEEEE',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	sectionHeaderText: {
		color: Core.brandPrimary,
		fontSize: 14,
		marginLeft: 16,
		fontWeight: '500',
	},
	rowFront: {
		backgroundColor: '#FFFFFF',
		borderBottomColor: '#EEEEEE',
		borderBottomWidth: 1,
		flexDirection: 'row',
		height: listItemHeight,
		justifyContent: 'space-between',
		paddingLeft: 16,
		alignItems: 'center',
	},
	gatewayRowFront: {
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
		backgroundColor: '#F3F3F3',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		paddingLeft: 8,
	},
	rowBackButton: {
		height: listItemHeight,
		width: listItemWidth,
		// flex: 1,
		justifyContent: 'center',
	},
	sensorValue: {
		width: 108,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingRight: 12,
	},
	sensorTileItem: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		backgroundColor: 'white',
		borderTopLeftRadius: 7,
		borderTopRightRadius: 7,
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
	},

	textFieldCover: {
		height: 50,
		width: deviceWidth * 0.7,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	textField: {
		paddingLeft: 35,
		paddingTop: 10,
		minWidth: 200,
		borderRadius: 3,

		height: 40,
		width: deviceWidth * 0.7,
		fontSize: 14,
		color: '#ffffff80',
		textAlign: 'left',
	},
	iconEmail: {
		top: 20,
		left: 3,
		position: 'absolute',
	},
	iconAccount: {
		top: 15,
		left: 2,
		position: 'absolute',
	},
	iconLock: {
		top: 18,
		left: 2,
		position: 'absolute',
	},
	submitButton: {
		height: 50,
		width: 180,
		borderRadius: 50,
	},
	notificationModal: {
		backgroundColor: '#ffffff',
		position: 'absolute',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		top: 45,
	},
});

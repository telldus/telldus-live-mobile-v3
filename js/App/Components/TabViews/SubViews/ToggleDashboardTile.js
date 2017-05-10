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

'use strict';

import React from 'react';
import { Text, View } from 'BaseComponents';
import { TouchableOpacity } from 'react-native';
import DashboardShadowTile  from './DashboardShadowTile';

class ToggleDashboardTile extends View {
	constructor(props) {
		super(props);
	}

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;

		return (
			<DashboardShadowTile
				item={item}
				style={	[this.props.style,{
					width: tileWidth,
					height: tileWidth
				}]}>
				<View style={{flexDirection: 'row', flex:30}}>
					<View style={{
						flex:1,
						backgroundColor: item.childObject.state === 0 ? 'white' : '#eeeeee',
						alignItems:'stretch'
					}}>
						<TouchableOpacity
							onPress={() => console.log('off')}
							style={{flex:1, justifyContent: 'center'}} >
							<Text
								ellipsizeMode="middle"
								numberOfLines={1}
								style = {{
									color: item.childObject.state === 0 ? 'red' : '#a0a0a0',
									fontSize:  Math.floor(tileWidth / 8),
									textAlign: 'center',
									textAlignVertical: 'center',
								}}
							>
								{'Off'}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={{
						flex:1,
						backgroundColor: item.childObject.state === 0 ? '#eeeeee' : 'white',
					}}>
						<TouchableOpacity
							onPress={() => console.log('off')}
							style={{flex:1, justifyContent: 'center'}} >
							<Text
								ellipsizeMode="middle"
								numberOfLines={1}
								style = {{
									color: item.childObject.state === 0 ? '#a0a0a0' : 'green',
									fontSize:  Math.floor(tileWidth / 8),
									textAlign: 'center',
									textAlignVertical: 'center',
								}}>
								{'On'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{
					flex:13,
					backgroundColor: item.childObject.state === 0 ? '#bfbfbf' : '#e56e18',
					justifyContent: 'center'}}>
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						style = {{
							padding : 5,
							color: 'white',
							fontSize:  Math.floor(tileWidth / 8),
							opacity: item.childObject.name ? 1 : 0.7,
							textAlign: 'center',
							textAlignVertical: 'center',
						}}>
						{item.childObject.name ? item.childObject.name : '(no name)'}
					</Text>
				</View>
			</DashboardShadowTile>
		);
	}
}

module.exports = ToggleDashboardTile;

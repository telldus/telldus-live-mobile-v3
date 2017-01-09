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
import { Image, Text, View } from 'BaseComponents';

import Theme from 'Theme';

class SensorDashboardTile extends View {

	constructor(props) {
		super(props);
	}

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;
		const tileTitleHeight = Math.floor(tileWidth / 4);
		const tileDetailsHeight = tileWidth - tileTitleHeight;
		return (
			<Image
				style={[this.props.style, {
					flexDirection: 'column',
					width: tileWidth,
					height: tileWidth,
					backgroundColor: Theme.Core.brandPrimary
				}]}
				source={require('../img/TileBackground.png')}
			>
				<View style={{
					width: tileWidth,
					height: tileDetailsHeight
				}}></View>
				<View style={{
					width: tileWidth,
					height: tileTitleHeight,
					justifyContent: 'center'
				}}>
					<Text
					ellipsizeMode="middle"
					numberOfLines={1}
					style = {{
						width: tileWidth,
						color: 'rgba(255,255,255,1)',
						fontSize:  Math.floor(tileWidth / 8),
						opacity: item.childObject.name ? 1 : 0.7,
						marginBottom: 2,
						textAlign: 'center'
					}}>
						{item.childObject.name ? item.childObject.name : '(no name)'}
					</Text>
				</View>
			</Image>
		)
	}

}

module.exports = SensorDashboardTile;

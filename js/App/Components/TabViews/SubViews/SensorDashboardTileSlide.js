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

class SensorDashboardTileSlide extends View {

	render() {
		return (
			<View style={Theme.Styles.sensorTileItem}>
				<View style={{
					flex: 4,
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<Image source={this.props.icon} />
				</View>
				<View style={{
					flex: 5,
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<Text style={{color: "#ffffff", fontSize: Math.floor(this.props.tileWidth / 5)}}>
						{this.props.text}
					</Text>
				</View>
			</View>
		)
	}

}

module.exports = SensorDashboardTileSlide;

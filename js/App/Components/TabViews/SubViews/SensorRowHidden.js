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
import { View, Icon } from 'BaseComponents';
import { TouchableOpacity } from 'react-native';

import Theme from 'Theme';

export default class SensorRowHidden extends View {
	render() {
		return (
			<View style={Theme.Styles.rowBack}>
				<TouchableOpacity
					style={Theme.Styles.rowBackButton}
					onPress={this.onStarSelected.bind(this, this.props)} >
					<Icon name="star" size={26} color={this.props.inDashboard ? 'yellow' : 'white'}/>
				</TouchableOpacity>
			</View>
		);
	}

	onStarSelected(item) {
		if (item.inDashboard) {
			this.props.removeFromDashboard(item.id);
		} else {
			this.props.addToDashboard(item.id);
		}
	}
}

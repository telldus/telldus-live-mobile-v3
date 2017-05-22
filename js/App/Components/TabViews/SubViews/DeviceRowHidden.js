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
import { connect } from 'react-redux';

import { View, Icon } from 'BaseComponents';
import { TouchableOpacity } from 'react-native';

import { addToDashboard, removeFromDashboard } from 'Actions';

import Theme from 'Theme';

class DeviceRowHidden extends View {
	constructor(props) {
		super(props);
		this.onStarSelected = this.onStarSelected.bind(this);
	}

	render() {
		const { isInDashboard } = this.props.device;
		return (
			<View style={Theme.Styles.rowBack}>
				<TouchableOpacity
					style={Theme.Styles.rowBackButton}
					onPress={this.onStarSelected} >
					<Icon name="star" size={26} color={isInDashboard ? 'yellow' : 'white'}/>
				</TouchableOpacity>
			</View>
		);
	}

	onStarSelected() {
		const { id, isInDashboard } = this.props.device;
		if (isInDashboard) {
			this.props.removeFromDashboard(id);
		} else {
			this.props.addToDashboard(id);
		}
	}
}

function mapDispatchToProps(dispatch) {
	return {
		addToDashboard: id => dispatch(addToDashboard('device', id)),
		removeFromDashboard: id => dispatch(removeFromDashboard('device', id)),
	};
}

export default connect(null, mapDispatchToProps)(DeviceRowHidden);

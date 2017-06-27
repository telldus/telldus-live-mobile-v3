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
import { View, Text } from 'BaseComponents';
import { Image, TouchableOpacity, Dimensions } from 'react-native';
import Theme from 'Theme';

type Props = {
	row: Object,
	selectDevice: (Object) => void;
};

class DeviceRow extends View {

	props: Props;

	selectDevice: () => void;

	constructor(props) {
		super(props);

		this.deviceWidth = Dimensions.get('window').width;

		this.deviceIconSize = this.deviceWidth * 0.092;
		this.paddingHorizontal = this.deviceWidth * 0.033333333;
		this.rowWidth = this.deviceWidth - 2 * this.paddingHorizontal;

		const centerContent = {
			alignItems: 'center',
			justifyContent: 'center',
		};

		this.styles = {
			container: {
				flex: 1,
				flexDirection: 'row',
				borderRadius: 2,
				overflow: 'hidden',
				height: this.deviceWidth * 0.209333333,
				minHeight: this.deviceIconSize + 10,
				marginBottom: 5,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 2,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
			},
			icon: {
				container: {
					...centerContent,
					minWidth: this.deviceIconSize,
					width: this.rowWidth * 0.3,
					backgroundColor: Theme.Core.brandPrimary,
					padding: 5,
				},
				image: {
					width: this.deviceIconSize,
					height: this.deviceIconSize,
				},
			},
			text: {
				container: {
					...centerContent,
					backgroundColor: '#fff',
					alignItems: 'flex-start',
					width: this.rowWidth * 0.7,
					paddingLeft: this.deviceWidth * 0.101333333,
					paddingRight: 10,
					paddingVertical: 5,
				},
				name: {
					fontSize: this.deviceWidth * 0.053333333,
					color: Theme.Core.brandSecondary,
					marginBottom: this.deviceWidth * .008,
				},
				type: {
					fontSize: this.deviceWidth * 0.032,
					color: '#707070',
				},
			},
		};
	}

	selectDevice = () => {
		this.props.selectDevice(this.props.row);
	};

	render() {
		const { name } = this.props.row;

		return (
			<TouchableOpacity onPress={this.selectDevice}>
				<View style={this.styles.container}>
					<View style={this.styles.icon.container}>
						<Image
							source={require('./img/device-alt.png')}
							style={this.styles.icon.image}
						/>
					</View>
					<View style={this.styles.text.container}>
						<Text style={this.styles.text.name}>{name}</Text>
						<Text style={this.styles.text.type}>Fibaro Plug 2</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

DeviceRow.propTypes = {
	row: React.PropTypes.object.isRequired,
	selectDevice: React.PropTypes.func.isRequired,
};

module.exports = DeviceRow;

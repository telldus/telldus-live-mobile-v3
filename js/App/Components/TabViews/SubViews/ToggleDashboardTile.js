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
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

const OffButton = ({ isInState, tileWidth, onPress }) => (
	<View style={[styles.turnOffButtonContainer, isInState === 'TURNOFF' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
		<TouchableOpacity
			onPress={onPress}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, isInState === 'TURNOFF' ? styles.buttonOffEnabled : styles.buttonOffDisabled,
					{ fontSize: Math.floor(tileWidth / 8) }]}>
				{'Off'}
			</Text>
		</TouchableOpacity>
	</View>
);

const OnButton = ({ isInState, tileWidth, onPress }) => (
	<View style={[styles.turnOnButtonContainer, isInState === 'TURNON' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
		<TouchableOpacity
			onPress={onPress}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, isInState === 'TURNON' ? styles.buttonOnEnabled : styles.buttonOnDisabled,
					{ fontSize: Math.floor(tileWidth / 8) }]}>
				{'On'}
			</Text>
		</TouchableOpacity>
	</View>
);

class ToggleDashboardTile extends View {
	constructor(props) {
		super(props);
	}

	render() {
		const tileWidth = this.props.item.tileWidth - 8;
		const isInState = this.props.item.childObject.isInState;
		const name = this.props.item.childObject.name;

		const { TURNON, TURNOFF } = this.props.item.childObject.supportedMethods;
		const turnOnButton = TURNON ? <OnButton isInState={isInState} onPress={this.props.onTurnOn} tileWidth={tileWidth} /> : null;
		const turnOffButton = TURNOFF ? <OffButton isInState={isInState} onPress={this.props.onTurnOff} tileWidth={tileWidth} /> : null;
		return (
			<DashboardShadowTile
				item={this.props.item}
				isEnabled={isInState === 'TURNON'}
				name={name}
				tileWidth={tileWidth}
				style={[this.props.style, {
					width: tileWidth,
					height: tileWidth,
				}]}>
				<View style={{ flexDirection: 'row', flex: 30 }}>
					{ turnOffButton }
					{ turnOnButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	buttonBackgroundEnabled: {
		backgroundColor: 'white',
	},
	buttonBackgroundDisabled: {
		backgroundColor: '#eeeeee',
	},
	buttonOnEnabled: {
		color: 'green',
	},
	buttonOnDisabled: {
		color: '#a0a0a0',
	},
	buttonOffEnabled: {
		color: 'red',
	},
	buttonOffDisabled: {
		color: '#a0a0a0',
	},
});

module.exports = ToggleDashboardTile;

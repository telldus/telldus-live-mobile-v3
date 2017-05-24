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

import React, { PropTypes } from 'react';
import { Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

const OffButton = ({ isInState, tileWidth, enabled, onPress }) => (
	<View style={[styles.turnOffButtonContainer, isInState === 'TURNOFF' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
		<TouchableOpacity
			disabled={!enabled}
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

const OnButton = ({ isInState, tileWidth, enabled, onPress }) => (
	<View style={[styles.turnOnButtonContainer, isInState === 'TURNON' ? styles.buttonBackgroundEnabled : styles.buttonBackgroundDisabled ]}>
		<TouchableOpacity
			disabled={!enabled}
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
		const { item, tileWidth } = this.props;
		const { name, isInState, supportedMethods } = item;
		const enabled = this.props.enabled;
		const { TURNON, TURNOFF } = supportedMethods;
		const turnOnButton = TURNON || enabled === false ? <OnButton isInState={isInState} onPress={this.props.onTurnOn} tileWidth={tileWidth} enabled={enabled} /> : null;
		const turnOffButton = TURNOFF || enabled === false ? <OffButton isInState={isInState} onPress={this.props.onTurnOff} tileWidth={tileWidth} enabled={enabled} /> : null;

		let style = this.props.style;
		style.width = tileWidth;
		style.height = tileWidth;

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={isInState === 'TURNON'}
				name={name}
				tileWidth={tileWidth}
				hasShadow={enabled}
				style={style}>
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

ToggleDashboardTile.propTypes = {
	onTurnOn: PropTypes.func,
	onTurnOff: PropTypes.func,
	item: PropTypes.object,
	enabled: PropTypes.bool,
};

module.exports = ToggleDashboardTile;

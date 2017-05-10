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

const OffButton = ({isInState, tileWidth, onPress}) => (
	<View style={[styles.buttonContainer,{
			backgroundColor: isInState === 'TURNOFF' ? 'white' : '#eeeeee'}]}>
		<TouchableOpacity
			onPress={onPress}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText,{
					color: isInState === 'TURNOFF' ? 'red' : '#a0a0a0',
					fontSize:  Math.floor(tileWidth / 8)
				}]}>
				{'Off'}
			</Text>
		</TouchableOpacity>
	</View>
);

const OnButton = ({isInState, tileWidth, onPress}) => (
	<View style={[styles.buttonContainer,{
			backgroundColor: isInState === 'TURNON' ? 'white' : '#eeeeee'}]}>
		<TouchableOpacity
			onPress={onPress}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText,{
					color: isInState === 'TURNON' ? 'green' : '#a0a0a0',
					fontSize:  Math.floor(tileWidth / 8)}]}>
				{'On'}
			</Text>
		</TouchableOpacity>
	</View>
);

const Title = ({isInState, name, tileWidth}) => (
	<View style={[styles.titleContainer,{
		backgroundColor: isInState === 'TURNOFF' ? '#bfbfbf' : '#e56e18'}]}>
		<Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style = {[styles.titleText,{
				fontSize:  Math.floor(tileWidth / 8),
				opacity: name ? 1 : 0.7
			}]}>
			{name ? name : '(no name)'}
			</Text>
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
				style={	[this.props.style,{
					width: tileWidth,
					height: tileWidth
				}]}>
				<View style={{flexDirection: 'row', flex:30}}>
					{ turnOffButton }
					{ turnOnButton }
				</View>
				<Title item={isInState} tileWidth={tileWidth} name={name} />
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	buttonContainer: {
		flex:1,
		alignItems:'stretch'
	},
	button: {
		flex:1,
		justifyContent: 'center'
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center'
	},
	titleContainer: {
		flex:13,
		justifyContent: 'center'
	},
	titleText: {
		padding : 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	}
});

module.exports = ToggleDashboardTile;

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
import { Text, View, RoundedCornerShadowView } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';

const OffButton = ({ item, onPress }) => (
    <View style={[styles.buttonContainer, {
	backgroundColor: item.isInState === 'TURNOFF' ? '#fafafa' : '#eeeeee' }]}>
        <TouchableOpacity
			onPress={onPress}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style = {[styles.buttonText, {
	color: item.isInState === 'TURNOFF' ? 'red' : '#a2a2a2' }]}>
                {'Off'}
            </Text>
        </TouchableOpacity>
    </View>
);

const OnButton = ({ item, onPress }) => (
    <View style={[styles.buttonContainer, {
	backgroundColor: item.isInState === 'TURNON' ? '#fafafa' : '#eeeeee' }]}>
        <TouchableOpacity
			onPress={onPress}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style = {[styles.buttonText, {
	color: item.isInState === 'TURNON' ? 'green' : '#a2a2a2' }]}>
                {'On'}
            </Text>
        </TouchableOpacity>
    </View>
);

class ToggleButton extends View {
	constructor(props) {
		super(props);
	}

	render() {
		const { TURNON, TURNOFF } = this.props.item.supportedMethods;
		const turnOnButton = TURNON ? <OnButton item={this.props.item} onPress={this.props.onTurnOn} /> : null;
		const turnOffButton = TURNOFF ? <OffButton item={this.props.item} onPress={this.props.onTurnOff} /> : null;

		return (
            <RoundedCornerShadowView style={styles.container}>
                { turnOffButton }
                { turnOnButton }
            </RoundedCornerShadowView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 7,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonContainer: {
		flex: 1,
		alignItems: 'stretch',
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: 12,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});

module.exports = ToggleButton;

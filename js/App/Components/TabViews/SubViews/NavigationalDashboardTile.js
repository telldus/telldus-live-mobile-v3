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
import { Text, View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

const UpButton = ({ isInState, onPress }) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="caret-up" size={42}
            style={{
	color: isInState === 'UP' ? '#1a355b' : '#eeeeee',
}}
        />
    </TouchableOpacity>
);

const DownButton = ({ isInState, onPress }) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="caret-down" size={42}
            style={{
	color: isInState === 'DOWN' ? '#1a355b' : '#eeeeee',
}}
        />
    </TouchableOpacity>
);

const StopButton = ({ isInState, onPress }) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="stop" size={30}
            style={{
	color: isInState === 'STOP' ? '#1a355b' : '#eeeeee',
}}
        />
    </TouchableOpacity>
);

class NavigationalDashboardTile extends View {
	constructor(props) {
		super(props);
	}

	render() {
		const item = this.props.item;
		const isInState = item.childObject.isInState;
		const tileWidth = item.tileWidth - 8;
		const { UP, DOWN, STOP } = item.childObject.supportedMethods;
		const upButton = UP ? <UpButton isInState={isInState} onPress={this.props.onUp} /> : null;
		const downButton = DOWN ? <DownButton isInState={isInState} onPress={this.props.onDown} /> : null;
		const stopButton = STOP ? <StopButton isInState={isInState} onPress={this.props.onStop} /> : null;

		return (
			<DashboardShadowTile
				item={item}
				style={[this.props.style, {
					width: tileWidth,
					height: tileWidth,
				}]}>
				<View style={styles.body}>
                    { upButton }
                    { downButton }
                    { stopButton }
				</View>
				<View style={styles.title}>
					<Text
						ellipsizeMode="middle"
						numberOfLines={1}
						style = {[styles.name, {
							fontSize: Math.floor(tileWidth / 8),
							opacity: item.childObject.name ? 1 : 0.7,
						}]}>
						{item.childObject.name ? item.childObject.name : '(no name)'}
					</Text>
				</View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	body: {
		flex: 30,
		flexDirection: 'row',
		backgroundColor: 'white',
	},
	title: {
		flex: 13,
		backgroundColor: '#e56e18',
		justifyContent: 'center',
	},
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	name: {
		padding: 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});

module.exports = NavigationalDashboardTile;

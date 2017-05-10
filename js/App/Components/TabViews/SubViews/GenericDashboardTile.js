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
import { StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

class GenericDashboardTile extends View {
	constructor(props) {
		super(props);
	}

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;

		return (
			<DashboardShadowTile
				item={item}
				style={	[this.props.style, {
					width: tileWidth,
					height: tileWidth
				}]}>
                <View
                    style={styles.container}>
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
                </View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
	body: {
        flex: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {
		flex: 13,
		backgroundColor: '#e56e18',
		justifyContent: 'center'
    },
	name: {
        padding: 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	}
});

module.exports = GenericDashboardTile;

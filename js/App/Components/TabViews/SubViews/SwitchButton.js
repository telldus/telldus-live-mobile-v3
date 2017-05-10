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
import { TouchableOpacity } from 'react-native';

module.exports = class SwitchButton extends View {
	render() {
        console.log('SwitchButton props:');
        console.log(this.props.item.state);
		return (
			<View
				style={[this.props.style, {
					borderRadius: 7,
					shadowColor: '#000000',
					shadowOffset: {width: 0, height: 0},
					shadowRadius: 1,
					shadowOpacity: 1.0,
                    backgroundColor: 'red',
                    elevation:5
            }]}>
                <View style={{
					flex:1,
					flexDirection: 'row',
					borderRadius: 7,
					overflow: 'hidden'
				}}>
                    <View style={{
                        flex:1,
                        backgroundColor: this.props.item.state === 0 ? '#fafafa' : '#eeeeee',
                        alignItems:'stretch'
                    }}>
                        <TouchableOpacity
							onPress={() => console.log('off')}
							style={{flex:1, justifyContent: 'center'}} >
                            <Text
                                ellipsizeMode="middle"
                                numberOfLines={1}
                                style = {{
                                    color: this.props.item.state === 0 ? 'red' : '#a2a2a2',
                                    fontSize:  Math.floor(100 / 8),
                                    textAlign: 'center',
                                    textAlignVertical: 'center',
                            }}>
                                {'Off'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:1,
                        backgroundColor: this.props.item.state === 1 ? '#fafafa' : '#eeeeee',
                        alignItems:'stretch'
                    }}>
                        <TouchableOpacity
							onPress={() => console.log('off')}
							style={{flex:1, justifyContent: 'center'}} >
                            <Text
                                ellipsizeMode="middle"
                                numberOfLines={1}
                                style = {{
                                    color: this.props.item.state === 1 ? 'green' : '#a2a2a2',
                                    fontSize:  Math.floor(100 / 8),
                                    textAlign: 'center',
                                    textAlignVertical: 'center',
                            }}>
                                {'On'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
		);
    }
};

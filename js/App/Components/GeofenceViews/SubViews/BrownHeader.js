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
 *
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { View, Text, Image, H1, H2 } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons'

const { width , height } = Dimensions.get('window');

class BrownHeader extends View {

    constructor(props) {
        super(props);


    }

    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={require('../img/brownHeader.png')}
                    style={styles.bkgImage}
                    resizeMode={'stretch'}
                />
                <Text style={styles.title}>{this.props.title}</Text>
                <Text style={styles.description}>{this.props.description}</Text>    
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 120,        
        padding: 32,
        overflow: 'hidden'
    },
    title: {
        fontSize: 32,
        color: '#FFF'
    },
    description: {
        fontSize: 20,
        color: '#FFF'
    },
    bkgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: 120,
        overflow: 'hidden'
    }
});

module.exports = BrownHeader;
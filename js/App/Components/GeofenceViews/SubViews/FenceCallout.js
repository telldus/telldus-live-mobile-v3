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
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text, Header, Button } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons'

class FenceCallout extends View {

    constructor(props) {
        super(props);


    }

    render() {
        return (
            <View style={styles.container}>
                <Text
                    style={styles.title}
                >
                    {this.props.title}
                </Text>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => this.props.onEdit()}
                >
                    <Icon
                        style={styles.editIcon}
                        name="mode-edit"
                    />
                </TouchableOpacity>
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        color: 'rgba(226,105,1,1)'
    },
    editBtn: {
        marginLeft: 8
    },
    editIcon: {
        color: '#999',
        fontSize: 20
    }
});

module.exports = FenceCallout;
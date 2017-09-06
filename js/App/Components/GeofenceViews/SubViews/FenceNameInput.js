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
 * @providesModule FenceNameInput
 */

import React, { PropTypes } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { View } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons';

class FenceNameInput extends View {

    constructor(props) {

        super(props);

        this.state = {
            title: ''
        };

        this.onChangeText = this.onChangeText.bind(this);
    }

    _resetInput() {

        this.setState({ title: '' });
    }

    onChangeText(text) {
        if(this.props.onChangeText) this.props.onChangeText(text);
        this.setState({title: text});
    }

    render() {
        return (
            <View
                style={styles.container}
            >
                <View style={styles.inner}>
                    <Icon
                        name={'place'}
                        style={styles.placeIcon}
                    />
                    <TextInput
                        value={this.state.title}
                        style={styles.input}
                        onChangeText={this.onChangeText}
                        underlineColorAndroid={'transparent'}
                    />
                </View>
            </View>
        );
    }
};

var styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        height: 80,
        backgroundColor: '#FFF',
    },
    inner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',        
        borderColor: 'rgba(226,105,1,1)',
        borderBottomWidth: 1
    },
    input: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        color: 'rgba(226,105,1,1)',
        paddingVertical: 0,

    },
    placeIcon: {
        fontSize: 24,
        color: '#BBB'
    }
});

module.exports = FenceNameInput;
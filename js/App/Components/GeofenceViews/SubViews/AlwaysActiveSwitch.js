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
 * @providesModule AlwaysActiveSwitch
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { View, Text, Image, H1, H2 } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons'

class AlwaysActiveSwitch extends View {

    constructor(props) {
        super(props);

        this.state = {
            active: false
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>{'Always active'}</Text>
                <Switch
                    value={this.state.active}
                    onValueChange={(value)=> this.setState({active: value})}
                />
            </View>
        );
    }
};

AlwaysActiveSwitch.propTypes = {

};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderColor: '#C8C7CC',
        borderBottomWidth: 1,
        borderTopWidth: 1
    },
    label: {
        flex: 1,
        color: '#555',
        fontSize: 14
    }
});

module.exports = AlwaysActiveSwitch;
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
import { StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { View, Text, Image, H1, H2 } from 'BaseComponents';
import Icon from 'react-native-vector-icons/Ionicons'

class ActionSectionHeader extends View {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: false
        }

        this._toggleHeader = this._toggleHeader.bind(this);
    }

    _toggleHeader() {

        if(this.props.onToggle) {
            this.props.onToggle(!this.state.collapsed);
        }
        this.setState({collapsed: !this.state.collapsed});
    }

    render() {
        return (
            <TouchableOpacity onPress={()=> this._toggleHeader()}>
                <View style={styles.container}>
                    <Text style={styles.label}>{this.props.title}</Text>
                    <Icon
                        name={this.state.collapsed? 'ios-arrow-down':'ios-arrow-forward'}
                        style={styles.arrow}
                    />
                </View>
            </TouchableOpacity>
        );
    }
};

ActionSectionHeader.propTypes = {
    title: React.PropTypes.string.isRequired,
    onToggle: React.PropTypes.func
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        color: '#999',
        fontSize: 14
    },
    arrow: {
        marginLeft: 8,
        color: '#999'
    }
});

module.exports = ActionSectionHeader;
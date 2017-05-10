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
import { Icon, View, RoundedCornerShadowView } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

const UpButton = ({item, onPress}) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="caret-up" size={30}
            style={{
                color: item.isInState === 'UP' ? '#1a355b' : '#eeeeee'
            }}
        />
    </TouchableOpacity>
);

const DownButton = ({item, onPress}) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="caret-down" size={30}
            style={{
                color: item.isInState === 'DOWN' ? '#1a355b' : '#eeeeee'
            }}
        />
    </TouchableOpacity>
);

const StopButton = ({item, onPress}) => (
    <TouchableOpacity
        style={styles.navigationButton}
        onPress={onPress}>
        <Icon name="stop" size={20}
            style={{
                color: item.isInState === 'STOP' ? '#1a355b' : '#eeeeee'
            }}
        />
    </TouchableOpacity>
);

class NavigationalButton extends View {
    constructor(props) {
        super(props);
    }

    render() {
        const { UP, DOWN, STOP } = this.props.item.supportedMethods;
        const upButton = UP ? <UpButton item={this.props.item} onPress={this.props.onUp} /> : null;
        const downButton = DOWN ? <DownButton item={this.props.item} onPress={this.props.onDown} /> : null;
        const stopButton = STOP ? <StopButton item={this.props.item} onPress={this.props.onStop} /> : null;

        return (
            <RoundedCornerShadowView style={styles.container}>
                { upButton }
                { downButton }
                { stopButton }
            </RoundedCornerShadowView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:7,
        height:32,
        justifyContent:'center',
        alignItems:'center'
    },
    navigationButton: {
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
});

module.exports = NavigationalButton;

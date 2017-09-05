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
import { StyleSheet, Dimensions } from 'react-native';
import { View, Text, Image} from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons'
const { width, height } = Dimensions.get('window');
const screenWidth = width;

class MapOverlay extends View {

    constructor(props) {
        super(props);

        this.state = {
            hr: 0,
            min: 0
        }
        this.hrs = [];
        this.mins = [];
        for (var i = 0; i < 24; i++) {
            this.hrs.push(i);
        }
        for (i = 0; i < 60; i++) {
            this.mins.push(i);
        }

    }

    render() {
        var width = this.props.width || screenWidth;
        return (
            <View
                style={styles.mapOverlay}
                pointerEvents={'none'}
            >
                <View style={styles.mapSpacer} />
                <Image
                    source={require('../img/mapOverlay.png')}
                    style={{width: width, height: width, opacity: 0.3}}
                    resizeMode={'stretch'}
                />
                <View style={styles.mapSpacer} />
                <View
                    style={styles.markerOverlay}
                    pointerEvents={'none'}
                >
                    <Icon
                        name={'place'}
                        style={styles.marker}
                    />
                </View>
            </View>
        );
    }
};

MapOverlay.propTypes = {
    width: React.PropTypes.number

};

const styles = StyleSheet.create({
    mapOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    markerOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    marker: {
        color: '#1B365D',
        fontSize: 40,
        backgroundColor: 'rgba(0,0,0,0)'
    },
    mapCircle: {
        width: screenWidth,
        height: screenWidth,
        opacity: 0.3
    },
    mapSpacer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)'
    }
});

module.exports = MapOverlay;
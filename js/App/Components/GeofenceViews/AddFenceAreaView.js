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
 * @providesModule AddFenceAreaView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { View, Text, Header, Button, Image, BackButton } from 'BaseComponents';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import GeoUtils from 'GeoUtils';
import { MapOverlay, BrownHeader } from 'Geofence_SubViews';
import { setFenceArea } from 'Actions_Geofence';

class AddFenceAreaView extends View {

    constructor(props) {
        super(props);

        this.state = {
            region: {
                latitude: this.props.fences.location.latitude,
                longitude: this.props.fences.location.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
            },
        };

        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
        this.toArriving = this.toArriving.bind(this);
        this.onBack = this.onBack.bind(this);
    }

    componentDidMount() {
    }

    onBack() {
        this.props.navigation.dispatch(NavigationActions.back());
    }

    onRegionChangeComplete(region) {
        this.setState({ region });
        console.log(GeoUtils.getRadiusFromRegion(region));
    }

    toArriving() {
        const {latitude, longitude, latitudeDelta, longitudeDelta} = this.state.region;
        this.props.setFenceArea(latitude, longitude, GeoUtils.getRadiusFromRegion(this.state.region));
        this.props.navigation.navigate('AddFenceArriving');
    }

    render() {
        return (
            <View>
                <Header
                    leftButton={
                        {
                            title: 'Back',
                            onPress: this.onBack
                        }
                    }
                />
                <BrownHeader
                    title={'1. Area'}
                    description={'Select Area'}
                />
                <View style={{ flex: 1 }}>
                    <MapView
                        style={styles.map}
                        initialRegion={this.state.region}
                        onRegionChangeComplete={(region) => this.onRegionChangeComplete(region)}
                    >
                    </MapView>
                    <MapOverlay />
                </View>
                <ActionButton
                    onPress={() => this.toArriving()}
                    buttonColor="rgba(226,105,1,1)"
                    icon={
                        <Icon
                            name={'chevron-right'}
                            style={styles.actionButtonIcon}
                        />
                    }
                />
            </View>
        );
    }
};


const styles = StyleSheet.create({
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    map: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    }
});
function mapStateToProps(state, props) {
    return {
        devices: state.devices,
        fences: state.fences
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        setFenceArea: (lat, lng, rad)=> dispatch(setFenceArea(lat, lng, rad))
    };
}
module.exports = connect(mapStateToProps, mapDispatchToProps)(AddFenceAreaView);
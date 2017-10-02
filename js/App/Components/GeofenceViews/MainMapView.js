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
 * @providesModule MainMapView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { View, Text, Header, Button, Icon } from 'BaseComponents';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import { FenceCallout } from 'Geofence_SubViews';
import { setEditFence, clearFences, resetFence } from 'Actions_Geofence';
import { activateEvent } from 'Actions_Events';
import { activateJob } from 'Actions_Jobs';

class MainMapView extends View {

    constructor(props) {
        super(props);

        this.state = {
            region: {
                latitude: this.props.location ? this.props.location.latitude : 0,
                longitude: this.props.location ? this.props.location.longitude : 0,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
            },
            activeFenceIndex: -1,
        }

        this.onEditFence = this.onEditFence.bind(this);
        this.onAddFence = this.onAddFence.bind(this);
    }

    componentDidMount() {
        // this.props.clearFences();
    }

    onRegionChange(region) {
        this.setState({ region });
    }

    onEditFence(index) {
        console.log('callout index: ', index);
        this.props.setEditFence(index);
        this.props.navigation.navigate('EditFenceMain');
        this.setState({activeFenceIndex: -1});
    }

    onAddFence() {
        this.props.resetFence();
        this.props.navigation.navigate('AddFenceArea');
    }

    setActiveFence(index) {
        const fence = this.props.fences[index];
        console.log('active fence: ', fence);
        this.setState({ activeFenceIndex: index });
    }

    renderMarker(fence, index) {
        return (
            <MapView.Marker
                image={require('./img/marker.png')}
                title={'Home'}
                coordinate={{ latitude: fence.latitude, longitude: fence.longitude }}
                onPress={() => this.setActiveFence(index)}
            >
                <MapView.Callout onPress={()=> this.onEditFence(index)}>
                    <FenceCallout
                        title={fence.title}
                        onEdit={()=> this.onEditFence(index)}
                    />
                </MapView.Callout>
            </MapView.Marker>
        );
    }

    render() {
        
        const {devices, events, jobs} = this.props;
        return (
            <View>
                <Header />
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={this.state.region}
                >
                    {
                        this.props.fences.map((fence, index) => {
                            return this.renderMarker(fence, index);
                        })
                    }
                    {
                        (this.state.activeFenceIndex < 0) ? null : (
                            <MapView.Circle
                                key={`fence-${this.state.activeFenceIndex}`}
                                center={{
                                    latitude: this.props.fences[this.state.activeFenceIndex].latitude,
                                    longitude: this.props.fences[this.state.activeFenceIndex].longitude
                                }}
                                radius={this.props.fences[this.state.activeFenceIndex].radius * 1000}
                                fillColor="rgba(226, 105, 1, 0.3)"
                                strokeColor="rgba(226, 105, 1, 1)"
                            />
                        )
                    }

                </MapView>
                <ActionButton
                    onPress={() => this.onAddFence()}
                    buttonColor="rgba(226,105,1,1)"
                />

            </View>
        );
    }
};


const styles = StyleSheet.create({
    actionButtonIcon: {
        fontSize: 16,
        height: 22,
        color: 'white',
    },
});


function mapStateToProps(state, props) {
    return {
        devices: state.devices,
        events: state.events,
        jobs: state.jobs,
        fences: state.fences.fences,
        location: state.fences.location
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        setEditFence: (index) => dispatch(setEditFence(index)),
        clearFences: () => dispatch(clearFences()),
        resetFence: () => dispatch(resetFence()),
        activateEvent: (eventId, isActive) => dispatch(activateEvent(eventId, isActive)),
        activateJob: (jobId, isActive) => dispatch(activateJob(jobId, isActive))
    };
}


module.exports = connect(mapStateToProps, mapDispatchToProps)(MainMapView);

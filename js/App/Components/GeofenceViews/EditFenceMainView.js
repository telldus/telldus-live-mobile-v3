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
 * @providesModule EditFenceMainView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, ScrollView, Dimensions, TextInput, TouchableOpacity, Switch } from 'react-native';
import {connect} from 'react-redux';
import { View, Text, Header, Button, Image, List, ListItem } from 'BaseComponents';
import { NavigationActions } from 'react-navigation';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GeoUtils from 'GeoUtils';
import { BrownHeader, MapOverlay, TimePicker } from 'Geofence_SubViews';
import { updateFence, deleteFence, setFenceTitle, setFenceArea, setFenceActiveTime } from 'Actions_Geofence';

const { width, height } = Dimensions.get('window');
const screenWidth = width;

class EditFenceMainView extends View {

    constructor(props) {
        super(props);
        const {fence} = this.props.fences;
        var lngDelta = GeoUtils.getLngDeltaFromRadius(fence.latitude, fence.longitude, fence.radius);
        this.state = {
            region: {
                latitude: fence.latitude,
                longitude: fence.longitude,
                latitudeDelta: lngDelta/2,
                longitudeDelta: lngDelta,
            },
            title: fence.title,
            alwaysActive: fence.isAlwaysActive,
            fromHr: fence.fromHr,
            fromMin: fence.fromMin,
            toHr: fence.toHr,
            toMin: fence.toMin
            // fence: this.props.fences
        };
        
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onChangeTime = this.onChangeTime.bind(this);
        this.toArriving = this.toArriving.bind(this);
        this.toLeaving = this.toLeaving.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

    }

    onTitleChange(text) {
        this.setState({title: text});
    }

    onRegionChangeComplete(region) {
        this.setState({ region });
        console.log(region, this.props.fences.fence);
    }

    onChangeTime(alwaysActive, fromHr, fromMin, toHr, toMin) {
        this.setState({alwaysActive: alwaysActive, fromHr: fromHr, fromMin: fromMin, toHr: toHr, toMin: toMin});
    }

    onBack() {
        this.props.navigation.dispatch(NavigationActions.back());
    }

    toArriving() {
        this.props.navigation.navigate('EditFenceArriving');
    }

    toLeaving() {
        this.props.navigation.navigate('EditFenceLeaving');
    }

    onDelete() {
        this.props.deleteFence();
        this.props.navigation.dispatch(NavigationActions.back());        
    }

    onUpdate() {
        const {latitude, longitude, latitudeDelta, longitudeDelta} = this.state.region;
        var {alwaysActive, fromHr, fromMin, toHr, toMin} = this.state;
        this.props.setFenceActiveTime(alwaysActive, fromHr, fromMin, toHr, toMin);
        this.props.setFenceArea(latitude, longitude, GeoUtils.getRadiusFromRegion(this.state.region));
        this.props.setFenceTitle(this.state.title);
        this.props.updateFence();
        this.props.navigation.goBack();
    }

    render() {
        var fence = this.props.fences.fence;
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
                <ScrollView>
                    <BrownHeader
                        title={`Edit ${fence.title}`}
                        description={'Edit or delete geo fence'}
                    />
                    <View style={[styles.listItem, { marginTop: 20 }]}>
                        <Text style={styles.listLabel}>Name</Text>
                        <TextInput 
                            style={styles.nameInput} 
                            value={this.state.title}
                            onChangeText={this.onTitleChange}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={this.toArriving}
                    >
                        <View style={styles.listItem}>
                            <Text style={styles.listLabel}>Arriving Actions</Text>
                            <Icon
                                style={styles.arrowIcon}
                                name={'chevron-right'}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.toLeaving}
                    >
                        <View style={styles.listItem}>
                            <Text style={styles.listLabel}>Leaving Actions</Text>
                            <Icon
                                style={styles.arrowIcon}
                                name={'chevron-right'}
                            />
                        </View>
                    </TouchableOpacity>


                    <TimePicker
                        onChange={this.onChangeTime}
                        value={{
                            alwaysActive: fence.isAlwaysActive,
                            fromHr: fence.fromHr,
                            fromMin: fence.fromMin,
                            toHr: fence.toHr,
                            toMin: fence.toMin
                        }}
                    />

                    <View style={{ padding: 12 }}>
                        <Text style={{ color: '#999' }}>Area</Text>
                        <View>
                            <MapView
                                style={styles.map}
                                initialRegion={this.state.region}
                                onRegionChangeComplete={(region) => this.onRegionChangeComplete(region)}
                            >
                            </MapView>
                            <MapOverlay
                                width={screenWidth - 24}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => this.onUpdate()}
                        >
                            <View style={[styles.roundedBtn, { backgroundColor: 'rgba(226,105,1,1)', marginTop: 24 }]}>
                                <Text style={styles.btnText}>CONFIRM & SAVE</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.onDelete}
                        >
                            <View style={[styles.roundedBtn, { backgroundColor: '#D32F2F', marginTop: 12 }]}>
                                <Text style={styles.btnText}>DELETE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
        width: '100%',
        height: screenWidth - 12
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        padding: 12,
        backgroundColor: '#FFF',
        borderColor: '#BBB',
        borderBottomWidth: 1,

    },
    listLabel: {
        flex: 1,
        fontSize: 14,
        color: '#333'
    },
    nameInput: {
        flex: 1,
        color: '#777',
        textAlign: 'right'
    },
    arrowIcon: {
        color: '#777',
        fontSize: 24,
    },
    roundedBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: 224,
        height: 48,
        borderRadius: 24
    },
    btnText: {
        fontSize: 14,
        color: '#FFF'
    }
});

function mapStateToProps(state, props) {
    return {
        fences: state.fences
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        deleteFence: ()=> dispatch(deleteFence()),
        updateFence: () => dispatch(updateFence()),
        setFenceArea: (latitude, longitude, radius) => dispatch(setFenceArea(latitude, longitude, radius)),
        setFenceTitle: (title) => dispatch(setFenceTitle(title)),
        setFenceActiveTime: (alwaysActive, fromHr, fromMin, toHr, toMin) => dispatch(setFenceActiveTime(alwaysActive, fromHr, fromMin, toHr, toMin))
    }
}
module.exports = connect(mapStateToProps, mapDispatchToProps)(EditFenceMainView);
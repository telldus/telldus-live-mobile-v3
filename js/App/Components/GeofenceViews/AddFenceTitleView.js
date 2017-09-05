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
 * @providesModule AddFenceTitleView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import { View, Text, Header, Button, Image } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import {BrownHeader, FenceNameInput} from 'Geofence_SubViews';
import { setFenceTitle, saveFence } from 'Actions_Geofence'; 
import { getUserProfile } from '../../Reducers/User';

class AddFenceTitleView extends View {

    constructor(props) {
        super(props);

        this.state = {
            title: ''
        };

        this.onChangeText = this.onChangeText.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onSaveFence = this.onSaveFence.bind(this);
    }

    componentDidMount() {
        alert(JSON.stringify(this.props.fences.fence));
    }

    onChangeText(text) {
        this.setState({title: text});
    }

    onBack() {
        this.props.navigation.goBack();
    }

    onSaveFence() {
        this.props.setFenceTitle(this.state.title);  
        this.props.saveFence();  
        this.props.navigation.dispatch(NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: 'MainMap'})
            ]
        }));
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
                    title={'5. Name'}
                    description={'Select a name for your area'}
                />
                <View style={styles.nameContainer}>
                    <Text style={styles.nameLabel}>Name: </Text>
                </View>
                <FenceNameInput 
                    onChangeText={this.onChangeText}
                />
                <ActionButton
                    buttonColor="rgba(226,105,1,1)"
                    icon={
                        <Icon
                            name={'check'}
                            style={styles.actionButtonIcon}
                        />
                    }
                    onPress={this.onSaveFence}
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
    nameContainer: {
        height: 36,
        paddingLeft: 12,
        justifyContent: 'center'
    },
    nameLabel: {
        color: '#999',
        fontSize: 14
    },
    map: {
        width: '100%',
        height: 300
    }
});


function mapStateToProps(state, props) {
    return {
        userProfile: getUserProfile(state),
        devices: state.devices,
        events: state.events,
        jobs: state.jobs,
        fences: state.fences
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        setFenceTitle: (title)=> dispatch(setFenceTitle(title)),
        saveFence: ()=> dispatch(saveFence())
    };
}


module.exports = connect(mapStateToProps, mapDispatchToProps)(AddFenceTitleView);

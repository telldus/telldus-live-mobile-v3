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
 * @providesModule AddFenceTimeView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { View, Text, Header, Button, Image } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import AlwaysActiveSwtich from 'AlwaysActiveSwitch';
import { BrownHeader, TimePicker } from 'Geofence_SubViews';
import { getUserProfile } from '../../Reducers/User';
import { setFenceActiveTime } from 'Actions_Geofence';

class AddFenceTimeView extends View {

    constructor(props) {
        super(props);

        this.state = {
            alwaysActive: true,
            fromHr: 0,
            fromMin: 0,
            toHr: 0,
            toMin: 0
        };

        this.onBack = this.onBack.bind(this);        
        this.toTitle = this.toTitle.bind(this);
        this.onChangeTime = this.onChangeTime.bind(this);
    }

    componentDidMount() {
        alert(JSON.stringify(this.props.fence));
    }

    onBack() {
        this.props.navigation.goBack();
    }

    toTitle() {
        var {alwaysActive, fromHr, fromMin, toHr, toMin} = this.state;
        this.props.setFenceActiveTime(alwaysActive, fromHr, fromMin, toHr, toMin);
        this.props.navigation.navigate('AddFenceTitle');
    }

    onChangeTime(alwaysActive, fromHr, fromMin, toHr, toMin) {
        this.setState({alwaysActive: alwaysActive, fromHr: fromHr, fromMin: fromMin, toHr: toHr, toMin: toMin});
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
                <ScrollView>
                    <BrownHeader
                        title={'4. Active time'}
                        description={'Select time for fence to be active'}
                    />
                    <TimePicker 
                        onChange={this.onChangeTime}
                    />
                </ScrollView>
                <ActionButton
                    buttonColor="rgba(226,105,1,1)"
                    icon={<Icon
                        name={'chevron-right'}
                        style={styles.actionButtonIcon}
                    />}
                    onPress={this.toTitle}
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
    body: {
        paddingTop: 36,
        backgroundColor: '#EEE',
    },
    pickers: {
        padding: 12
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
        fence: state.fences.fence
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setFenceActiveTime: (alwaysActive, fromHr, fromMin, toHr, toMin) => dispatch(setFenceActiveTime(alwaysActive, fromHr, fromMin, toHr, toMin)),
        dispatch,
    };
}


module.exports = connect(mapStateToProps, mapDispatchToProps)(AddFenceTimeView);

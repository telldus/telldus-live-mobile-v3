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
 * @providesModule EditFenceLeavingView
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { View, Text, Header, Button, Icon, Image } from 'BaseComponents';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import { setFenceLeavingActions } from 'Actions_Geofence';
import { BrownHeader, ActionSectionHeader, DeviceRow, EventRow, JobRow } from 'Geofence_SubViews';
import { getUserProfile } from '../../Reducers/User';

class EditFenceLeavingView extends View {

    constructor(props) {
        super(props);
        var initialValue = JSON.parse(JSON.stringify(this.props.fence));
        this.state = {
            devices: initialValue.leaving ? initialValue.leaving.devices : {},
            events: initialValue.leaving ? initialValue.leaving.events : {},
            schedules: initialValue.leaving ? initialValue.leaving.schedules : {},
            showDevices: false,
            showEvents: false,
            showJobs: false
        };

        this.save = this.save.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onDeviceValueChange = this.onDeviceValueChange.bind(this);
        this.onEventValueChange = this.onEventValueChange.bind(this);
        this.onJobValueChange = this.onJobValueChange.bind(this);

    }

    onBack() {
        this.props.navigation.goBack();
    }

    save() {
        this.props.onSave({
            devices: this.state.devices,
            events: this.state.events,
            schedules: this.state.schedules
        });
        this.props.navigation.goBack();
    }

    componentWillUnmount() {
    }

    onDeviceValueChange(checked, deviceId, supportedMethods, state, value) {
        var devices = this.state.devices;

        if (checked) {
            devices[deviceId] = {
                supportedMethods: supportedMethods,
                state: state,
                value: value
            };
            this.setState({
                devices: devices
            });
        } else {
            if (devices[deviceId]) delete devices[deviceId];
            this.setState({
                devices: devices
            });
        }
    }

    onEventValueChange(eventId, isChecked, isActive) {
        const { events } = this.state;

        if (isChecked) {
            events[eventId] = { active: isActive };
        } else {
            if (events[eventId]) delete events[eventId];
        }
        this.setState({ events: events });
    }

    onJobValueChange(jobId, isChecked, isActive) {
        const { schedules } = this.state;

        if (isChecked) {
            schedules[jobId] = { active: isActive };
        } else {
            if (schedules[jobId]) delete schedules[jobId];
        }
        this.setState({ schedules: schedules });
    }

    renderDevice(device) {
        var value = this.state.devices[device.id];
        return (
            <DeviceRow device={device}
                onCheck={(checked) => { console.log(checked); }}
                onValueChange={this.onDeviceValueChange}
                value={value}
            />
        );
    }

    renderEvent(event) {
        var value = this.state.events[event.id];
        return (
            <EventRow
                event={event}
                onValueChange={this.onEventValueChange}
                value={value}
            />
        )
    }

    renderJob(job) {
        var value = this.state.schedules[job.id];
        var device = this.props.devices.byId[job.deviceId];
        return (
            <JobRow
                job={job}
                device={device}
                onValueChange={this.onJobValueChange}
                value={value}
            />
        )
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
                        title={'Leaving actions'}
                        description={'Select actions for when you leave'}
                    />
                    <View
                        style={styles.body}
                    >
                        <ActionSectionHeader title="Devices"
                            onToggle={(collapsed) => this.setState({ showDevices: collapsed })}
                        />
                        {
                            (this.state.showDevices) ? (
                                this.props.devices.allIds.map((deviceId) => {
                                    var device = this.props.devices.byId[deviceId];
                                    return this.renderDevice(device);
                                })) : null
                        }
                        <ActionSectionHeader title="Events"
                            onToggle={(collapsed) => this.setState({ showEvents: collapsed })}
                        />
                        {
                            (this.state.showEvents) ? (
                                this.props.events.map((event) => {
                                    return this.renderEvent(event);
                                })) : null
                        }
                        <ActionSectionHeader title="Schedules"
                            onToggle={(collapsed) => this.setState({ showJobs: collapsed })}
                        />
                        {
                            (this.state.showJobs) ? (
                                this.props.jobs.map((job) => {
                                    return this.renderJob(job);
                                })) : null
                        }
                    </View>
                </ScrollView>
                <ActionButton
                    buttonColor="rgba(226,105,1,1)"
                    icon={<Icon
                        style={styles.actionButtonIcon}
                        name={'check'}
                    />}
                    onPress={this.save}
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
        padding: 12
    },
});


function mapStateToProps(state, props) {
    return {
        userProfile: getUserProfile(state),
        devices: state.devices,
        events: state.events,
        jobs: state.jobs,
        fence: state.fences.fence
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSave: (actions) => dispatch(setFenceLeavingActions(actions)),
        dispatch,
    };
}


module.exports = connect(mapStateToProps, mapDispatchToProps)(EditFenceLeavingView);

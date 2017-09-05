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
 *
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, TouchableOpacity, Switch, Picker } from 'react-native';
import { View, Text, Image, H1, H2 } from 'BaseComponents';
import Icon from 'react-native-vector-icons/MaterialIcons'

class TimePicker extends View {

    constructor(props) {
        super(props);

        this.state = {
            alwaysActive: this.props.value? this.props.value.alwaysActive : true,
            fromHr: this.props.value? this.props.value.fromHr : 0,
            fromMin: this.props.value? this.props.value.froMin :  0,
            toHr: this.props.value ? this.props.value.toHr : 0,
            toMin: this.props.value? this.props.value.toMin : 0
        };

        this.hrs = [];
        this.mins = [];
        for (var i = 0; i < 24; i++) {
            this.hrs.push(i);
        }
        for (i = 0; i < 60; i++) {
            this.mins.push(i);
        }

        this.onSwitch = this.onSwitch.bind(this);
        this.onChangeFromHr = this.onChangeFromHr.bind(this);
        this.onChangeFromMin = this.onChangeFromMin.bind(this);
        this.onChangeToHr = this.onChangeToHr.bind(this);
        this.onChangeToMin = this.onChangeToMin.bind(this);

    }

    onSwitch(value) {
        if (value) {
            this.setState({ alwaysActive: value, fromHr: 0, fromMin: 0, toHr: 0, toMin: 0 });
            this.props.onChange(true, 0, 0, 0, 0);
        } else {
            this.setState({ alwaysActive: false, fromHr: 0, fromMin: 0, toHr: 0, toMin: 0 });
            this.props.onChange(false, 0, 0, 0, 0);
        }
    }

    onChangeFromHr(value) {
        const {fromHr, fromMin, toHr, toMin} = this.state;
        this.setState({fromHr: value});
        this.props.onChange(false, value, fromMin, toHr, toMin);
    }

    onChangeFromMin(value) {
        const {fromHr, fromMin, toHr, toMin} = this.state;
        this.setState({fromMin: value});
        this.props.onChange(false, fromHr, value, toHr, toMin);
    }

    onChangeToHr(value) {
        const {fromHr, fromMin, toHr, toMin} = this.state;
        this.setState({toHr: value});
        this.props.onChange(false, fromHr, fromMin, value, toMin);
    }

    onChangeToMin(value) {
        const {fromHr, fromMin, toHr, toMin} = this.state;
        this.setState({toMin: value});
        this.props.onChange(false, fromHr, fromMin, toHr, value);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.switchHeader}>
                    <Text style={styles.switchLabel}>Always Active</Text>
                    <Switch
                        value={this.state.alwaysActive}
                        onValueChange={this.onSwitch}
                    />
                </View>
                {
                    (this.state.alwaysActive) ? null : (

                        <View style={styles.body}>
                            <Text style={styles.sectionLabel}>{'Active from'}</Text>
                            <View
                                style={styles.pickers}
                            >
                                <Picker
                                    selectedValue={this.state.fromHr}
                                    onValueChange={this.onChangeFromHr}
                                    style={styles.picker}
                                >
                                    {
                                        this.hrs.map((hr, index) => (
                                            <Picker.Item label={'' + hr} value={hr} key={'fromHr-' + hr} />
                                        ))
                                    }
                                </Picker>
                                <Picker
                                    selectedValue={this.state.fromMin}
                                    onValueChange={this.onChangeFromMin}
                                    style={styles.picker}
                                >
                                    {
                                        this.mins.map((min, index) => (
                                            <Picker.Item label={'' + min} value={min} key={'fromMin-' + min} />
                                        ))
                                    }
                                </Picker>
                            </View>
                            <Text style={styles.sectionLabel}>{'Active to'}</Text>
                            <View
                                style={styles.pickers}
                            >
                                <Picker
                                    selectedValue={this.state.toHr}
                                    onValueChange={this.onChangeToHr}
                                    style={styles.picker}
                                >
                                    {
                                        this.hrs.map((hr, index) => (
                                            <Picker.Item label={'' + hr} value={hr} key={'toHr-' + hr} />
                                        ))
                                    }
                                </Picker>
                                <Picker
                                    selectedValue={this.state.toMin}
                                    onValueChange={this.onChangeToMin}
                                    style={styles.picker}
                                >
                                    {
                                        this.mins.map((min, index) => (
                                            <Picker.Item label={'' + min} value={min} key={'toMin-' + min} />
                                        ))
                                    }
                                </Picker>
                            </View>
                        </View>
                    )
                }
            </View>
        );
    }
};

TimePicker.propTypes = {
    // title: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
};

const styles = StyleSheet.create({
    container: {
    },

    switchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        padding: 12,
        backgroundColor: '#FFF',
        borderColor: '#BBB',
        borderBottomWidth: 1,

    },
    switchLabel: {
        flex: 1,
        fontSize: 14,
        color: '#333'
    },

    body: {
        padding: 12
    },
    sectionLabel: {
        marginTop: 8,
        fontSize: 14,
        color: '#999'
    },
    pickers: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8
    },
    picker: {
        flex: 1,
        backgroundColor: '#FFF',
    }
});

module.exports = TimePicker;
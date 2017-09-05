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

// @flow

'use strict';

import React from 'react';

import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';
import { StyleSheet, Switch } from 'react-native';
import CheckBox from 'react-native-check-box';
import Theme from 'Theme';

const weekdayStrs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


class JobRow extends View {

    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.value ? true : false,
            isActive: this.props.value? this.props.value.active : false
        };

        this.onCheck = this.onCheck.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    onCheck() {
        const { job } = this.props;
        if (this.state.checked) { //click to deselect
            this.props.onValueChange(job.id, false, false);
            this.setState({ checked: false, isActive: false });
        } else { //click to select
            this.props.onValueChange(job.id, true, true);
            this.setState({ checked: true, isActive: true });
        }
    }

    onValueChange(jobId, isActive) {
        if (this.props.onValueChange) {
            this.props.onValueChange(jobId, true, isActive);
        }
        this.setState({isActive: isActive});
    };

    render() {
        const { job, device } = this.props;
        
        var dayStrs = [];
        for(var i=0; i<job.weekdays.length; i++) {
            dayStrs.push(weekdayStrs[job.weekdays[i] - 1]);
        }
        var daysStr = dayStrs.join(',');
        console.log(daysStr);

        return (
            <ListItem style={[Theme.Styles.rowFront, { marginTop: 8 }]}>
                <Container style={styles.container}>
                    <CheckBox
                        checkBoxColor={this.state.checked ? 'rgba(226,105,1,1)' : '#999'}
                        isChecked={this.state.checked}
                        onClick={this.onCheck}
                    />
                    <View style={styles.name}>
                        <Text style={[this.state.checked ? styles.titleActive : styles.titleInactive]}>
                            {device.name? device.name : '(no name)'}
                        </Text>
                        <Text style={styles.text}>At {job.hour}:{job.minute} - {daysStr}</Text>
                    </View>
                    {
                        this.state.checked ? (
                            <Switch
                                value={this.state.isActive}
                                onValueChange={(value) => this.onValueChange(job.id, value)}
                            />
                        ) : null
                    }
                </Container>
            </ListItem>
        );
    }
}

JobRow.propTypes = {
    value: React.PropTypes.object,
    onValueChange: React.PropTypes.func.isRequired
};
const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        flex: 20,
        justifyContent: 'center',
        marginLeft: 8,        
    },
    titleActive: {
        color: 'rgba(226,105,1,1)',
        fontSize: 20,
        textAlignVertical: 'center',
    },
    titleInactive: {
        color: '#999',
        fontSize: 20,
        textAlignVertical: 'center',
    },
    text: {
        color: '#999'
    }
});

module.exports = JobRow;

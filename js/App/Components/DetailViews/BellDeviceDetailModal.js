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
import { connect } from 'react-redux';

import { Text, RoundedCornerShadowView, View, Icon } from 'BaseComponents';
import { TouchableOpacity } from 'react-native';
import  DeviceDetailModal from './DeviceDetailModal';

import { bell, learn} from 'Actions/Devices';

const BellButton = ({onBell}) => (
    <RoundedCornerShadowView style={{height:36, marginHorizontal:8, marginVertical:16, justifyContent:'center', alignItems:'center'}}>
        <Icon
			name="bell"
			size={26}
			color="orange"
			onPress={ onBell }
		/>
    </RoundedCornerShadowView>
);

const LearnButton = ({onLearn}) => (
    <RoundedCornerShadowView style={{
        height:36,
        marginHorizontal:8,
        marginVertical:8,
        justifyContent:'center',
        alignItems:'center'}}>
        <TouchableOpacity onPress={onLearn}>
            <Text style={{fontSize:16, color:'orange'}}>
                {'Learn'}
            </Text>
        </TouchableOpacity>
    </RoundedCornerShadowView>
);

class BellDeviceDetailModal extends View {

    constructor(props) {
		super(props);
        this.onBell = this.onBell.bind(this);
	}

    onBell() {
        this.props.onBell(this.props.deviceId);
    }

	render() {
        let hasLearnButton = false;
        let hasBellButton = false;
        let bellButton = null;
        let learnButton = null;

        const device = this.props.store.devices.find(item => item.id === this.props.deviceId);
        if (device) {
            const { BELL, LEARN } = device.supportedMethods;
            hasBellButton = BELL;
            hasLearnButton = LEARN;
        }

        if (hasBellButton) {
            bellButton = <BellButton onBell={this.onBell} />;
        }

        if (hasLearnButton) {
            learnButton = <LearnButton onLearn={this.onLearn} />;
        }

		return (
            <DeviceDetailModal
                isVisible={this.props.isVisible}
                onCloseSelected={this.props.onCloseSelected}
                deviceId={this.props.deviceId}>
                {bellButton}
                {learnButton}
            </DeviceDetailModal>
		);
	}
}

BellDeviceDetailModal.propTypes = {
	onCloseSelected: React.PropTypes.func.isRequired,
    deviceId: React.PropTypes.number.isRequired
};

function select(store) {
    return { store };
}

function actions(dispatch) {
	return {
		onBell: (id) => dispatch(bell(id)),
		onLearn: (id) => dispatch(learn(id))
	};
}

module.exports = connect(select, actions)(BellDeviceDetailModal);

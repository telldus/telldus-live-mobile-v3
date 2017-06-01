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

import { RoundedCornerShadowView, Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { OnButton, OffButton } from 'TabViews/SubViews';

import { turnOn, turnOff, learn, requestTurnOn, requestTurnOff } from 'Actions/Devices';

const ToggleButton = ({ device, onTurnOn, onTurnOff }) => {
  return (
    <RoundedCornerShadowView style={styles.toggleContainer}>
      <OffButton isInState={device.isInState} fontSize={16} onPress={onTurnOff} style={styles.turnOff} methodRequested={device.methodRequested} />
      <OnButton isInState={device.isInState} fontSize={16} onPress={onTurnOn} style={styles.turnOn} methodRequested={device.methodRequested} />
    </RoundedCornerShadowView>
  );
};

const LearnButton = ({ device, onLearn }) => (
	<RoundedCornerShadowView style={styles.learnContainer}>
		<TouchableOpacity onPress={onLearn} style={styles.learnButton}>
			<Text style={styles.learnText}>
				{'Learn'}
			</Text>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

class ToggleDeviceDetailModal extends View {

  constructor(props) {
    super(props);

    this.onTurnOn = this.onTurnOn.bind(this);
    this.onTurnOff = this.onTurnOff.bind(this);
    this.onLearn = this.onLearn.bind(this);
  }

  onTurnOn() {
    this.props.onTurnOn(this.props.device.id);
    this.props.requestTurnOn(this.props.device.id);
  }

  onTurnOff() {
    this.props.onTurnOff(this.props.device.id);
    this.props.requestTurnOff(this.props.device.id);
  }

  onLearn() {
    this.props.onLearn(this.props.device.id);
  }

  render() {
    const { device } = this.props;
    const { TURNON, TURNOFF, LEARN } = device.supportedMethods;

    let toggleButton = null;
    let learnButton = null;

    if (TURNON || TURNOFF) {
      toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} />;
    }

    if (LEARN) {
      learnButton = <LearnButton device={device} onLearn={this.onLearn} />;
    }

    return (
			<View style={styles.container}>
				{toggleButton}
				{learnButton}
			</View>
    );
  }

}

ToggleDeviceDetailModal.propTypes = {
  device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    height: 36,
    marginHorizontal: 8,
    marginVertical: 16,
  },
  turnOff: {
    flex: 1,
    alignItems: 'stretch',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  turnOn: {
    flex: 1,
    alignItems: 'stretch',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  learnContainer: {
    height: 36,
    marginHorizontal: 8,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnText: {
    fontSize: 16,
    color: 'orange',
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onTurnOn: (id) => dispatch(turnOn(id)),
    onTurnOff: (id) => dispatch(turnOff(id)),
    onLearn: (id) => dispatch(learn(id)),
    requestTurnOn: (id) => dispatch(requestTurnOn(id)),
    requestTurnOff: (id) => dispatch(requestTurnOff(id)),
  };
}

module.exports = connect(null, mapDispatchToProps)(ToggleDeviceDetailModal);

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

import React, { PropTypes } from 'react';
import { View, RoundedCornerShadowView } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import OnButton from './OnButton';
import OffButton from './OffButton';

class ToggleButton extends View {
  constructor(props) {
    super(props);

    this.onTurnOn = this.onTurnOn.bind(this);
    this.onTurnOff = this.onTurnOff.bind(this);
  }

  onTurnOn() {
    this.props.onTurnOn();
  }

  onTurnOff() {
    this.props.onTurnOff();
  }

  render() {
    const { TURNON, TURNOFF } = this.props.device.supportedMethods;
    const isInState = this.props.device.isInState;

    const onButton = <OnButton isInState={isInState} enabled={!!TURNON} onPress={this.onTurnOn} />;
    const offButton = <OffButton isInState={isInState} enabled={!!TURNOFF} onPress={this.onTurnOff} />;

    return (
      <RoundedCornerShadowView style={styles.container} hasShadow={!!TURNON || !!TURNOFF}>
        { offButton }
        { onButton }
      </RoundedCornerShadowView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 7,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

ToggleButton.propTypes = {
  onTurnOn: PropTypes.func,
  onTurnOff: PropTypes.func,
  device: PropTypes.object,
  enabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
  enabled: true,
};

module.exports = ToggleButton;

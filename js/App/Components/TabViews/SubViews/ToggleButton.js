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

type Props = {
  device: Object,
};

class ToggleButton extends View {
  props: Props;

  render() {
    const { TURNON, TURNOFF } = this.props.device.supportedMethods;
    const { id, isInState, methodRequested } = this.props.device;

    const onButton = <OnButton id={id} isInState={isInState} enabled={!!TURNON} style={styles.turnOn} methodRequested={methodRequested} />;
    const offButton = <OffButton id={id} isInState={isInState} enabled={!!TURNOFF} style={styles.turnOff} methodRequested={methodRequested} />;

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
});

ToggleButton.propTypes = {
  device: PropTypes.object,
  enabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
  enabled: true,
};

module.exports = ToggleButton;

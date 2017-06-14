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

import React, { PropTypes } from 'react';
import { Text, View, RoundedCornerShadowView } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';

const OffButton = ({ isInState, enabled, onPress }) => (
    <View style={[styles.turnOffButtonContainer, {
      backgroundColor: isInState === 'TURNOFF' ? '#fafafa' : '#eeeeee' }]}>
        <TouchableOpacity
			disabled={!enabled}
			onPress={onPress}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, { color: isInState === 'TURNOFF' ? 'red' : '#a2a2a2' }]}>
                {'Off'}
            </Text>
        </TouchableOpacity>
    </View>
);

const OnButton = ({ isInState, enabled, onPress }) => (
    <View style={[styles.turnOnButtonContainer, {
      backgroundColor: isInState === 'TURNON' ? '#fafafa' : '#eeeeee' }]}>
        <TouchableOpacity
			disabled={!enabled}
			onPress={onPress}
			style={styles.button} >
            <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                style = {[styles.buttonText, { color: isInState === 'TURNON' ? 'green' : '#a2a2a2' }]}>
                {'On'}
            </Text>
        </TouchableOpacity>
    </View>
);

type Props = {
  device: Object,
  onTurnOff: number => void,
  onTurnOn: number => void,
};

class ToggleButton extends View {
  props: Props;

  constructor(props: Props) {
    super(props);
  }

  render() {
    const { TURNON, TURNOFF } = this.props.device.supportedMethods;
    const isInState = this.props.device.isInState;

    const turnOnButton = <OnButton isInState={isInState} enabled={!!TURNON} onPress={this.props.onTurnOn} />;
    const turnOffButton = <OffButton isInState={isInState} enabled={!!TURNOFF} onPress={this.props.onTurnOff} />;

    return (
            <RoundedCornerShadowView style={styles.container} hasShadow={!!TURNON || !!TURNOFF}>
                { turnOffButton }
                { turnOnButton }
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
  turnOffButtonContainer: {
    flex: 1,
    alignItems: 'stretch',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  turnOnButtonContainer: {
    flex: 1,
    alignItems: 'stretch',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
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

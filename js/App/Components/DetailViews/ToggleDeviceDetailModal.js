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

import { RoundedCornerShadowView, View } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import { OnButton, OffButton, LearnButton } from 'TabViews_SubViews';

const ToggleButton = ({ device }) => {
  return (
    <RoundedCornerShadowView style={styles.toggleContainer}>
      <OffButton id={device.id} isInState={device.isInState} fontSize={16} style={styles.turnOff} methodRequested={device.methodRequested} />
      <OnButton id={device.id} isInState={device.isInState} fontSize={16} style={styles.turnOn} methodRequested={device.methodRequested} />
    </RoundedCornerShadowView>
  );
};

type Props = {
  device: Object,
};

class ToggleDeviceDetailModal extends View {
  props: Props;

  render() {
    const { device } = this.props;
    const { TURNON, TURNOFF, LEARN } = device.supportedMethods;

    let toggleButton = null;
    let learnButton = null;

    if (TURNON || TURNOFF) {
      toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} />;
    }

    if (LEARN) {
      learnButton = <LearnButton id={device.id} style={styles.learn} />;
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
  learn: {
    height: 36,
    marginHorizontal: 8,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = ToggleDeviceDetailModal;

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

import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';

import { LearnButton, NavigationalButton } from 'TabViews/SubViews';

class NavigationalDeviceDetailModal extends View {
  render() {
    const { device } = this.props;
    const { UP, DOWN, STOP, LEARN } = device.supportedMethods;

    let navigationButtons = null;
    let learnButton = null;

    if (UP || DOWN || STOP) {
      navigationButtons = <NavigationalButton device={device} style={styles.navigation} />;
    }

    if (LEARN) {
      learnButton = <LearnButton id={device.id} style={styles.learn} />;
    }

    return (
			<View style={styles.container}>
				{navigationButtons}
				{learnButton}
			</View>
    );
  }
}

NavigationalDeviceDetailModal.propTypes = {
  device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  navigation: {
    flexDirection: 'row',
    height: 36,
    marginHorizontal: 8,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learn: {
    height: 36,
    marginHorizontal: 8,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = NavigationalDeviceDetailModal;

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
import { Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';

class OnButton extends View {
  constructor(props) {
    super(props);
  }

  render() {
    let { isInState, enabled, onPress, fontSize } = this.props;

    return (
      <View style={[styles.container, isInState !== 'TURNOFF' ? styles.enabled : styles.disabled]}>
        <TouchableOpacity disabled={!enabled} onPress={onPress} style={styles.button} >
          <Text ellipsizeMode="middle" numberOfLines={1}
            style = {[styles.buttonText, isInState !== 'TURNOFF' ? styles.textEnabled : styles.textDisabled, { fontSize: (fontSize ? fontSize : 12) } ]}>
            {'On'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  enabled: {
    backgroundColor: '#fafafa',
  },
  disabled: {
    backgroundColor: '#eeeeee',
  },
  textEnabled: {
    color: 'green',
  },
  textDisabled: {
    color: '#a2a2a2',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

OnButton.propTypes = {
  isInState: PropTypes.string,
  enabled: PropTypes.bool,
  onPress: PropTypes.func,
  fontSize: PropTypes.number,
};

OnButton.defaultProps = {
  enabled: true,
};

module.exports = OnButton;

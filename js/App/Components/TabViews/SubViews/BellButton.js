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

import { View, RoundedCornerShadowView, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { bell } from 'Actions/Devices';

class BellButton extends View {
  constructor(props) {
    super(props);
    this.onBell = this.onBell.bind(this);
  }

  onBell() {
    console.log('onBell');
    this.props.onBell(this.props.id);
  }

  render() {
    return (
      <RoundedCornerShadowView style={this.props.style}>
				<TouchableOpacity onPress={this.onBell} style={styles.bell}>
					<Icon name="bell" size={22} color="orange" />
				</TouchableOpacity>
      </RoundedCornerShadowView>
    );
  }
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 7,
  //   height: 32,
  //   justifyContent: 'center',
  //   alignItems: 'stretch',
  // },
  bell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onBell: id => dispatch(bell(id)),
  };
}

module.exports = connect(null, mapDispatchToProps)(BellButton);

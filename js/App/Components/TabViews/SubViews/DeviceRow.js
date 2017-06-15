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

import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';

import { StyleSheet } from 'react-native';
import Theme from 'Theme';

class DeviceRow extends View {
  constructor(props) {
    super(props);

    this.onSettingsSelected = this.onSettingsSelected.bind(this);
  }

  render() {
    let button = null;
    const { device } = this.props;
    const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
		} = device.supportedMethods;

    if (BELL) {
      button = <BellButton id={device.id} style={styles.bell} />;
    } else if (UP || DOWN || STOP) {
      button = <NavigationalButton device={device} style={styles.navigation} />;
    } else if (DIM) {
      button = <DimmerButton
				device={device}
				setScrollEnabled={this.props.setScrollEnabled}
			/>;
    } else if (TURNON || TURNOFF) {
      button = <ToggleButton device={device}/>;
    } else {
      button = <ToggleButton device={device}/>;
    }

    return (
			<ListItem style = {Theme.Styles.rowFront}>
				<Container style = {styles.container}>
					{button}
					<View style={styles.name}>
						<Text style = {[styles.text, { opacity: device.name ? 1 : 0.5 }]}>
							{device.name ? device.name : '(no name)'}
						</Text>
					</View>
					<View style={styles.gear}>
						<Icon
							name="gear"
							size={26}
							color="#bbbbbb"
							onPress={this.onSettingsSelected}
						/>
					</View>
				</Container>
			</ListItem>
    );
  }

  onSettingsSelected() {
    this.props.onSettingsSelected(this.props.device.id);
  }
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  name: {
    flex: 20,
    justifyContent: 'center',
  },
  text: {
    marginLeft: 8,
    color: 'rgba(0,0,0,0.87)',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  gear: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bell: {
    flex: 7,
    height: 32,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  navigation: {
    flex: 7,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = DeviceRow;

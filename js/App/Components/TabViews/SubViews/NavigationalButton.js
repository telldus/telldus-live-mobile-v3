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

//@flow

'use strict';

import React from 'react';
import { Icon, View, RoundedCornerShadowView } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
	device: Object,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
};

const UpButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-up" size={30}
			style={{
  color: supportedMethod ? '#1a355b' : '#eeeeee',
}}
		/>
	</TouchableOpacity>
);

const DownButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-down" size={30}
			style={{
  color: supportedMethod ? '#1a355b' : '#eeeeee',
}}
		/>
	</TouchableOpacity>
);

const StopButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="stop" size={20}
			style={{
  color: supportedMethod ? '#1a355b' : '#eeeeee',
}}
		/>
	</TouchableOpacity>
);

class NavigationalButton extends View {
  props: Props;

  render() {
    const noop = function () {};
    const { UP, DOWN, STOP } = this.props.device.supportedMethods;

    return (
			<RoundedCornerShadowView style={styles.container}>
				<UpButton supportedMethod={UP} onPress={UP ? this.props.onUp : noop} />
				<DownButton supportedMethod={DOWN} onPress={DOWN ? this.props.onDown : noop} />
				<StopButton supportedMethod={STOP} onPress={STOP ? this.props.onStop : noop} />
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
  navigationButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = NavigationalButton;

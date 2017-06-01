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
import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import OffButton from './OffButton';
import OnButton from './OnButton';

class ToggleDashboardTile extends View {
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
    const { item, tileWidth } = this.props;
    const { name, isInState, supportedMethods } = item;
    const { TURNON, TURNOFF } = supportedMethods;

    const onButton = <OnButton isInState={isInState} onPress={this.onTurnOff} fontSize={Math.floor(tileWidth / 8)} enabled={!!TURNON} style={styles.turnOnButtonContainer} />;
    const offButton = <OffButton isInState={isInState} onPress={this.onTurnOff} fontSize={Math.floor(tileWidth / 8)} enabled={!!TURNOFF} style={styles.turnOffButtonContainer} />;

		let style = { ...this.props.style };
		style.width = tileWidth;
		style.height = tileWidth;

    return (
			<DashboardShadowTile
				item={item}
				isEnabled={isInState === 'TURNON'}
				name={name}
				tileWidth={tileWidth}
				hasShadow={!!TURNON || !!TURNOFF}
				style={style}>
				<View style={{ flexDirection: 'row', flex: 30 }}>
					{ offButton }
					{ onButton }
				</View>
			</DashboardShadowTile>
    );
  }
}

const styles = StyleSheet.create({
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	buttonBackgroundEnabled: {
		backgroundColor: 'white',
	},
	buttonBackgroundDisabled: {
		backgroundColor: '#eeeeee',
	},
	buttonOnEnabled: {
		color: 'green',
	},
	buttonOnDisabled: {
		color: '#a0a0a0',
	},
	buttonOffEnabled: {
		color: 'red',
	},
	buttonOffDisabled: {
		color: '#a0a0a0',
	},
	leftCircle: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	rightCircle: {
		position: 'absolute',
		top: 3,
		right: 3,
	},
});

ToggleDashboardTile.propTypes = {
  onTurnOn: PropTypes.func,
  onTurnOff: PropTypes.func,
  item: PropTypes.object,
  enabled: PropTypes.bool,
};

module.exports = ToggleDashboardTile;

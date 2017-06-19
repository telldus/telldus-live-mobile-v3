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

import { View, Icon } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';

import { down, up, stop } from 'Actions_Devices';

const UpButton = ({ isEnabled, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-up"
		      size={42}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
	</TouchableOpacity>
);

const DownButton = ({ isEnabled, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-down"
		      size={42}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
	</TouchableOpacity>
);

const StopButton = ({ isEnabled, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="stop"
		      size={30}
		      style={isEnabled ? styles.buttonEnabled : styles.buttonDisabled}
		/>
	</TouchableOpacity>
);

type Props = {
	item: Object,
	tileWidth: number,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
	style: Object,
};

class NavigationalDashboardTile extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {
		const { item, tileWidth } = this.props;
		const { id, name, supportedMethods } = item;
		const { UP, DOWN, STOP } = supportedMethods;
		const upButton = UP ? <UpButton isEnabled={true} onPress={this.props.onUp(id)} /> : null;
		const downButton = DOWN ? <DownButton isEnabled={true} onPress={this.props.onDown(id)} /> : null;
		const stopButton = STOP ? <StopButton isEnabled={true} onPress={this.props.onStop(id)} /> : null;

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={true}
				name={name}
				tileWidth={tileWidth}
				style={[this.props.style, { width: tileWidth, height: tileWidth }]}>
				<View style={styles.body}>
					{ upButton }
					{ downButton }
					{ stopButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	body: {
		flex: 30,
		flexDirection: 'row',
		backgroundColor: 'white',
		borderTopLeftRadius: 7,
		borderTopRightRadius: 7,
	},
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonEnabled: {
		color: '#1a355b',
	},
	buttonDisabled: {
		color: '#eeeeee',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		onDown: id => () => dispatch(down(id)),
		onUp: id => () => dispatch(up(id)),
		onStop: id => () => dispatch(stop(id)),
	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalDashboardTile);

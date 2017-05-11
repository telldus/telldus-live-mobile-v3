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

import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmingButton from './DimmingButton';

import { turnOn, turnOff, bell, down, up, stop } from 'Actions/Devices';
import { setDimmerValue, updateDimmerValue } from 'Actions/Dimmer';
import { StyleSheet } from 'react-native';
import Theme from 'Theme';

class DeviceRow extends View {
	render() {
		let button = null;
		const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
		} = this.props.supportedMethods;

		if (BELL) {
			button = <BellButton
				item={this.props}
				onBell={this.props.onBell(this.props.id)}
			/>;
		} else if (UP || DOWN || STOP) {
			button = <NavigationalButton
				item={this.props}
				onDown={this.props.onDown(this.props.id)}
				onUp={this.props.onUp(this.props.id)}
				onStop={this.props.onStop(this.props.id)}
			/>;
		} else if (DIM) {
			button = <DimmingButton
				item={this.props}
				onTurnOn={this.props.onTurnOn(this.props.id)}
				onTurnOff={this.props.onTurnOff(this.props.id)}
				onDim={this.props.onDim(this.props.id)}
				onDimmerSlide={this.props.onDimmerSlide(this.props.id)}
				setScrollEnabled={this.props.setScrollEnabled}
			/>;
		} else if (TURNON || TURNOFF) {
			button = <ToggleButton
				onTurnOn={this.props.onTurnOn(this.props.id)}
				onTurnOff={this.props.onTurnOff(this.props.id)}
				item={this.props}
			/>;
		} else {
			button = <View style={{ flex: 7 }}/>;
		}

		try {
			return (
				<ListItem style = {Theme.Styles.rowFront}>
					<Container style = {styles.container}>
						{button}
						<View style={styles.name}>
							<Text style = {[styles.text, {
								opacity: this.props.name ? 1 : 0.5,
							}]}>
								{this.props.name ? this.props.name : '(no name)'}
							</Text>
						</View>
						<View style={styles.gear}>
							<Icon
								name="gear"
								size={26}
								color="#bbbbbb"
								onPress={() => this.props.onSettingsSelected(this.props.id)}
							/>
						</View>
					</Container>
				</ListItem>
			);
		} catch (e) {
			console.log(e);
			return ( <View /> );
		}
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
});

function actions(dispatch) {
	return {
		onTurnOn: id => () => dispatch(turnOn(id)),
		onTurnOff: id => () => dispatch(turnOff(id)),
		onBell: id => () => dispatch(bell(id)),
		onDown: id => () => dispatch(down(id)),
		onUp: id => () => dispatch(up(id)),
		onStop: id => () => dispatch(stop(id)),
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		onDim: id => value => dispatch(updateDimmerValue(id, value)),
	};
}

module.exports = connect(() => ({}), actions)(DeviceRow);

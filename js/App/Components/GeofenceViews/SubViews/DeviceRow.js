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

import React from 'react';

import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';
import { StyleSheet } from 'react-native';
import CheckBox from 'react-native-check-box';
import Theme from 'Theme';

type Props = {
	onBell: (number) => void,
	onDown: (number) => void,
	onUp: (number) => void,
	onStop: (number) => void,
	onDimmerSlide: (number) => void,
	onDim: (number) => void,
	onTurnOn: (number) => void,
	onTurnOff: (number) => void,
	onSettingsSelected: (number) => void,
	device: Object,
	setScrollEnabled: boolean,
};

class DeviceRow extends View {
	props: Props;
	onSettingsSelected: (number) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			checked: this.props.value ? true : false
		};

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
		this.onCheck = this.onCheck.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
	}

	onCheck() {
		const {device} = this.props;
		if(this.state.checked) { //click to deselect
			this.props.onValueChange(false, device.id, null, null, null);
		} else { //click to select
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
				this.props.onValueChange(true, device.id, device.supportedMethods, null, null)
			} else if (UP || DOWN || STOP) {
				this.props.onValueChange(true, device.id, device.supportedMethods, 'UP', null);
			} else if (DIM) {
				this.props.onValueChange(true, device.id, device.supportedMethods, 'TURNOFF', 0);
			} else if (TURNON || TURNOFF) {
				this.props.onValueChange(true, device.id, device.supportedMethods, 'TURNOFF', 0);
			} else {
				this.props.onValueChange(true, device.id, device.supportedMethods, null, null);
			}
		}

		this.setState({checked: !this.state.checked});
	}

	onValueChange(deviceId, supportedMethods, state, value) {
		if(this.props.onValueChange) {
			this.props.onValueChange(true, deviceId, supportedMethods, state, value);
		}
	};

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
			button = <BellButton
				id={device.id}
				style={styles.bell}
				onValueChange={this.onValueChange}
			/>;
		} else if (UP || DOWN || STOP) {
			button = <NavigationalButton
				device={device}
				style={styles.navigation}
				onValueChange={this.onValueChange}
				value={this.props.value}				
			/>;
		} else if (DIM) {
			button = <DimmerButton
				device={device}
				setScrollEnabled={this.props.setScrollEnabled}
				onValueChange={this.onValueChange}
				value={this.props.value}				
			/>;
		} else if (TURNON || TURNOFF) {
			button = <ToggleButton
				device={device}
				onValueChange={this.onValueChange}
				value={this.props.value}				
			/>;
		} else {
			button = <ToggleButton
				device={device}
				onValueChange={this.onValueChange}
				value={this.props.value}				
			/>;
		}

		return (
			<ListItem style={[Theme.Styles.rowFront, {marginTop: 8}]}>
				<Container style={styles.container}>
					<CheckBox
						checkBoxColor={this.state.checked ? 'rgba(226,105,1,1)' : '#999'}
						isChecked={this.state.checked}
						onClick={this.onCheck}
					/>
					<View style={styles.name}>
						<Text style={[ styles.text, { opacity: device.name ? 1 : 0.5, color: this.state.checked ? 'rgba(226,105,1,1)' : '#999' }]}>
							{device.name ? device.name : '(no name)'}
						</Text>
					</View>
					{(this.state.checked)? button:null}
				</Container>
			</ListItem>
		);
	}

	onSettingsSelected() {
		this.props.onSettingsSelected(this.props.device.id);
	}
}

DeviceRow.propTypes = {
	value: React.PropTypes.object,
	onValueChange: React.PropTypes.func.isRequired
};
const styles = StyleSheet.create({
	container: {
		marginRight: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	name: {
		flex: 20,
		justifyContent: 'center',
	},
	text: {
		marginLeft: 8,
		fontSize: 20,
		textAlignVertical: 'center',
	},
	gear: {
		flex: 2.5,
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

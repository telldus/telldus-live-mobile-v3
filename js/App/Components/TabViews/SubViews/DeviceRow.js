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
import { TouchableOpacity } from 'react-native';

import { Container, ListItem, Text, View, Icon } from 'BaseComponents';
import ToggleButton from './ToggleButton';
import BellButton from './BellButton';
import NavigationalButton from './NavigationalButton';
import DimmerButton from './DimmerButton';
import i18n from '../../../Translations/common';

import { StyleSheet } from 'react-native';
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
	onSettingsSelected: (Object) => void,
	device: Object,
	setScrollEnabled: boolean,
	intl: Object,
	currentTab: string,
	currentScreen: string,
};

function toSliderValue(dimmerValue: number): number {
	return Math.round(dimmerValue * 100.0 / 255);
}

class DeviceRow extends View {
	props: Props;
	onSettingsSelected: Object => void;
	getLabelStatus: (string, number) => string;

	constructor(props: Props) {
		super(props);

		this.labelDevice = props.intl.formatMessage(i18n.labelDevice);
		this.labelStatus = props.intl.formatMessage(i18n.status);
		this.labelOff = props.intl.formatMessage(i18n.off);
		this.labelOn = props.intl.formatMessage(i18n.on);
		this.labelDim = props.intl.formatMessage(i18n.dim);
		this.labelUp = props.intl.formatMessage(i18n.up);
		this.labelDown = props.intl.formatMessage(i18n.down);
		this.labelStop = props.intl.formatMessage(i18n.stop);
		this.labelButton = props.intl.formatMessage(i18n.button);
		this.labelSettings = props.intl.formatMessage(i18n.settingsHeader);
		this.labelGearButton = `${this.labelSettings} ${this.labelButton}`;

		this.onSettingsSelected = this.onSettingsSelected.bind(this);
	}

	getLabelStatus(status: string, value: any): string {
		switch (status) {
			case 'TURNOFF':
				return `${this.labelStatus} ${this.labelOff}`;
			case 'TURNON':
				return `${this.labelStatus} ${this.labelOn}`;
			case 'UP':
				return `${this.labelStatus} ${this.labelUp}`;
			case 'DOWN':
				return `${this.labelStatus} ${this.labelDown}`;
			case 'STOP':
				return `${this.labelStatus} ${this.labelStop}`;
			case 'DIM':
				let dimmerValue = toSliderValue(value);
				return `${this.labelStatus} ${dimmerValue}% ${this.labelDim}`;
			default:
				return '';
		}
	}

	render() {
		let button = null;
		const { device, intl, currentTab, currentScreen } = this.props;
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
				device={device}
				style={styles.bell}
				intl={intl}
			/>;
		} else if (UP || DOWN || STOP) {
			button = <NavigationalButton
				device={device}
				style={styles.navigation}
				intl={intl}
			/>;
		} else if (DIM) {
			button = <DimmerButton
				device={device}
				setScrollEnabled={this.props.setScrollEnabled}
				intl={intl}
			/>;
		} else if (TURNON || TURNOFF) {
			button = <ToggleButton
				device={device}
				intl={intl}
			/>;
		} else {
			button = <ToggleButton
				device={device}
				intl={intl}
			/>;
		}
		let status = this.getLabelStatus(device.isInState, device.value);
		let accessible = currentTab === 'Devices' && currentScreen === 'Tabs';
		let accessibilityLabel = `${this.labelDevice} ${device.name}, ${status}`;
		let accessibilityLabelGearButton = `${this.labelGearButton}, ${device.name}`;

		return (
			<ListItem
				style={Theme.Styles.rowFront}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
				accessibilityLabel={accessible ? accessibilityLabel : ''}>
				<Container style={styles.container}>
					{button}
					<View style={styles.name}>
						<Text style = {[styles.text, { opacity: device.name ? 1 : 0.5 }]}>
							{device.name ? device.name : '(no name)'}
						</Text>
					</View>
					<TouchableOpacity
						style={styles.gear}
						accessibilityLabel={accessibilityLabelGearButton}
						onPress={this.onSettingsSelected}>
						<Icon
							name="gear"
							size={26}
							color="#bbbbbb"
						/>
					</TouchableOpacity>
				</Container>
			</ListItem>
		);
	}

	onSettingsSelected() {
		this.props.onSettingsSelected(this.props.device);
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

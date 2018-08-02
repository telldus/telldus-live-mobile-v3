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
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';

import { addToDashboard, removeFromDashboard } from '../../../../Actions';

import { View, IconTelldus } from '../../../../../BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

const messages = defineMessages({
	iconAddPhraseOne: {
		id: 'accessibilityLabel.sensors.iconAddPhraseOne',
		defaultMessage: 'add sensor',
	},
	iconAddPhraseTwo: {
		id: 'accessibilityLabel.sensors.iconAddPhraseTwo',
		defaultMessage: 'to dashboard',
	},
	iconRemovePhraseOne: {
		id: 'accessibilityLabel.sensors.iconRemovePhraseOne',
		defaultMessage: 'remove sensor',
	},
	iconRemovePhraseTwo: {
		id: 'accessibilityLabel.sensors.iconRemovePhraseTwo',
		defaultMessage: 'from dashboard',
	},
});

type Props = {
	sensor: Object,
	removeFromDashboard: number => void,
	addToDashboard: number => void,
	intl: Object,
	sensorIds: Array<number>,
	onSetIgnoreSensor: () => void,
	isOpen: boolean,
	style: Object,
	onPressSettings: () => void,
};

class SensorHiddenRow extends View {
	props: Props;
	onStarSelected: () => void;
	onSetIgnoreSensor: () => void;
	onPressSettings: () => void;

	constructor(props: Props) {
		super(props);

		this.onStarSelected = this.onStarSelected.bind(this);
		this.onSetIgnoreSensor = this.onSetIgnoreSensor.bind(this);
		this.onPressSettings = this.onPressSettings.bind(this);

		let { intl, sensor } = props;
		let { formatMessage } = intl;

		this.iconAddAccessibilityLabel = `${intl.formatMessage(messages.iconAddPhraseOne)}, ${sensor.name}, ${intl.formatMessage(messages.iconAddPhraseTwo)}`;
		this.iconRemoveAccessibilityLabel = `${intl.formatMessage(messages.iconRemovePhraseOne)}, ${sensor.name}, ${intl.formatMessage(messages.iconRemovePhraseTwo)}`;

		this.labelHidePhraseOne = `${formatMessage(i18n.move)} ${formatMessage(i18n.labelSensor)}`;
		this.labelHidePhraseTwo = `${formatMessage(i18n.toHiddenList)}`;
		this.labelHide = `${this.labelHidePhraseOne} ${sensor.name} ${this.labelHidePhraseTwo}`;

		this.labelUnHidePhraseOne = `${formatMessage(i18n.remove)} ${formatMessage(i18n.labelSensor)}`;
		this.labelUnHidePhraseTwo = `${formatMessage(i18n.fromHiddenList)}`;
		this.labelUnHide = `${this.labelUnHidePhraseOne} ${sensor.name} ${this.labelUnHidePhraseTwo}`;

		this.labelButton = formatMessage(i18n.button);
		this.labelSettings = formatMessage(i18n.settingsHeader);
		this.labelGearButton = `${this.labelSettings} ${this.labelButton}`;
		this.labelGearButtonAccessibilityLabel = `${this.labelGearButton}, ${sensor.name}`;
	}

	onStarSelected() {
		const { id } = this.props.sensor;
		const { sensorIds } = this.props;
		const isOnDB = sensorIds.indexOf(id) !== -1;

		if (isOnDB) {
			this.props.removeFromDashboard(id);
		} else {
			this.props.addToDashboard(id);
		}
	}

	onSetIgnoreSensor() {
		let { onSetIgnoreSensor } = this.props;
		if (onSetIgnoreSensor) {
			onSetIgnoreSensor();
		}
	}

	onPressSettings() {
		let { onPressSettings } = this.props;
		if (onPressSettings) {
			onPressSettings();
		}
	}

	render(): Object {
		const { sensorIds, sensor, isOpen, style } = this.props;
		const { id, ignored } = sensor;
		const isOnDB = sensorIds.indexOf(id) !== -1;

		let icon = isOnDB ? 'favorite' : 'favorite-outline';
		let iconHide = ignored ? 'hidden-toggled' : 'hidden';

		let importantForAccessibility = isOpen ? 'yes' : 'no-hide-descendants';
		let accessibilityLabelFavorite = isOnDB ? this.iconRemoveAccessibilityLabel : this.iconAddAccessibilityLabel;
		accessibilityLabelFavorite = isOpen ? accessibilityLabelFavorite : '';
		let accessibilityLabelSetIgnore = ignored ? this.labelUnHide : this.labelHide;

		let accessibilityLabelSettings = isOpen ? this.labelGearButtonAccessibilityLabel : '';

		return (
			<View style={style} importantForAccessibility={importantForAccessibility}>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onSetIgnoreSensor}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelSetIgnore}>
					<IconTelldus icon={iconHide} style={styles.favoriteIcon}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onStarSelected}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelFavorite}>
					<IconTelldus icon={icon} style={styles.favoriteIcon}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onPressSettings}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelSettings}>
					<IconTelldus icon={'settings'} style={styles.favoriteIcon}/>
				</TouchableOpacity>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		addToDashboard: (id: number): any => dispatch(addToDashboard('sensor', id)),
		removeFromDashboard: (id: number): any => dispatch(removeFromDashboard('sensor', id)),
	};
}

function mapStateToProps(store: Object): Object {
	return {
		sensorIds: store.dashboard.sensorIds,
	};
}

const styles = StyleSheet.create({
	favoriteIcon: {
		fontSize: 28,
		color: Theme.Core.brandSecondary,
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(SensorHiddenRow);

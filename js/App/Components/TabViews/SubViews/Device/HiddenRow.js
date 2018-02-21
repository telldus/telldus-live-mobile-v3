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

import { View, IconTelldus, Icon } from '../../../../../BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Theme from '../../../../Theme';

const messages = defineMessages({
	iconAddPhraseOne: {
		id: 'accessibilityLabel.devices.iconAddPhraseOne',
		defaultMessage: 'add device',
	},
	iconAddPhraseTwo: {
		id: 'accessibilityLabel.devices.iconAddPhraseTwo',
		defaultMessage: 'to dashboard',
	},
	iconRemovePhraseOne: {
		id: 'accessibilityLabel.devices.iconRemovePhraseOne',
		defaultMessage: 'remove device',
	},
	iconRemovePhraseTwo: {
		id: 'accessibilityLabel.devices.iconRemovePhraseTwo',
		defaultMessage: 'from dashboard',
	},
});

type Props = {
	device: Object,
	removeFromDashboard: number => void,
	addToDashboard: number => void,
	intl: Object,
	deviceIds: Array<number>,
	onPressSettings: () => void,
	onSetIgnoreDevice: () => void,
};

class DeviceHiddenRow extends View {
	props: Props;
	onStarSelected: () => void;
	onPressSettings: () => void;
	onSetIgnoreDevice: () => void;

	constructor(props: Props) {
		super(props);

		this.onStarSelected = this.onStarSelected.bind(this);
		this.onPressSettings = this.onPressSettings.bind(this);
		this.onSetIgnoreDevice = this.onSetIgnoreDevice.bind(this);

		let { intl, device } = props;
		this.iconAddAccessibilityLabel = `${intl.formatMessage(messages.iconAddPhraseOne)}, ${device.name}, ${intl.formatMessage(messages.iconAddPhraseTwo)}`;
		this.iconRemoveAccessibilityLabel = `${intl.formatMessage(messages.iconRemovePhraseOne)}, ${device.name}, ${intl.formatMessage(messages.iconRemovePhraseTwo)}`;
	}

	onStarSelected() {
		const { id } = this.props.device;
		const { deviceIds } = this.props;
		const isOnDB = deviceIds.indexOf(id) !== -1;

		if (isOnDB) {
			this.props.removeFromDashboard(id);
		} else {
			this.props.addToDashboard(id);
		}
	}

	onPressSettings() {
		let { onPressSettings } = this.props;
		if (onPressSettings) {
			onPressSettings();
		}
	}

	onSetIgnoreDevice() {
		let { onSetIgnoreDevice } = this.props;
		if (onSetIgnoreDevice) {
			onSetIgnoreDevice();
		}
	}

	render() {
		const { id, ignored } = this.props.device;
		const { deviceIds } = this.props;
		const isOnDB = deviceIds.indexOf(id) !== -1;

		let icon = isOnDB ? 'favorite' : 'favorite-outline';
		let iconHide = ignored ? 'hidden-toggled' : 'hidden';

		let accessibilityLabel = isOnDB ? this.iconRemoveAccessibilityLabel : this.iconAddAccessibilityLabel;
		accessibilityLabel = this.props.editMode ? accessibilityLabel : '';
		let importantForAccessibility = this.props.editMode ? 'yes' : 'no-hide-descendants';

		return (
			<View style={styles.hiddenRow} importantForAccessibility={importantForAccessibility}>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onSetIgnoreDevice}
					accessible={this.props.editMode}
					accessibilityLabel={accessibilityLabel}>
					<IconTelldus icon={iconHide} style={styles.favoriteIcon}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onStarSelected}
					accessible={this.props.editMode}
					accessibilityLabel={accessibilityLabel}>
					<IconTelldus icon={icon} style={styles.favoriteIcon}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onPressSettings}
					accessible={this.props.editMode}
					accessibilityLabel={accessibilityLabel}>
					<Icon name={'gear'} style={styles.favoriteIcon}/>
				</TouchableOpacity>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		addToDashboard: id => dispatch(addToDashboard('device', id)),
		removeFromDashboard: id => dispatch(removeFromDashboard('device', id)),
	};
}

function mapStateToProps(store: Object): Object {
	return {
		deviceIds: store.dashboard.deviceIds,
	};
}

const styles = StyleSheet.create({
	hiddenRow: {
		flexDirection: 'row',
		height: Theme.Core.rowHeight,
		width: Theme.Core.buttonWidth * 3,
		alignSelf: 'flex-end',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	favoriteIcon: {
		fontSize: 28,
		color: Theme.Core.brandSecondary,
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceHiddenRow);

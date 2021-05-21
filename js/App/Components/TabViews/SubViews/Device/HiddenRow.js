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

import {
	addToDashboard,
	removeFromDashboard,
	usePreviousDb,
	clearPreviousDb,
} from '../../../../Actions';

import { View, IconTelldus } from '../../../../../BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Theme from '../../../../Theme';
import i18n from '../../../../Translations/common';

type Props = {
	device: Object,
	removeFromDashboard: number => void,
	addToDashboard: number => void,
	intl: Object,
	deviceIds: Array<number>,
	onPressSettings: () => void,
	onSetIgnoreDevice: () => void,
	isOpen: boolean,
	style: Object,
	hasPreviousDB: boolean,

	dispatch: Function,
	toggleDialogueBox: Function,
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
		let { formatMessage } = intl;
		this.iconAddAccessibilityLabel = `${formatMessage(i18n.iconAddPhraseOneD)}, ${device.name}, ${formatMessage(i18n.iconAddPhraseTwoD)}`;
		this.iconRemoveAccessibilityLabel = `${formatMessage(i18n.iconRemovePhraseOneD)}, ${device.name}, ${formatMessage(i18n.iconRemovePhraseTwoD)}`;

		this.labelButton = formatMessage(i18n.button);
		this.labelSettings = formatMessage(i18n.settingsHeader);
		this.labelGearButton = `${this.labelSettings} ${this.labelButton}`;
		this.labelGearButtonAccessibilityLabel = `${this.labelGearButton}, ${device.name}`;

		this.labelHidePhraseOne = `${formatMessage(i18n.move)} ${formatMessage(i18n.labelDevice)}`;
		this.labelHidePhraseTwo = `${formatMessage(i18n.toHiddenList)}`;
		this.labelHide = `${this.labelHidePhraseOne} ${device.name} ${this.labelHidePhraseTwo}`;

		this.labelUnHidePhraseOne = `${formatMessage(i18n.remove)} ${formatMessage(i18n.labelDevice)}`;
		this.labelUnHidePhraseTwo = `${formatMessage(i18n.fromHiddenList)}`;
		this.labelUnHide = `${this.labelUnHidePhraseOne} ${device.name} ${this.labelUnHidePhraseTwo}`;
	}

	onStarSelected() {
		const { id } = this.props.device;
		const {
			deviceIds,
			hasPreviousDB,
			toggleDialogueBox,
			dispatch,
			intl,
		} = this.props;
		const {
			formatMessage,
		} = intl;

		if (hasPreviousDB) {
			toggleDialogueBox({
				show: true,
				showHeader: true,
				imageHeader: true,
				header: formatMessage(i18n.prevDBHeader),
				text: formatMessage(i18n.prevDBBody),
				showPositive: true,
				showNegative: true,
				positiveText: formatMessage(i18n.prevDBPos),
				negativeText: formatMessage(i18n.prevDBNeg),
				onPressPositive: () => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					dispatch(usePreviousDb());
				},
				closeOnPressPositive: true,
				onPressNegative: () => {
					dispatch(clearPreviousDb());
				},
				closeOnPressNegative: true,
				notificationModalFooterStyle: {
					flexDirection: 'column',
					justifyContent: 'flex-end',
					alignItems: 'flex-end',
				},
				notificationModalFooterPositiveTextCoverStyle: {
					paddingRight: 10,
					marginRight: 5,
				},
			});
			return;
		}

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

	render(): Object {
		const {
			deviceIds,
			isOpen,
			device,
			style,
			hasPreviousDB,
		} = this.props;
		const { id, ignored } = device;
		const isOnDB = deviceIds.indexOf(id) !== -1 && !hasPreviousDB;

		let icon = isOnDB ? 'favorite' : 'favorite-outline';
		let iconHide = ignored ? 'hidden-toggled' : 'hidden';

		let accessibilityLabelFavorite = isOnDB ? this.iconRemoveAccessibilityLabel : this.iconAddAccessibilityLabel;
		accessibilityLabelFavorite = isOpen ? accessibilityLabelFavorite : '';

		let accessibilityLabelSettings = isOpen ? this.labelGearButtonAccessibilityLabel : '';

		let accessibilityLabelSetIgnore = ignored ? this.labelUnHide : this.labelHide;

		let importantForAccessibility = isOpen ? 'yes' : 'no-hide-descendants';
		let accessibilityElementsHidden = true;

		return (
			<View style={style}
				importantForAccessibility={importantForAccessibility}
				accessibilityElementsHidden={accessibilityElementsHidden}>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onSetIgnoreDevice}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelSetIgnore}>
					<IconTelldus
						icon={iconHide}
						style={styles.favoriteIcon}
						level={23}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onStarSelected}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelFavorite}>
					<IconTelldus
						icon={icon}
						style={styles.favoriteIcon}
						level={23}/>
				</TouchableOpacity>
				<TouchableOpacity
					style={Theme.Styles.hiddenRowItem}
					onPress={this.onPressSettings}
					accessible={isOpen}
					accessibilityLabel={accessibilityLabelSettings}>
					<IconTelldus
						icon={'settings'}
						style={styles.favoriteIcon}
						level={23}/>
				</TouchableOpacity>
			</View>
		);
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		addToDashboard: (id: number): any => dispatch(addToDashboard('device', id)),
		removeFromDashboard: (id: number): any => dispatch(removeFromDashboard('device', id)),
		dispatch,
	};
}

function mapStateToProps(store: Object): Object {

	const {
		dashboard,
		user: { userId },
		app: {defaultSettings},
	} = store;

	const { activeDashboardId } = defaultSettings || {};

	const { deviceIds = {}, sensorIds = {}, metWeatherIds = {}} = dashboard;
	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];
	const userDbsAndMetWeathersIds = metWeatherIds[userId] || {};
	const metWeatherIdsInCurrentDb = userDbsAndMetWeathersIds[activeDashboardId] || [];
	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];

	const hasLoggedOutPrevDb = userDbsAndSensorIds.hasLoggedOut || userDbsAndDeviceIds.hasLoggedOut || userDbsAndMetWeathersIds.hasLoggedOut;
	const isDBEmpty = (deviceIdsInCurrentDb.length === 0) && (sensorIdsInCurrentDb.length === 0) && (metWeatherIdsInCurrentDb.length === 0);
	const hasPreviousDB = !isDBEmpty && hasLoggedOutPrevDb;

	return {
		deviceIds: deviceIdsInCurrentDb,
		hasPreviousDB,
	};
}

const styles = StyleSheet.create({
	favoriteIcon: {
		fontSize: 28,
	},
});

export default (connect(mapStateToProps, mapDispatchToProps)(DeviceHiddenRow): Object);

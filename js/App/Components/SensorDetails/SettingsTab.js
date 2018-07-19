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
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';

import { View, TabBar } from '../../../BaseComponents';
import { SettingsRow } from './SubViews';

import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	setKeepHistory,
	getSensors,
	setIgnoreSensor,
} from '../../Actions';
import Theme from '../../Theme';

import i18n from '../../Translations/common';
const messages = defineMessages({
	showOnDashborad: {
		id: 'showOnDashboard',
		defaultMessage: 'Show on dashboard',
		description: 'Select if this item should be shown on the dashboard',
	},
	hideFromList: {
		id: 'hideFromList',
		defaultMessage: 'Hide from device list',
		description: 'Select if this item should be shown on the device list',
	},
});

type Props = {
	dispatch: Function,
	sensor: Object,
	inDashboard: boolean,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
	screenProps: Object,
};

type State = {
	isHidden: boolean,
	keepHistory: boolean,
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;
	setIgnoreSensor: (boolean) => void;
	setKeepHistory: (boolean) => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="settings"
				tintColor={tintColor}
				label={i18n.settingsHeader}
				accessibilityLabel={i18n.deviceSettingsTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('Settings');
		},
	});

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreSensor = this.setIgnoreSensor.bind(this);
		this.setKeepHistory = this.setKeepHistory.bind(this);

		this.state = {
			isHidden: props.sensor.ignored,
			keepHistory: props.sensor.keepHistory,
		};

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.toastStoreHistory = formatMessage(i18n.toastStoreHistory);
		this.toastStoreNotHistory = formatMessage(i18n.toastStoreNotHistory);
	}

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.sensor.id);
		} else {
			this.props.onAddToDashboard(this.props.sensor.id);
		}
	}

	setIgnoreSensor(value: boolean) {
		let { sensor } = this.props;
		let ignore = sensor.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreSensor(sensor.id, ignore)).then((res: Object) => {
			let message = sensor.ignored ?
				this.removedFromHiddenList : this.addedToHiddenList;
			this.props.dispatch(getSensors());
			this.props.dispatch(showToast(message));
		}).catch((err: Object) => {
			let	message = err.message ? err.message : null;
			this.setState({
				isHidden: sensor.ignored,
			});
			this.props.dispatch(showToast(message));
		});
	}

	setKeepHistory(value: boolean) {
		let { sensor } = this.props;
		let keepHistory = sensor.keepHistory ? 0 : 1;
		this.setState({
			keepHistory: value,
		});
		this.props.dispatch(setKeepHistory(sensor.id, keepHistory)).then((res: Object) => {
			let message = sensor.keepHistory ?
				this.toastStoreNotHistory : this.toastStoreHistory;
			this.props.dispatch(getSensors());
			this.props.dispatch(showToast(message));
		}).catch((err: Object) => {
			let	message = err.message ? err.message : null;
			this.setState({
				keepHistory: sensor.keepHistory,
			});
			this.props.dispatch(showToast(message));
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'Settings';
	}

	render(): Object {
		const { keepHistory, isHidden } = this.state;
		const { inDashboard } = this.props;
		const { appLayout, intl } = this.props.screenProps;
		const { formatMessage } = intl;

		const {
			container,
		} = this.getStyle(appLayout);

		return (
			<ScrollView>
				<View style={container}>
					<SettingsRow
						label={formatMessage(messages.showOnDashborad)}
						onValueChange={this.onValueChange}
						value={inDashboard}
						appLayout={appLayout}
					/>
					<SettingsRow
						label={formatMessage(messages.hideFromList)}
						onValueChange={this.setIgnoreSensor}
						value={isHidden}
						appLayout={appLayout}
					/>
					<SettingsRow
						label={formatMessage(i18n.labelStoreHistory)}
						onValueChange={this.setKeepHistory}
						value={keepHistory}
						appLayout={appLayout}
					/>
				</View>
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		return {
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('sensor', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('sensor', id)),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];
	return {
		sensor,
		inDashboard: !!state.dashboard.sensorsById[id],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);

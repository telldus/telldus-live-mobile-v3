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
const isEqual = require('react-fast-compare');

import { View, TabBar, Text, SettingsRow } from '../../../BaseComponents';

import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	setKeepHistory,
	getSensors,
	setIgnoreSensor,
} from '../../Actions';
import { shouldUpdate } from '../../Lib';
import Theme from '../../Theme';

import i18n from '../../Translations/common';
const messages = defineMessages({
	hideFromList: {
		id: 'sensor.hideFromList',
		defaultMessage: 'Hide from sensor list',
		description: 'Select if this item should be shown on the sensor list',
	},
});

type Props = {
	dispatch: Function,
	sensor: Object,
	inDashboard: boolean,

	screenProps: Object,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
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

		const { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.toastStoreHistory = formatMessage(i18n.toastStoreHistory);
		this.toastStoreNotHistory = formatMessage(i18n.toastStoreNotHistory);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps: screenPropsN, inDashboard: inDashboardN, ...othersN } = nextProps;
		const { currentScreen, appLayout } = screenPropsN;
		if (currentScreen === 'Settings') {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { screenProps, inDashboard, ...others } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) || (inDashboardN !== inDashboard)) {
				return true;
			}

			const propsChange = shouldUpdate(others, othersN, ['sensor']);
			if (propsChange) {
				return true;
			}

			return false;
		}
		return false;
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

	formatProtocol(protocol: string): string {
		switch (protocol) {
			case 'zwave':
				return 'Z-Wave';
			default:
				return protocol;
		}
	}

	render(): Object {
		const { keepHistory, isHidden } = this.state;
		const { inDashboard, sensor } = this.props;
		const { model, protocol, sensorId } = sensor;
		const { appLayout, intl } = this.props.screenProps;
		const { formatMessage } = intl;

		const {
			container,
			infoHeaderText,
		} = this.getStyle(appLayout);

		return (
			<ScrollView>
				<View style={container}>
					<SettingsRow
						label={formatMessage(i18n.showOnDashborad)}
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
					<Text style={infoHeaderText}>
						{formatMessage(i18n.labelTechnicalInfo)}
					</Text>
					<SettingsRow
						type={'text'}
						label={formatMessage(i18n.labelProtocol)}
						value={this.formatProtocol(protocol)}
						appLayout={appLayout}
					/>
					<SettingsRow
						type={'text'}
						label={formatMessage(i18n.labelModel)}
						value={model}
						appLayout={appLayout}
					/>
					<SettingsRow
						type={'text'}
						label={`${formatMessage(i18n.labelSensor)} ${formatMessage(i18n.labelId)}`}
						value={sensorId}
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

		const { inactiveTintColor, paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const fontSize = deviceWidth * 0.04;

		return {
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
			infoHeaderText: {
				fontSize,
				color: inactiveTintColor,
				marginTop: padding,
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

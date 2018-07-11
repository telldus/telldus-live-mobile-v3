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

import { FormattedMessage, Text, View, TabBar, Switch } from '../../../BaseComponents';
import { defineMessages } from 'react-intl';

import { getDevices, setIgnoreDevice } from '../../Actions/Devices';
import { addToDashboard, removeFromDashboard, showToast } from '../../Actions';
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
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;
	setIgnoreDevice: (boolean) => void;

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
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.state = {
			isHidden: props.sensor.ignored,
		};

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);
	}

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.sensor.id);
		} else {
			this.props.onAddToDashboard(this.props.sensor.id);
		}
	}

	setIgnoreDevice(value: boolean) {
		let { sensor } = this.props;
		let ignore = sensor.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreDevice(sensor.id, ignore)).then((res: Object) => {
			let message = sensor.ignored ?
				this.removedFromHiddenList : this.addedToHiddenList;
			this.props.dispatch(getDevices());
			this.props.dispatch(showToast(message));
		}).catch((err: Object) => {
			let	message = err.message ? err.message : null;
			this.setState({
				isHidden: sensor.ignored,
			});
			this.props.dispatch(showToast(message));
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'Settings';
	}

	render(): Object {
		let { appLayout } = this.props.screenProps;

		let {
			container,
			ShowOnDashCover,
			textShowOnDashCover,
			textShowOnDash,
		} = this.getStyle(appLayout);

		return (
			<ScrollView>
				<View style={container}>
					<View style={ShowOnDashCover}>
						<View style={textShowOnDashCover}>
							<Text style={textShowOnDash}>
								<FormattedMessage {...messages.showOnDashborad} style={textShowOnDash}/>
							</Text>
						</View>
						<Switch
							onValueChange={this.onValueChange}
							value={this.props.inDashboard}
						/>
					</View>
					<View style={ShowOnDashCover}>
						<View style={textShowOnDashCover}>
							<Text style={textShowOnDash}>
								<FormattedMessage {...messages.hideFromList} style={textShowOnDash}/>
							</Text>
						</View>
						<Switch
							onValueChange={this.setIgnoreDevice}
							value={this.state.isHidden}
						/>
					</View>
				</View>
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const fontSize = deviceWidth * 0.04;

		return {
			container: {
				flex: 0,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
			ShowOnDashCover: {
				backgroundColor: '#fff',
				padding: fontSize,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginTop: padding / 2,
				...Theme.Core.shadow,
			},
			textShowOnDashCover: {
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			textShowOnDash: {
				color: '#8A8682',
				fontSize,
				marginLeft: 8,
				justifyContent: 'center',
			},
			learn: {
				marginHorizontal: width * 0.25,
				marginVertical: padding / 2,
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
		inDashboard: !!state.dashboard.devicesById[id],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);

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
import { Image, TouchableOpacity, Linking } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';
import Platform from 'Platform';

import { List, ListDataSource, Text, View, TouchableButton } from 'BaseComponents';
import { DeviceRow, DeviceRowHidden } from 'TabViews_SubViews';

import { getDevices, getDeviceHistory } from 'Actions_Devices';
import { toggleEditMode } from 'Actions';

import getDeviceType from '../../Lib/getDeviceType';
import getTabBarIcon from '../../Lib/getTabBarIcon';

import { parseDevicesForListView } from 'Reducers_Devices';
import { addNewGateway } from 'Actions';

import i18n from '../../Translations/common';
import Theme from 'Theme';

const messages = defineMessages({
	messageNoDeviceTitle: {
		id: 'pages.devices.messageNoDeviceTitle',
		defaultMessage: 'You have not added any devices yet.',
		description: 'Message title when no devices',
	},
	messageNoGatewayTitle: {
		id: 'pages.devices.messageNoGatewayTitle',
		defaultMessage: 'You have not added a gateway yet.',
		description: 'Message title when no gateways',
	},
	messageNoDeviceContent: {
		id: 'pages.devices.messageNoDeviceContent',
		defaultMessage: 'Currently, adding devices is only possible through our web interface, live.telldus.com. ' +
		'Click below to open the web interface.',
		description: 'Message title when no devices',
	},
	messageNoGatewayContent: {
		id: 'pages.devices.messageNoGatewayContent',
		defaultMessage: 'Before adding devices you need to add a gateway as a location in your account. ' +
		'Click below if you want to do that now.',
		description: 'Message content when no gateways',
	},
});

type Props = {
	rowsAndSections: Object,
	gateways: Object,
	editMode: boolean,
	devices: Object,
	tab: string,
	dispatch: Function,
	stackNavigator: Object,
	screenProps: Object,
	appLayout: Object,
	addNewLocation: Function,
};

type State = {
	dataSource: Object,
	deviceId: number,
	dimmer: boolean,
	addGateway: boolean,
};

class DevicesTab extends View {

	props: Props;
	state: State;

	onCloseSelected: () => void;
	openDeviceDetail: (number) => void;
	setScrollEnabled: (boolean) => void;
	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	renderHiddenRow: (Object) => Object;
	onRefresh: () => void;
	onPressAddLocation: () => void;
	onPressAddDevice: () => void;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(i18n.devices),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'devices'),
	});

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
			deviceId: -1,
			dimmer: false,
			addGateway: false,
		};
		this.onCloseSelected = this.onCloseSelected.bind(this);
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHiddenRow = this.renderHiddenRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.onPressAddLocation = this.onPressAddLocation.bind(this);
		this.onPressAddDevice = this.onPressAddDevice.bind(this);

		this.url = 'http://live.telldus.com/';
		this.noDeviceTitle = props.screenProps.intl.formatMessage(messages.messageNoDeviceTitle);
		this.noGatewayTitle = props.screenProps.intl.formatMessage(messages.messageNoGatewayTitle);
		this.noDeviceContent = props.screenProps.intl.formatMessage(messages.messageNoDeviceContent);
		this.noGatewayContent = props.screenProps.intl.formatMessage(messages.messageNoGatewayContent);
	}

	componentWillReceiveProps(nextProps) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});

		if (nextProps.tab !== 'devicesTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('devicesTab'));
		}
	}

	rowHasChanged(r1, r2) {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.device !== r2.device ||
			r1.inDashboard !== r2.inDashboard ||
			r1.editMode !== r2.editMode
		);
	}

	renderRow(row) {
		let { screenProps } = this.props;
		return (
			<DeviceRow {...row}
			           onSettingsSelected={this.openDeviceDetail}
					   setScrollEnabled={this.setScrollEnabled}
					   intl={screenProps.intl}
					   currentTab={screenProps.currentTab}
			/>
		);
	}

	renderHiddenRow(row) {
		let { screenProps } = this.props;
		return (
			<DeviceRowHidden {...row} intl={screenProps.intl}/>
		);
	}

	openDeviceDetail(device) {
		this.props.dispatch(getDeviceHistory(device));
		this.props.stackNavigator.navigate('DeviceDetails', { id: device.id });
	}

	onCloseSelected() {
		this.setState({ deviceId: -1 });
	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	renderSectionHeader(sectionData, sectionId) {
		const gateway = this.props.gateways.byId[sectionId];
		return (
			<View style={Theme.Styles.sectionHeader}>
				<Text style={Theme.Styles.sectionHeaderText}>
					{(gateway && gateway.name) ? gateway.name : ''}
				</Text>
			</View>
		);
	}

	onRefresh() {
		this.props.dispatch(getDevices());
	}

	getType(deviceId) {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	onPressAddLocation() {
		this.props.addNewLocation()
			.then(response => {
				if (response.client) {
					this.props.stackNavigator.navigate('AddLocation', {clients: response.client, renderRootHeader: true});
					this.setState({
						addGateway: false,
					});
				}
			});
	}

	onPressAddDevice() {
		if (!this.props.gateways.allIds.length > 0) {
			this.setState({
				addGateway: true,
			});
		} else {
			let url = this.url;
			Linking.canOpenURL(url).then(supported => {
				if (!supported) {
				  console.log(`Can't handle url: ${url}`);
				} else {
				  return Linking.openURL(url);
				}
			  }).catch(err => console.error('An error occurred', err));
		}
	}

	noDeviceMessage(style: Object) {
		return (
			<View style={style.container}>
				<Text style={style.noItemsTitle}>
					{this.noDeviceTitle}
				</Text>
				<Text style={style.noItemsContent}>
					{'\n'}
					{this.noDeviceContent}
				</Text>
				<TouchableOpacity style={style.linkCover} onPress={this.onPressAddDevice}>
					<Image source={require('./img/telldus.png')} style={style.image}/>
					<Text style={style.link}>
						live.telldus.com
					</Text>
					<Image source={require('./img/right-arrow-key.png')} tintColor={'#BDBDBD'} style={style.rightArrow}/>
				</TouchableOpacity>
			</View>
		);
	}

	noGatewayMessage(style: Object) {
		return (
			<View style={style.container}>
				<Text style={style.noItemsTitle}>
					{this.noGatewayTitle}
				</Text>
				<Text style={style.noItemsContent}>
					{'\n'}
					{this.noGatewayContent}
					{'\n\n'}
				</Text>
				<TouchableButton
					onPress={this.onPressAddLocation}
					text={i18n.addLocation}
				/>
			</View>
		);
	}

	render() {

		let { appLayout, devices } = this.props;

		let style = this.getStyles(appLayout);

		if (this.state.addGateway) {
			return this.noGatewayMessage(style);
		}

		if (!devices.allIds.length > 0 && devices.didFetch) {
			return this.noDeviceMessage(style);
		}

		return (
			<View style={style.container}>
				<List
					ref="list"
					dataSource={this.state.dataSource}
					renderHiddenRow={this.renderHiddenRow}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					leftOpenValue={40}
					editMode={this.props.editMode}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			container: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: !this.props.devices.allIds.length > 0 ? 30 : 0,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
			},
			noItemsTitle: {
				textAlign: 'center',
				color: '#4C4C4C',
				fontSize: isPortrait ? Math.floor(width * 0.068) : Math.floor(height * 0.068),
				paddingTop: 15,
			},
			noItemsContent: {
				textAlign: 'center',
				color: '#4C4C4C',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			linkCover: {
				flexDirection: 'row',
				marginTop: 20,
				alignItems: 'center',
			},
			image: {
				height: isPortrait ? Math.floor(width * 0.074) : Math.floor(height * 0.074),
				width: isPortrait ? Math.floor(width * 0.074) : Math.floor(height * 0.074),
			},
			link: {
				textAlign: 'center',
				color: '#4C4C4C',
				marginLeft: 10,
				fontSize: isPortrait ? Math.floor(width * 0.06) : Math.floor(height * 0.06),
			},
			rightArrow: {
				marginLeft: 5,
				height: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
				width: isPortrait ? Math.floor(width * 0.03) : Math.floor(height * 0.03),
			},
		};
	}
}

DevicesTab.propTypes = {
	rowsAndSections: PropTypes.object,
};

const getRowsAndSections = createSelector(
	[
		({ devices }) => devices,
		({ gateways }) => gateways,
		({ tabs }) => tabs.editModeDevicesTab,
	],
	(devices, gateways, editMode) => {
		const { sections, sectionIds } = parseDevicesForListView(devices, gateways, editMode);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(state, ownprops) {
	return {
		stackNavigator: ownprops.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(state),
		editMode: state.tabs.editModeDevicesTab,
		devices: state.devices,
		gateways: state.gateways,
		tab: state.navigation.tab,
		appLayout: state.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		addNewLocation: () => {
			return dispatch(addNewGateway());
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DevicesTab);

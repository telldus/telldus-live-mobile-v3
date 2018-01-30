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
import { Image, TouchableOpacity, Linking, SectionList, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';
import Platform from 'Platform';

import { Text, View, TouchableButton, IconTelldus } from 'BaseComponents';
import { DeviceRow } from 'TabViews_SubViews';

import { getDevices } from 'Actions_Devices';
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
	visibleList: Array<Object>,
	hiddenList: Array<Object>,
	deviceId: number,
	dimmer: boolean,
	addGateway: boolean,
	makeRowAccessible: 0 | 1,
	isRefreshing: boolean,
	listEnd: boolean,
	showHiddenList: boolean,
};

class DevicesTab extends View {

	props: Props;
	state: State;

	onCloseSelected: () => void;
	openDeviceDetail: (number) => void;
	setScrollEnabled: (boolean) => void;
	renderSectionHeader: (sectionData: Object) => Object;
	renderRow: (Object) => Object;
	onRefresh: () => void;
	onPressAddLocation: () => void;
	onPressAddDevice: () => void;
	onEndReachedVisibleList: () => void;
	toggleHiddenList: () => void;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(i18n.devices),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'devices'),
	});

	constructor(props: Props) {
		super(props);

		let { visibleList, hiddenList } = props.rowsAndSections;

		this.state = {
			visibleList,
			hiddenList,
			deviceId: -1,
			dimmer: false,
			addGateway: false,
			makeRowAccessible: 0,
			isRefreshing: false,
			listEnd: false,
			showHiddenList: false,
		};
		this.onCloseSelected = this.onCloseSelected.bind(this);
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.onPressAddLocation = this.onPressAddLocation.bind(this);
		this.onPressAddDevice = this.onPressAddDevice.bind(this);

		this.onEndReachedVisibleList = this.onEndReachedVisibleList.bind(this);
		this.toggleHiddenList = this.toggleHiddenList.bind(this);

		let { formatMessage } = props.screenProps.intl;

		let hiddenDevices = formatMessage(i18n.hiddenDevices).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenDevices}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenDevices}`;

		this.url = 'http://live.telldus.com/';
		this.noDeviceTitle = formatMessage(messages.messageNoDeviceTitle);
		this.noGatewayTitle = formatMessage(messages.messageNoGatewayTitle);
		this.noDeviceContent = formatMessage(messages.messageNoDeviceContent);
		this.noGatewayContent = formatMessage(messages.messageNoGatewayContent);
	}

	componentWillReceiveProps(nextProps) {

		let { makeRowAccessible } = this.state;
		let { screenReaderEnabled, rowsAndSections } = nextProps;
		let { currentScreen, currentTab } = nextProps.screenProps;
		if (screenReaderEnabled && currentScreen === 'Tabs' && currentTab === 'Devices') {
			makeRowAccessible = 1;
		} else {
			makeRowAccessible = 0;
		}

		let { visibleList, hiddenList } = rowsAndSections;

		this.setState({
			visibleList,
			hiddenList,
			makeRowAccessible,
		});

		if (nextProps.tab !== 'devicesTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('devicesTab'));
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object) {
		return nextProps.tab === 'devicesTab';
	}

	renderRow(row) {
		let { screenProps, gateways } = this.props;
		let { intl, currentTab, currentScreen } = screenProps;
		let isGatewayActive = gateways.byId[row.item.clientId].online;

		return (
			<DeviceRow
				device={row.item}
				onSettingsSelected={this.openDeviceDetail}
				setScrollEnabled={this.setScrollEnabled}
				intl={intl}
				appLayout={this.props.appLayout}
				currentTab={currentTab}
				currentScreen={currentScreen}
				isGatewayActive={isGatewayActive}
			/>
		);
	}

	openDeviceDetail(device) {
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

	renderSectionHeader(sectionData: Object): Object {
		return (
			<View style={Theme.Styles.sectionHeaderNew}>
				<Text style={Theme.Styles.sectionHeaderTextNew}>
					{sectionData.section.key}
				</Text>
			</View>
		);
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});
		this.props.dispatch(getDevices())
			.then(() => {
				this.setState({
					isRefreshing: false,
				});
			}).catch(() => {
				this.setState({
					isRefreshing: false,
				});
			});
	}

	keyExtractor(item) {
		return item.id;
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

	onEndReachedVisibleList() {
		console.log('TEST called');
		this.setState({
			listEnd: true,
		});
	}

	toggleHiddenList() {
		this.setState({
			showHiddenList: !this.state.showHiddenList,
		});
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

	toggleHiddenListButton(style): Object {
		return (
			<TouchableOpacity style={style.toggleHiddenListButton} onPress={this.toggleHiddenList}>
				<IconTelldus icon="hidden" style={style.toggleHiddenListIcon}/>
				<Text style={style.toggleHiddenListText}>
					{this.state.showHiddenList ?
						this.hideHidden
						:
						this.showHidden
					}
				</Text>
			</TouchableOpacity>
		);
	}

	render() {

		let { appLayout, devices } = this.props;
		let { listEnd, showHiddenList, hiddenList, visibleList, isRefreshing } = this.state;

		let style = this.getStyles(appLayout);

		if (this.state.addGateway) {
			return this.noGatewayMessage(style);
		}

		if (!devices.allIds.length > 0 && devices.didFetch) {
			return this.noDeviceMessage(style);
		}

		let extraData = {
			makeRowAccessible: this.state.makeRowAccessible,
			appLayout: appLayout,
		};

		return (
			<ScrollView style={style.container}
				onRefresh={this.onRefresh}
				refreshing={isRefreshing}>
				<SectionList
					sections={visibleList}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					extraData={extraData}
					onEndReached={this.onEndReachedVisibleList}
				/>
				{listEnd && (
					<View>
						{this.toggleHiddenListButton(style)}
						{showHiddenList ?
							<SectionList
								sections={hiddenList}
								renderItem={this.renderRow}
								renderSectionHeader={this.renderSectionHeader}
								keyExtractor={this.keyExtractor}
								extraData={extraData}
							/>
							:
							<View style={{height: 80}}/>
						}
					</View>
				)
				}
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			container: {
				flex: 1,
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
			toggleHiddenListButton: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				marginVertical: 10,
				paddingVertical: 10,
			},
			toggleHiddenListIcon: {
				marginTop: 4,
				fontSize: 34,
				color: Theme.Core.rowTextColor,
			},
			toggleHiddenListText: {
				marginLeft: 6,
				fontSize: 16,
				textAlign: 'center',
				color: Theme.Core.rowTextColor,
			},
		};
	}
}

const getRowsAndSections = createSelector(
	[
		({ devices }) => devices.byId,
		({ gateways }) => gateways.byId,
	],
	(devices, gateways) => {
		return parseDevicesForListView(devices, gateways);
	}
);

function mapStateToProps(state: Object, ownprops: Object): Object {
	return {
		stackNavigator: ownprops.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(state),
		editMode: state.tabs.editModeDevicesTab,
		devices: state.devices,
		gateways: state.gateways,
		tab: state.navigation.tab,
		appLayout: state.App.layout,
		screenReaderEnabled: state.App.screenReaderEnabled,
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

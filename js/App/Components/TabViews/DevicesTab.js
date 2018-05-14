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
import { Image, TouchableOpacity, Linking, SectionList, ScrollView, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';
import Platform from 'Platform';

import { Text, View, TouchableButton, IconTelldus, DialogueBox, DialogueHeader } from '../../../BaseComponents';
import { DeviceRow } from './SubViews';

import { getDevices, setIgnoreDevice } from '../../Actions/Devices';

import getDeviceType from '../../Lib/getDeviceType';
import getTabBarIcon from '../../Lib/getTabBarIcon';

import { parseDevicesForListView } from '../../Reducers/Devices';
import { addNewGateway, showToast } from '../../Actions';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

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
	showHiddenList: boolean,
	propsSwipeRow: Object,
	scrollEnabled: boolean,
	showRefresh: boolean,
	showConfirmDialogue: boolean,
	deviceToHide: Object,
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
	toggleHiddenList: () => void;
	setIgnoreDevice: (Object) => void;
	closeVisibleRows: (string) => void;
	onDismissDialogueHide: () => void;
	onConfirmDialogueHide: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(i18n.devices),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'devices'),
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
			showHiddenList: false,
			propsSwipeRow: {
				idToKeepOpen: null,
				forceClose: false,
			},
			scrollEnabled: true,
			showRefresh: true,
			showConfirmDialogue: false,
			deviceToHide: {},
		};

		this.onCloseSelected = this.onCloseSelected.bind(this);
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.onPressAddLocation = this.onPressAddLocation.bind(this);
		this.onPressAddDevice = this.onPressAddDevice.bind(this);
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.toggleHiddenList = this.toggleHiddenList.bind(this);
		this.closeVisibleRows = this.closeVisibleRows.bind(this);
		this.onDismissDialogueHide = this.onDismissDialogueHide.bind(this);
		this.onConfirmDialogueHide = this.onConfirmDialogueHide.bind(this);

		let { formatMessage } = props.screenProps.intl;

		let hiddenDevices = formatMessage(i18n.hiddenDevices).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenDevices}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenDevices}`;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.url = 'http://live.telldus.com/';
		this.noDeviceTitle = formatMessage(messages.messageNoDeviceTitle);
		this.noGatewayTitle = formatMessage(messages.messageNoGatewayTitle);
		this.noDeviceContent = formatMessage(messages.messageNoDeviceContent);
		this.noGatewayContent = formatMessage(messages.messageNoGatewayContent);

		const labelDevice = formatMessage(i18n.labelDevice).toLowerCase();
		this.headerOnHide = formatMessage(i18n.headerOnHide, { type: labelDevice });
		this.messageOnHide = formatMessage(i18n.messageOnHide, { type: labelDevice });
		this.labelHide = formatMessage(i18n.hide).toUpperCase();
	}

	componentWillReceiveProps(nextProps: Object) {

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
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.tab === 'devicesTab';
	}

	openDeviceDetail(device: Object) {
		this.props.stackNavigator.navigate('DeviceDetails', { id: device.id });
	}

	onCloseSelected() {
		this.setState({ deviceId: -1 });
	}

	setScrollEnabled(enable: boolean) {
		this.setState({
			scrollEnabled: enable,
			isRefreshing: false,
			showRefresh: enable,
		});
	}

	setIgnoreDevice(device: Object) {
		let ignore = device.ignored ? 0 : 1;
		if (!device.ignored && !this.state.showConfirmDialogue) {
			this.setState({
				showConfirmDialogue: true,
				deviceToHide: device,
			});
		} else {
			this.props.dispatch(setIgnoreDevice(device.id, ignore)).then((res: Object) => {
				let message = device.ignored ?
					this.removedFromHiddenList : this.addedToHiddenList;
				this.props.dispatch(showToast(message));
				this.props.dispatch(getDevices());
			}).catch((err: Object) => {
				let message = err.message ? err.message : null;
				this.props.dispatch(showToast(message));
			});
		}
	}

	onConfirmDialogueHide() {
		this.setIgnoreDevice(this.state.deviceToHide);
		this.setState({
			showConfirmDialogue: false,
		});
	}

	onDismissDialogueHide() {
		this.setState({
			showConfirmDialogue: false,
		});
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

	renderRow(row: Object): Object {
		let { screenProps, gateways } = this.props;
		let { propsSwipeRow } = this.state;
		let { intl, currentTab, currentScreen } = screenProps;
		let isGatewayActive = gateways.byId[row.item.clientId] && gateways.byId[row.item.clientId].online;

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
				setIgnoreDevice={this.setIgnoreDevice}
				onPressMore={this.onPressMore}
				onHiddenRowOpen={this.closeVisibleRows}
				propsSwipeRow={propsSwipeRow}
			/>
		);
	}

	closeVisibleRows(deviceId: string) {
		this.setState({
			propsSwipeRow: {
				idToKeepOpen: deviceId,
				forceClose: true,
			},
		});
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

	keyExtractor(item: Object): number {
		return item.id;
	}

	getType(deviceId: number): null | string {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	onPressAddLocation() {
		this.props.addNewLocation()
			.then((response: Object) => {
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
			Linking.canOpenURL(url).then((supported: boolean): any => {
				if (!supported) {
				  console.log(`Can't handle url: ${url}`);
				} else {
				  return Linking.openURL(url);
				}
			  }).catch((err: Object) => {
				  console.error('An error occurred', err);
			  });
		}
	}

	toggleHiddenList() {
		this.setState({
			showHiddenList: !this.state.showHiddenList,
		});
	}

	noDeviceMessage(style: Object): Object {
		return (
			<View style={style.noItemsContainer}>
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

	noGatewayMessage(style: Object): Object {
		return (
			<View style={style.noItemsContainer}>
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

	toggleHiddenListButton(style: Object): Object {
		return (
			<TouchableOpacity style={style.toggleHiddenListButton} onPress={this.toggleHiddenList}>
				<IconTelldus icon="hidden" style={style.toggleHiddenListIcon}
					importantForAccessibility="no" accessible={false}/>
				<Text style={style.toggleHiddenListText} accessible={true}>
					{this.state.showHiddenList ?
						this.hideHidden
						:
						this.showHidden
					}
				</Text>
			</TouchableOpacity>
		);
	}

	handleOnStartShouldSetResponder(ev: Object): boolean {
		return false;
	}

	render(): Object {

		let { appLayout, devices } = this.props;
		let { showHiddenList, hiddenList, visibleList,
			isRefreshing, makeRowAccessible, addGateway, propsSwipeRow,
			scrollEnabled, showRefresh, showConfirmDialogue } = this.state;
		let style = this.getStyles(appLayout);

		if (addGateway) {
			return this.noGatewayMessage(style);
		}

		if (!devices.allIds.length > 0 && devices.didFetch) {
			return this.noDeviceMessage(style);
		}

		let extraData = {
			makeRowAccessible,
			appLayout,
			propsSwipeRow,
		};

		return (
			<ScrollView style={style.container}
				scrollEnabled={scrollEnabled}
				refreshControl={
					<RefreshControl
						enabled={showRefresh}
						refreshing={isRefreshing}
						onRefresh={this.onRefresh}
					/>}
				onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
			>
				<SectionList
					sections={visibleList}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					extraData={extraData}
					scrollEnabled={scrollEnabled}
					onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
				/>
				<View>
					{this.toggleHiddenListButton(style)}
					{showHiddenList ?
						<SectionList
							sections={hiddenList}
							renderItem={this.renderRow}
							renderSectionHeader={this.renderSectionHeader}
							keyExtractor={this.keyExtractor}
							extraData={extraData}
							scrollEnabled={scrollEnabled}
							onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
						/>
						:
						<View style={{height: 80}}/>
					}
				</View>
				<DialogueBox
					showDialogue={showConfirmDialogue}
					header={
						<DialogueHeader
							headerText={this.headerOnHide}
							showIcon={false}
							headerStyle={style.dialogueHeaderStyle}
							textStyle={style.dialogueHeaderTextStyle}/>
					}
					text={
						<View style={style.dialogueBodyStyle}>
							<Text style={style.dialogueBodyTextStyle}>
								{this.messageOnHide}
							</Text>
						</View>
					}
					showNegative={true}
					onPressNegative={this.onDismissDialogueHide}
					showPositive={true}
					positiveText={this.labelHide}
					onPressPositive={this.onConfirmDialogueHide}
				/>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		return {
			noItemsContainer: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 30,
				paddingTop: 10,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
			},
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
			dialogueHeaderStyle: {
				paddingVertical: 10,
				paddingHorizontal: 20,
				width: deviceWidth * 0.75,
			},
			dialogueHeaderTextStyle: {
				fontSize: 13,
			},
			dialogueBodyStyle: {
				paddingHorizontal: 20,
				paddingVertical: 10,
				width: deviceWidth * 0.75,
			},
			dialogueBodyTextStyle: {
				fontSize: 13,
				color: '#6B6969',
			},
		};
	}
}

const getRowsAndSections = createSelector(
	[
		({ devices }: Object): Object => devices.byId,
		({ gateways }: Object): Object => gateways.byId,
	],
	(devices: Object, gateways: Object): Object => {
		return parseDevicesForListView(devices, gateways);
	}
);

function mapStateToProps(state: Object, ownprops: Object): Object {
	return {
		stackNavigator: ownprops.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(state),
		devices: state.devices,
		gateways: state.gateways,
		tab: state.navigation.tab,
		appLayout: state.App.layout,
		screenReaderEnabled: state.App.screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		addNewLocation: (): Promise<any> => {
			return dispatch(addNewGateway());
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DevicesTab);

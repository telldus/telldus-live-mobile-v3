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
import Platform from 'Platform';

import {
	Text,
	View,
	TouchableButton,
	IconTelldus,
	DialogueBox,
	DialogueHeader,
	FloatingButton,
} from '../../../BaseComponents';
import { DeviceRow, DeviceHeader } from './SubViews';
import { DimmerControlInfo } from './SubViews/Device';

import { getDevices, setIgnoreDevice } from '../../Actions/Devices';

import { getTabBarIcon } from '../../Lib';

import { parseDevicesForListView } from '../../Reducers/Devices';
import { addNewGateway, showToast } from '../../Actions';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	rowsAndSections: Object,
	gateways: Array<any>,
	devices: Array<any>,
	devicesDidFetch: boolean,
	dispatch: Function,
	screenProps: Object,
	navigation: Object,
	screenReaderEnabled: boolean,
	addNewLocation: Function,
};

type State = {
	dimmer: boolean,
	addGateway: boolean,
	isRefreshing: boolean,
	showHiddenList: boolean,
	propsSwipeRow: Object,
	scrollEnabled: boolean,
	showRefresh: boolean,
	dialogueBoxConf: Object,
};

class DevicesTab extends View {

	props: Props;
	state: State;

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

	addNewDevice: () => void;
	showDimInfo: (Object) => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(i18n.devices),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'devices'),
	});

	constructor(props: Props) {
		super(props);

		this.state = {
			dimmer: false,
			addGateway: false,
			isRefreshing: false,
			showHiddenList: false,
			propsSwipeRow: {
				idToKeepOpen: null,
				forceClose: false,
			},
			scrollEnabled: true,
			showRefresh: true,
			dialogueBoxConf: {
				show: false,
				action: '',
				device: {},
			},
		};

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
		this.addNewDevice = this.addNewDevice.bind(this);

		let { formatMessage } = props.screenProps.intl;

		let hiddenDevices = formatMessage(i18n.hiddenDevices).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenDevices}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenDevices}`;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		this.url = 'http://live.telldus.com/';
		this.noDeviceTitle = formatMessage(i18n.messageNoDeviceTitle);
		this.noGatewayTitle = formatMessage(i18n.messageNoGatewayTitle);
		this.noDeviceContent = formatMessage(i18n.messageNoDeviceContent);
		this.noGatewayContent = formatMessage(i18n.messageNoGatewayContent);

		const labelDevice = formatMessage(i18n.labelDevice).toLowerCase();
		this.headerOnHide = formatMessage(i18n.headerOnHide, { type: labelDevice });
		this.messageOnHide = formatMessage(i18n.messageOnHide, { type: labelDevice });
		this.labelHide = formatMessage(i18n.hide).toUpperCase();

		this.showDimInfo = this.showDimInfo.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps.screenProps;
		const { currentScreen: prevScreen } = this.props.screenProps;
		return (currentScreen === 'Devices') || (currentScreen !== 'Devices' && prevScreen === 'Devices');
	}

	openDeviceDetail(device: Object) {
		// Passing only the id(not whole device object) through navigation param, again the device properties
		// are retrived inside 'DeviceDetails' by matching 'id' with device data from store
		// It is important to use data from store directly(not through navigation param) to get updates(socket and other)
		this.props.navigation.navigate({
			routeName: 'DeviceDetails',
			key: 'DeviceDetails',
			params: { id: device.id },
		});
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
		const { show } = this.state.dialogueBoxConf;
		if (!device.ignored && !show) {
			this.setState({
				dialogueBoxConf: {
					show: true,
					action: 'set_ignore',
					device,
				},
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
		this.setIgnoreDevice(this.state.dialogueBoxConf.device);
		const { dialogueBoxConf } = this.state;
		this.setState({
			dialogueBoxConf: {
				...dialogueBoxConf,
				show: false,
			},
		});
	}

	onDismissDialogueHide() {
		const { dialogueBoxConf } = this.state;
		this.setState({
			dialogueBoxConf: {
				...dialogueBoxConf,
				show: false,
			},
		});
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

	onPressAddLocation() {
		this.props.addNewLocation()
			.then((response: Object) => {
				if (response.client) {
					this.props.navigation.navigate({
						routeName: 'AddLocation',
						key: 'AddLocation',
						params: { clients: response.client },
					});
					this.setState({
						addGateway: false,
					});
				}
			});
	}

	onPressAddDevice() {
		if (!(this.props.gateways.length > 0)) {
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

	showDimInfo(device: Object) {
		this.setState({
			dialogueBoxConf: {
				show: true,
				action: 'dim_info',
				device,
			},
		});
	}

	handleOnStartShouldSetResponder(ev: Object): boolean {
		return false;
	}

	getDialogueBoxData(style: Object, appLayout: Object, intl: Object): Object {
		const { show, action, device } = this.state.dialogueBoxConf;
		let data = {
			showDialogue: show,
		};
		if (action === 'dim_info') {
			const { isOnline, name, id } = device;
			const styles = {
				dialogueHeaderStyle: style.dialogueHeaderStyle,
				dialogueHeaderTextStyle: style.dialogueHeaderTextStyle,
				dialogueBodyStyle: style.dialogueBodyStyle,
				dialogueBodyTextStyle: style.dialogueBodyTextStyle,
			};

			return {
				...data,
				showHeader: false,
				header: null,
				text: <DimmerControlInfo
					style={styles}
					name={name}
					id={id}
					onPressButton={this.onDismissDialogueHide}
					isOnline={isOnline}
					appLayout={appLayout}
					intl={intl}
				/>,
				dialogueBoxStyle: style.dialogueBoxStyle,
				backdropOpacity: 0,
			};
		}
		if (action === 'set_ignore') {
			return {
				...data,
				header: <DialogueHeader
					headerText={this.headerOnHide}
					showIcon={false}
					headerStyle={style.dialogueHeaderStyle}
					textStyle={style.dialogueHeaderTextStyle}/>,
				text: <View style={style.dialogueBodyStyle}>
					<Text style={style.dialogueBodyTextStyle}>
						{this.messageOnHide}
					</Text>
				</View>,
				showNegative: true,
				onPressNegative: this.onDismissDialogueHide,
				showPositive: true,
				positiveText: this.labelHide,
				onPressPositive: this.onConfirmDialogueHide,
			};
		}
		return data;
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
					<Image source={{uri: 'telldus'}} style={style.image}/>
					<Text style={style.link}>
						live.telldus.com
					</Text>
					<Image source={{uri: 'right_arrow_key'}} style={style.rightArrow}/>
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
		const { screenProps } = this.props;
		const accessible = screenProps.currentScreen === 'Sensors';
		return (
			<TouchableOpacity
				style={style.toggleHiddenListButton}
				onPress={this.toggleHiddenList}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
				<IconTelldus icon="hidden" style={style.toggleHiddenListIcon}
					importantForAccessibility="no" accessible={false}/>
				<Text style={style.toggleHiddenListText} accessible={accessible}>
					{this.state.showHiddenList ?
						this.hideHidden
						:
						this.showHidden
					}
				</Text>
			</TouchableOpacity>
		);
	}

	renderSectionHeader(sectionData: Object): Object {
		const { supportLocalControl, isOnline, websocketOnline } = sectionData.section.data[0];

		return (
			<DeviceHeader
				gateway={sectionData.section.key}
				appLayout={this.props.screenProps.appLayout}
				supportLocalControl={supportLocalControl}
				isOnline={isOnline}
				websocketOnline={websocketOnline}
			/>
		);
	}

	renderRow(row: Object): Object {
		const { screenProps } = this.props;
		const { appLayout } = screenProps;
		const { propsSwipeRow } = this.state;
		const { intl, currentScreen, screenReaderEnabled } = screenProps;
		const { item } = row;
		const { isOnline, supportLocalControl } = item;

		return (
			<DeviceRow
				device={item}
				onSettingsSelected={this.openDeviceDetail}
				setScrollEnabled={this.setScrollEnabled}
				intl={intl}
				appLayout={appLayout}
				currentScreen={currentScreen}
				isGatewayActive={isOnline || supportLocalControl}
				setIgnoreDevice={this.setIgnoreDevice}
				onPressMore={this.onPressMore}
				onHiddenRowOpen={this.closeVisibleRows}
				onPressDimButton={this.showDimInfo}
				propsSwipeRow={propsSwipeRow}
				screenReaderEnabled={screenReaderEnabled}
			/>
		);
	}

	addNewDevice() {
		const { navigation, gateways } = this.props;
		const gatewaysLen = gateways.length;
		if (gatewaysLen > 0) {
			const singleGateway = gatewaysLen === 1;
			navigation.navigate('AddDevice', {
				selectLocation: !singleGateway,
				gateway: singleGateway ? gateways[0] : null,
			});
		}
	}

	render(): Object {

		const {
			devices,
			devicesDidFetch,
			rowsAndSections,
			screenProps,
			screenReaderEnabled,
		} = this.props;
		const { appLayout, intl } = screenProps;
		const {
			showHiddenList,
			isRefreshing,
			addGateway,
			propsSwipeRow,
			scrollEnabled,
			showRefresh,
		} = this.state;
		const { visibleList, hiddenList } = rowsAndSections;

		const style = this.getStyles(appLayout);

		if (addGateway) {
			return this.noGatewayMessage(style);
		}

		if (devices.length === 0 && devicesDidFetch) {
			return this.noDeviceMessage(style);
		}

		let makeRowAccessible = 0;
		if (screenReaderEnabled && screenProps.currentScreen === 'Devices') {
			makeRowAccessible = 1;
		}
		const extraData = {
			makeRowAccessible,
			appLayout,
			propsSwipeRow,
		};
		const {
			showDialogue,
			header,
			text,
			showNegative,
			onPressNegative,
			showPositive,
			positiveText,
			onPressPositive,
			dialogueBoxStyle,
			backdropOpacity,
			showHeader,
		} = this.getDialogueBoxData(style, appLayout, intl);

		return (
			<View style={{
				flex: 1,
			}}>
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
					<View importantForAccessibility={screenProps.currentScreen === 'Devices' ? 'no' : 'no-hide-descendants'}>
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
						showDialogue={showDialogue}
						showHeader={showHeader}
						header={header}
						text={text}
						style={dialogueBoxStyle}
						showNegative={showNegative}
						onPressNegative={onPressNegative}
						showPositive={showPositive}
						positiveText={positiveText}
						onPressPositive={onPressPositive}
						backdropOpacity={backdropOpacity}
					/>
				</ScrollView>
				<FloatingButton
					onPress={this.addNewDevice}
					imageSource={{uri: 'icon_plus'}}
				/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		let hiddenListTextFontSize = Math.floor(deviceWidth * 0.049);
		hiddenListTextFontSize = hiddenListTextFontSize > 25 ? 25 : hiddenListTextFontSize;

		let hiddenListIconFontSize = Math.floor(deviceWidth * 0.088);
		hiddenListIconFontSize = hiddenListIconFontSize > 50 ? 50 : hiddenListIconFontSize;

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
				paddingHorizontal: this.props.devices.length === 0 ? 30 : 0,
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
				textAlignVertical: 'center',
				color: '#4C4C4C',
				marginLeft: 10,
				fontSize: isPortrait ? Math.floor(width * 0.06) : Math.floor(height * 0.06),
			},
			rightArrow: {
				marginLeft: 5,
				height: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
				width: isPortrait ? Math.floor(width * 0.03) : Math.floor(height * 0.03),
				tintColor: '#e26901',
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
				fontSize: hiddenListIconFontSize,
				color: Theme.Core.rowTextColor,
			},
			toggleHiddenListText: {
				marginLeft: 6,
				fontSize: hiddenListTextFontSize,
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
			dialogueBoxStyle: {
				borderRadius: 8,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 8,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
				backgroundColor: '#fff',
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
	const { screenReaderEnabled } = state.app;
	return {
		rowsAndSections: getRowsAndSections(state),
		devices: state.devices.allIds,
		devicesDidFetch: state.devices.didFetch,
		gateways: state.gateways.allIds,
		screenReaderEnabled,
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

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
import {
	TouchableOpacity,
	SectionList,
	LayoutAnimation,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';

import {
	Text,
	View,
	IconTelldus,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import { DeviceRow, DeviceHeader } from './SubViews';
import { DimmerControlInfo } from './SubViews/Device';
import {
	NoGateways,
	NoDevices,
} from './SubViews/EmptyInfo';

import { getDevices, setIgnoreDevice } from '../../Actions/Devices';
import {
	LayoutAnimations,
	getItemLayout,
	askAddScheduleOnDevice,
} from '../../Lib';

import { parseDevicesForListView } from '../../Reducers/Devices';
import { addNewGateway, showToast, getGateways } from '../../Actions';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	rowsAndSections: Object,
	gateways: Array<any>,
	devices: Array<any>,
	devicesDidFetch: boolean,
	dispatch: Function,
	screenProps: Object,
	currentScreen: string,
	navigation: Object,
	screenReaderEnabled: boolean,
	addNewLocation: Function,
	gatewaysById: Object,
	route: Object,
	gatewaysDidFetch: boolean,
	batteryStatus: string,
};

type State = {
	dimmer: boolean,
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
	toggleHiddenList: () => void;
	setIgnoreDevice: (Object) => void;
	closeVisibleRows: (string) => void;
	onDismissDialogueHide: () => void;
	onConfirmDialogueHide: (?Object) => void;

	showDimInfo: (Object) => void;
	handleAddDeviceAttentionCapture: () => void;

	onNewlyAddedDidMount: (id: number, clientId: string) => void;

	setRef: (any) => void;
	listView: any;

	onPressDeviceAction: () => void;

	defaultDescriptionButton: string;

	openRGBControl: (number) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			dimmer: false,
			isRefreshing: false,
			showHiddenList: false,
			propsSwipeRow: {
				idToKeepOpen: null,
				forceClose: false,
			},
			scrollEnabled: true,
			showRefresh: true,
			dialogueBoxConf: {
				action: '',
				device: {},
			},
		};

		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.setIgnoreDevice = this.setIgnoreDevice.bind(this);

		this.toggleHiddenList = this.toggleHiddenList.bind(this);
		this.closeVisibleRows = this.closeVisibleRows.bind(this);
		this.onDismissDialogueHide = this.onDismissDialogueHide.bind(this);
		this.onConfirmDialogueHide = this.onConfirmDialogueHide.bind(this);

		const { intl, appLayout } = props.screenProps;
		let { formatMessage } = intl;

		let hiddenDevices = formatMessage(i18n.hiddenDevices).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenDevices}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenDevices}`;

		this.addedToHiddenList = formatMessage(i18n.deviceAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.deviceRemovedFromHiddenList);

		const labelDevice = formatMessage(i18n.labelDevice).toLowerCase();
		this.headerOnHide = formatMessage(i18n.headerOnHide, { type: labelDevice });
		this.messageOnHide = formatMessage(i18n.messageOnHide, { type: labelDevice });
		this.labelHide = formatMessage(i18n.hide);
		this.defaultDescriptionButton = formatMessage(i18n.defaultDescriptionButton);

		this.handleAddDeviceAttentionCapture = this.handleAddDeviceAttentionCapture.bind(this);
		this.setRef = this.setRef.bind(this);
		this.listView = null;

		this.timeoutNormalizeNewlyAdded = null;
		this.timeoutScrollToHidden = null;

		this.onPressDeviceAction = this.onPressDeviceAction.bind(this);

		this.hideAttentionCaptureTimeout = null;
		this.attentionCapture = false;

		this.openRGBControl = this.openRGBControl.bind(this);

		this.getItemLayout = getItemLayout(appLayout);
		this.calledOnNewlyAddedDidMount = false;
	}

	componentDidMount() {
		this.handleAddDeviceAttentionCapture();
		this.normalizeNewlyAddedUITimeout();
		this.calledOnNewlyAddedDidMount = false;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps;
		const { currentScreen: prevScreen } = this.props;
		return (currentScreen === 'Devices') || (currentScreen !== 'Devices' && prevScreen === 'Devices');
	}

	componentDidUpdate(prevProps: Object) {
		this.handleAddDeviceAttentionCapture();
		this.normalizeNewlyAddedUITimeout();

		const {
			route,
			screenProps,
		} = this.props;
		const {
			newDevices = {},
			gateway,
		} = route.params || {};
		if (gateway && newDevices && !isEmpty(newDevices) && !this.calledOnNewlyAddedDidMount) {
			Object.keys(newDevices).map((id: string) => {
				let gId = gateway.id.toString();
				this.onNewlyAddedDidMount(parseInt(id, 10), gId);
			});
		}

		const {
			appLayout = {},
		} = screenProps;
		const {
			screenProps: {
				appLayout: prevAppLayout,
			},
		} = prevProps;
		if (appLayout.height !== prevAppLayout.height || appLayout.width !== prevAppLayout.width) {
			this.getItemLayout = getItemLayout(appLayout);
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timeoutNormalizeNewlyAdded);
		clearTimeout(this.timeoutScrollToHidden);
		clearTimeout(this.hideAttentionCaptureTimeout);
		this.calledOnNewlyAddedDidMount = false;
	}

	setRef(ref: any) {
		this.listView = ref;
	}

	handleAddDeviceAttentionCapture() {
		const {
			devicesDidFetch,
			devices,
			screenProps,
			gatewaysDidFetch,
			gateways,
		} = this.props;
		const { toggleAttentionCapture, showAttentionCaptureAddDevice } = screenProps;

		const allowToggleLocal = !this.attentionCapture;
		const isDevicesEmpty = devices.length === 0 && devicesDidFetch;
		const hasGateways = gateways.length > 0 && gatewaysDidFetch;
		if (hasGateways &&
			(isDevicesEmpty &&
			toggleAttentionCapture &&
			!showAttentionCaptureAddDevice &&
			allowToggleLocal)
		) {
			this.attentionCapture = true;
			toggleAttentionCapture(true);
			this.startHideAttentionCaptureTimeout();
		}

		if (devices.length > 0 && devicesDidFetch && showAttentionCaptureAddDevice && toggleAttentionCapture) {
			toggleAttentionCapture(false);
		}
	}

	startHideAttentionCaptureTimeout() {
		if (!this.hideAttentionCaptureTimeout) {
			this.hideAttentionCaptureTimeout = setTimeout(() => {
				const { screenProps } = this.props;
				const { showAttentionCaptureAddDevice, toggleAttentionCapture } = screenProps;
				if (toggleAttentionCapture && showAttentionCaptureAddDevice) {
					toggleAttentionCapture(false);
				}
			}, 10000);
		}
	}

	openDeviceDetail(device: Object) {
		// Passing only the id(not whole device object) through navigation param, again the device properties
		// are retrived inside 'DeviceDetails' by matching 'id' with device data from store
		// It is important to use data from store directly(not through navigation param) to get updates(socket and other)
		this.props.navigation.navigate('DeviceDetails', {
			screen: 'Overview',
			params: {
				id: device.id,
			},
			id: device.id,
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
		if (!device.ignored) {
			this.setState({
				dialogueBoxConf: {
					action: 'set_ignore',
					device,
				},
			}, () => {
				this.openDialogueBox('set_ignore', device);
			});
		} else {
			this.onConfirmDialogueHide(device);
		}
	}

	openDialogueBox(action: string, device: Object) {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = this.getDialogueBoxData(action, device);
		toggleDialogueBox(dialogueData);
	}

	onConfirmDialogueHide(device?: Object) {
		const { dialogueBoxConf } = this.state;
		this.setState({
			dialogueBoxConf: {
				...dialogueBoxConf,
			},
		}, () => {
			let deviceC = device ? device : this.state.dialogueBoxConf.device;
			let ignore = deviceC.ignored ? 0 : 1;
			this.props.dispatch(setIgnoreDevice(deviceC.id, ignore)).then((res: Object) => {
				let message = deviceC.ignored ?
					this.removedFromHiddenList : this.addedToHiddenList;
				this.props.dispatch(showToast(message));
				this.props.dispatch(getDevices());
			}).catch((err: Object) => {
				let message = err.message ? err.message : null;
				this.props.dispatch(showToast(message));
			});
		});
	}

	onDismissDialogueHide() {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		toggleDialogueBox({show: false});
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
		let promises = [
			this.props.dispatch(getGateways()),
			this.props.dispatch(getDevices()),
		];
		Promise.all(promises).then(() => {
			this.setState({
				isRefreshing: false,
			});
		}).catch(() => {
			this.setState({
				isRefreshing: false,
			});
		});
	}

	keyExtractor(item: Object): string {
		return `${item.id}`;
	}

	toggleHiddenList() {
		const { rowsAndSections } = this.props;
		const { hiddenList, visibleList } = rowsAndSections;
		if (this.timeoutScrollToHidden) {
			clearTimeout(this.timeoutScrollToHidden);
		}
		LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
		this.setState({
			showHiddenList: !this.state.showHiddenList,
		}, () => {
			const { showHiddenList } = this.state;
			if (showHiddenList && hiddenList.length > 0 && visibleList.length > 0) {
				if (this.timeoutScrollToHidden) {
					clearTimeout(this.timeoutScrollToHidden);
				}
				this.timeoutScrollToHidden = setTimeout(() => {
					if (this.listView) {
						this.listView.scrollToLocation({
							animated: true,
							sectionIndex: visibleList.length - 1,
							itemIndex: 0,
							viewPosition: 0.6,
						});
					}
				}, 500);
			}
		});
	}

	showDimInfo = (device: Object) => {
		this.setState({
			dialogueBoxConf: {
				action: 'dim_info',
				device,
			},
		});
	}

	hideDimInfo = (device: Object) => {
		this.setState({
			dialogueBoxConf: {
				action: '',
				device: {},
			},
		});
	}

	handleOnStartShouldSetResponder(ev: Object): boolean {
		return false;
	}

	openRGBControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('RGBControl', {
			id,
		});
	}

	openThermostatControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('ThermostatControl', {
			id,
		});
	}

	getDialogueBoxData(action: string, device: Object): Object {
		let data = {
			show: true,
			closeOnPressPositive: true,
		};
		if (action === 'set_ignore') {
			return {
				...data,
				header: this.headerOnHide,
				text: this.messageOnHide,
				showNegative: true,
				showHeader: true,
				onPressNegative: this.onDismissDialogueHide,
				showPositive: true,
				positiveText: this.labelHide,
				onPressPositive: this.onConfirmDialogueHide,
				closeOnPressNegative: true,
			};
		}
		return data;
	}

	toggleHiddenListButton(): Object {
		const { screenProps, currentScreen } = this.props;
		const accessible = currentScreen === 'Devices';
		const style = this.getStyles({
			appLayout: screenProps.appLayout,
		});

		const { showHiddenList } = this.state;
		const accessibilityLabelOne = showHiddenList ? this.hideHidden : this.showHidden;
		const accessibilityLabel = `${accessibilityLabelOne}, ${this.defaultDescriptionButton}`;

		return (
			<TouchableOpacity
				style={style.toggleHiddenListButton}
				onPress={this.toggleHiddenList}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
				accessibilityLabel={accessibilityLabel}>
				<IconTelldus
					level={2}
					icon="hidden"
					style={style.toggleHiddenListIcon}
					importantForAccessibility="no"
					accessible={false}/>
				<Text
					level={2}
					style={style.toggleHiddenListText}
					accessible={false}>
					{showHiddenList ?
						this.hideHidden
						:
						this.showHidden
					}
				</Text>
			</TouchableOpacity>
		);
	}

	renderSectionHeader(sectionData: Object): Object | null {
		const { supportLocalControl, isOnline, websocketOnline } = sectionData.section.data[0];
		if (sectionData.section.header === Theme.Core.buttonRowKey) {
			return null;
		}

		const { screenProps, gatewaysById, currentScreen } = this.props;

		const { name } = gatewaysById[sectionData.section.header] || {};

		return (
			<DeviceHeader
				gateway={name}
				appLayout={screenProps.appLayout}
				intl={screenProps.intl}
				supportLocalControl={supportLocalControl}
				isOnline={isOnline}
				websocketOnline={websocketOnline}
				accessible={currentScreen === 'Devices'}
			/>
		);
	}

	renderRow(row: Object): Object {
		const {
			screenProps,
			route,
			currentScreen,
			batteryStatus,
		} = this.props;
		const { propsSwipeRow } = this.state;
		const { intl, screenReaderEnabled, appLayout } = screenProps;
		const { item, section, index } = row;
		const { isOnline, supportLocalControl, buttonRow, id } = item;

		if (buttonRow) {
			return (
				<View importantForAccessibility={currentScreen === 'Devices' ? 'no' : 'no-hide-descendants'}>
					{this.toggleHiddenListButton()}
				</View>
			);
		}

		const {
			newDevices = {},
		} = route.params || {};

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

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
				isNew={!!newDevices[id]}
				gatewayId={section.header}
				onPressDeviceAction={this.onPressDeviceAction}
				openRGBControl={this.openRGBControl}
				isLast={isLast}
				openThermostatControl={this.openThermostatControl}
				batteryStatus={batteryStatus}
			/>
		);
	}

	onPressDeviceAction() {
		this.normalizeNewlyAddedUI();
	}

	normalizeNewlyAddedUITimeout = () => {
		const { route } = this.props;
		const {
			newDevices,
		} = route.params || {};
		if (newDevices && !this.timeoutNormalizeNewlyAdded ) {
			this.timeoutNormalizeNewlyAdded = setTimeout(() => {
				this.normalizeNewlyAddedUI();
				clearTimeout(this.timeoutNormalizeNewlyAdded);
				this.timeoutNormalizeNewlyAdded = null;
				this.calledOnNewlyAddedDidMount = false;
			}, 3000);
		}
	}

	normalizeNewlyAddedUI = () => {
		const {
			route,
			navigation,
			currentScreen,
			rowsAndSections,
		} = this.props;
		const {
			newDevices,
		} = route.params || {};

		if (newDevices) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			navigation.setParams({
				newDevices: undefined,
			});
			let mainNodeId = '';
			Object.keys(newDevices).forEach((id: string) => {
				if (newDevices[id].mainNode) {
					mainNodeId = id;
				}
			});

			const { visibleList } = rowsAndSections;
			let device = null;
			for (let i = 0; i < visibleList.length; i++) {
				const list = visibleList[i];
				for (let j = 0; j < list.data.length; j++) {
					if (list.data[j].id && parseInt(list.data[j].id, 10) === parseInt(mainNodeId, 10)) {
						device = list.data[j];
						break;
					}
				}
				if (device) {
					break;
				}
			}

			if (!device) {
				device = {};
			}

			const canAddSchedule = askAddScheduleOnDevice(device.deviceType);
			if (currentScreen === 'Devices' && canAddSchedule) {
				navigation.navigate('InfoScreen', {
					info: 'add_schedule',
					deviceId: mainNodeId,
				});
			}
		}
	}

	onNewlyAddedDidMount = (id: number, clientId: string) => {
		const { rowsAndSections, route } = this.props;
		const { visibleList } = rowsAndSections;
		const {
			newDevices,
		} = route.params || {};
		let section = 0, row = 0;
		let item = newDevices[id];

		if (item && item.mainNode) {
			for (let i = 0; i < visibleList.length; i++) {
				const list = visibleList[i];
				if (list.header && list.header.toString() === clientId) {
					section = i;
					for (let j = 0; j < list.data.length; j++) {
						if (list.data[j].id && parseInt(list.data[j].id, 10) === id) {
							row = j;
							break;
						}
					}
					if (row) {
						break;
					}
				}
			}
			if (this.listView) {
				this.calledOnNewlyAddedDidMount = true;
				this.listView.scrollToLocation({
					animated: true,
					sectionIndex: section,
					itemIndex: row,
					viewPosition: 0.4,
				});
			}
		}
	}

	prepareFinalListData(rowsAndSections: Object): Array<Object> {
		const { showHiddenList } = this.state;
		const { visibleList, hiddenList } = rowsAndSections;
		if (!showHiddenList) {
			return visibleList;
		}
		return visibleList.concat(hiddenList);
	}

	render(): Object {

		const {
			devices,
			devicesDidFetch,
			rowsAndSections,
			screenProps,
			screenReaderEnabled,
			gatewaysDidFetch,
			gateways,
			currentScreen,
		} = this.props;
		const {
			appLayout,
			addingNewLocation,
			addNewLocation,
			intl,
		} = screenProps;
		const {
			isRefreshing,
			propsSwipeRow,
			scrollEnabled,
			showRefresh,
			dialogueBoxConf,
		} = this.state;
		const {
			action,
			device,
		} = dialogueBoxConf;
		const showDimInfo = action === 'dim_info' && !!device;

		const style = this.getStyles({
			appLayout,
		});

		if (gateways.length === 0 && gatewaysDidFetch) {
			return <NoGateways
				disabled={addingNewLocation}
				onPress={addNewLocation}/>;
		}

		const hasGateways = gateways.length > 0 && gatewaysDidFetch;
		if (hasGateways && devices.length === 0 && devicesDidFetch) {
			return <NoDevices/>;
		}

		let makeRowAccessible = 0;
		if (screenReaderEnabled && currentScreen === 'Devices') {
			makeRowAccessible = 1;
		}
		const extraData = {
			makeRowAccessible,
			appLayout,
			propsSwipeRow,
		};
		const listData = this.prepareFinalListData(rowsAndSections);
		return (
			<View
				level={3}
				style={style.container}>
				<SectionList
					sections={listData}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					stickySectionHeadersEnabled={true}
					refreshControl={
						<ThemedRefreshControl
							enabled={showRefresh}
							refreshing={isRefreshing}
							onRefresh={this.onRefresh}
						/>
					}
					keyExtractor={this.keyExtractor}
					extraData={extraData}
					scrollEnabled={scrollEnabled}
					onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
					ref={this.setRef}
					getItemLayout={this.getItemLayout}
				/>
				<DimmerControlInfo
					show={showDimInfo}
					style={{
						dialogueHeaderTextStyle: style.dialogueHeaderTextStyle,
						dialogueBodyStyle: style.dialogueBodyStyle,
						dialogueBodyTextStyle: style.dialogueBodyTextStyle,
						headerWidth: style.headerWidth,
						headerHeight: style.headerHeight,
					}}
					name={device.name}
					id={device.id}
					onPressButton={this.hideDimInfo}
					isOnline={device.isOnline}
					appLayout={appLayout}
					intl={intl}
				/>
			</View>
		);
	}

	getStyles({
		appLayout,
	}: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			androidLandMarginLeftFactor,
		} = Theme.Core;

		let hiddenListTextFontSize = Math.floor(deviceWidth * 0.049);
		hiddenListTextFontSize = hiddenListTextFontSize > 25 ? 25 : hiddenListTextFontSize;

		let hiddenListIconFontSize = Math.floor(deviceWidth * 0.088);
		hiddenListIconFontSize = hiddenListIconFontSize > 50 ? 50 : hiddenListIconFontSize;

		return {
			container: {
				flex: 1,
				paddingHorizontal: this.props.devices.length === 0 ? 30 : 0,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : (width * androidLandMarginLeftFactor),
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
			},
			toggleHiddenListText: {
				marginLeft: 6,
				fontSize: hiddenListTextFontSize,
				textAlign: 'center',
			},
			headerWidth: deviceWidth * 0.75,
			headerHeight: deviceWidth * 0.1,
			dialogueHeaderTextStyle: {
				fontSize: 13,
				left: 20,
			},
			dialogueBodyStyle: {
				paddingHorizontal: 20,
				paddingVertical: 10,
				width: deviceWidth * 0.75,
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
				overflow: 'visible',
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

	const {
		screenReaderEnabled,
		defaultSettings = {},
	} = state.app;
	const { screen: currentScreen } = state.navigation;
	const {
		batteryStatus,
	} = defaultSettings;

	return {
		rowsAndSections: getRowsAndSections(state),
		devices: state.devices.allIds,
		devicesDidFetch: state.devices.didFetch,
		gateways: state.gateways.allIds,
		gatewaysById: state.gateways.byId,
		gatewaysDidFetch: state.gateways.didFetch,
		screenReaderEnabled,
		currentScreen,
		batteryStatus,
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

export default (connect(mapStateToProps, mapDispatchToProps)(DevicesTab): Object);


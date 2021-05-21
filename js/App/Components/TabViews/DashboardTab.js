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
import { createSelector } from 'reselect';
import {
	Dimensions,
	LayoutAnimation,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import DragAndDropScrollView from 'react-native-drag-and-drop-scroll-view';

import {
	Text,
	View,
	EmptyView,
	TouchableOpacity,
	Icon,
	ThemedRefreshControl,
	TouchableButton,
} from '../../../BaseComponents';
import { DimmerControlInfo } from './SubViews/Device';
import {
	NoGateways,
} from './SubViews/EmptyInfo';

import {
	getDevices,
	getSensors,
	getGateways,
	showToast,
	changeSortingDB,
} from '../../Actions';
import {
	changeSensorDisplayTypeDB,
	updateDashboardOrder,
	removeFromDashboard,
	clearPreviousDb,
	usePreviousDb,
} from '../../Actions/Dashboard';

import i18n from '../../Translations/common';
import { parseDashboardForListView } from '../../Reducers/Dashboard';
import Theme from '../../Theme';

import {
	SensorDashboardTile,
	DashboardRow,
} from './SubViews';
import {
	MetWeatherDbTile,
} from './SubViews/MET';

import {
	LayoutAnimations,
	prepareVisibleTabs,
	DEVICE_KEY,
	SENSOR_KEY,
	MET_ID,
} from '../../Lib';

type Props = {
	rows: Array<Object>,
	isDBEmpty: boolean,
	screenProps: Object,
	dbCarousel: boolean,
	gatewaysDidFetch: boolean,
	gateways: Array<any>,
	currentScreen: string,
	hiddenTabsCurrentUser: Array<string>,
	sortingDB: 'Manual' | 'Alphabetical',
	dBTileDisplayMode: string,
	hasPreviousDB: boolean,
	hasLoggedOutPrevDb: boolean,

	navigation: Object,
	changeSensorDisplayTypeDB: (id?: number, kind?: string) => void,
	dispatch: Function,
	onTurnOn: (number) => void,
	onTurnOff: (number) => void,
	onDim: (number) => void,
	onDimmerSlide: (number) => void,
	onBell: (number) => void,
	onUp: (number) => void,
	onDown: (number) => void,
	onStop: (number) => void,
};

type State = {
	tileWidth: number,
	listWidth: number,
	settings: boolean,
	numColumns: number,
	isRefreshing: boolean,
	scrollEnabled: boolean,
	showRefresh: boolean,
	dialogueBoxConf: Object,
};

class DashboardTab extends View {

	props: Props;
	state: State;

	_onLayout: (Object) => void;
	setScrollEnabled: (boolean) => void;
	onSlidingStart: (name: string, value: number) => void;
	onSlidingComplete: () => void;
	onValueChange: (number) => void;
	startSensorTimer: () => void;
	stopSensorTimer: () => void;
	changeDisplayType: (number) => void;
	onRefresh: () => void;
	_renderRow: (Object) => Object;
	onDismissDialogueHide: () => void;

	showDimInfo: (Object) => void;

	openRGBControl: (number) => void;
	openThermostatControl: (number) => void;

	timeoutSwitchTabAndroid: any;

	constructor(props: Props) {
		super(props);
		const { width } = Dimensions.get('window');
		const { tileWidth, numColumns } = this.calculateTileWidth(width);
		this.state = {
			tileWidth,
			listWidth: 0,
			settings: false,
			numColumns,
			isRefreshing: false,
			scrollEnabled: true,
			showRefresh: true,
			dialogueBoxConf: {
				action: '',
				device: {},
			},
		};

		this.timer = null;

		this._onLayout = this._onLayout.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.startSensorTimer = this.startSensorTimer.bind(this);
		this.stopSensorTimer = this.stopSensorTimer.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);
		this.onRefresh = this.onRefresh.bind(this);

		this.noItemsTitle = props.screenProps.intl.formatMessage(i18n.messageNoItemsTitle);
		this.noItemsContent = props.screenProps.intl.formatMessage(i18n.messageNoItemsContent);

		this.onDismissDialogueHide = this.onDismissDialogueHide.bind(this);

		this.openRGBControl = this.openRGBControl.bind(this);
		this.openThermostatControl = this.openThermostatControl.bind(this);

		this.timeoutSwitchTabAndroid = null;
	}

	startSensorTimer() {
		const { dbCarousel } = this.props;
		if (dbCarousel) {
			this.timer = setInterval(() => {
				LayoutAnimation.configureNext(LayoutAnimations.SensorChangeDisplay);
				this.props.changeSensorDisplayTypeDB();
			}, 5000);
		}
	}

	stopSensorTimer() {
		clearInterval(this.timer);
		this.timer = null;
	}

	changeDisplayType(id: number, kind: string) {
		this.stopSensorTimer();
		LayoutAnimation.configureNext(LayoutAnimations.SensorChangeDisplay);
		this.props.changeSensorDisplayTypeDB(id, kind);
		this.startSensorTimer();
	}

	rowHasChanged(r1: Object, r2: Object): boolean {
		return r1.childObject !== r2.childObject;
	}

	setScrollEnabled(enable: boolean) {
		this.setState({
			scrollEnabled: enable,
			isRefreshing: false,
			showRefresh: enable,
		});
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});

		let promises = [
			this.props.dispatch(getGateways()),
			this.props.dispatch(getDevices()),
			this.props.dispatch(getSensors()),
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

	componentDidMount() {
		const {
			isDBEmpty,
			navigation,
			currentScreen,
			hiddenTabsCurrentUser,
			hasLoggedOutPrevDb,
		} = this.props;
		const possibleScreen = ['Dashboard', 'Tabs', 'Login'];
		if (isDBEmpty && possibleScreen.indexOf(currentScreen) !== -1) {
			// Navigating to other tab inside componentDidMount of one tab has an issue in Android
			// ISSUE: It successfully navigates to 'Devices' after after a second it navigates
			// back to Dashboard itself.
			// No issues in iOS though.

			const {
				tabToCheckOrVeryNext,
			} = prepareVisibleTabs(hiddenTabsCurrentUser, 'Devices');

			if (Platform.OS === 'android') {
				this.timeoutSwitchTabAndroid = setTimeout(() => {
					const { currentScreen: cSLat } = this.props;
					if (possibleScreen.indexOf(cSLat) !== -1) {
						navigation.navigate(tabToCheckOrVeryNext);
					}
					this.timeoutSwitchTabAndroid = null;
				}, 1000);
			} else {
				navigation.navigate(tabToCheckOrVeryNext);
			}
		}
		if (!isDBEmpty && !hasLoggedOutPrevDb) {
			this.startSensorTimer();
		}
	}

	componentWillUnmount() {
		this.stopSensorTimer();
		if (this.timeoutSwitchTabAndroid) {
			clearTimeout(this.timeoutSwitchTabAndroid);
			this.timeoutSwitchTabAndroid = null;
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps;
		if (currentScreen !== 'Dashboard' && this.timer) {
			this.stopSensorTimer();
		}
		return currentScreen === 'Dashboard';
	}

	componentDidUpdate(prevProps: Object) {
		const { currentScreen } = this.props;
		if (currentScreen === 'Dashboard' && prevProps.currentScreen !== 'Dashboard' && !this.timer) {
			this.startSensorTimer();
		}
	}

	_onLayout = (event: Object) => {
		const { tileWidth, numColumns } = this.calculateTileWidth(event.nativeEvent.layout.width);
		if (tileWidth !== this.state.tileWidth) {
			this.setState({
				tileWidth,
				numColumns,
			});
		}
	};

	calculateTileWidth(listWidth: number): Object {
		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const margin = this.getPadding() * 2;

		listWidth -= margin;

		if (listWidth <= 0) {
			return {tileWidth: 0, numColumns: 0};
		}
		const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		const tilesPerRow = Math.floor(listWidth / baseTileSize);
		const tileWidth = tilesPerRow === 0 ? baseTileSize : Math.floor(listWidth / tilesPerRow);
		return { tileWidth, numColumns: tilesPerRow };
	}

	onClearPrevDb = () => {
		const {
			dispatch,
		} = this.props;
		dispatch(clearPreviousDb());
	}

	onUsePrevDb = () => {
		const {
			dispatch,
		} = this.props;
		dispatch(usePreviousDb());
	}

	usePreviousDBMessage = (style: Object): Object => {
		const { screenProps } = this.props;
		const { intl } = screenProps;
		return (
			<View
				level={3}
				style={[style.container, {
					paddingHorizontal: 20,
					alignItems: 'center',
					justifyContent: 'center',
				}]}>
				<Icon
					name={'star'}
					size={style.starIconSize}
					level={23}/>
				<Text
					level={4}
					style={style.noItemsTitle}>
					{intl.formatMessage(i18n.prevDBHeader)}
				</Text>
				<Text
					level={26}
					style={style.noItemsContent}>
					{'\n'}
					{intl.formatMessage(i18n.prevDBBody)}
				</Text>
				<View style={style.oldDBButtonsCover}>
					<TouchableButton
						onPress={this.onClearPrevDb}
						text={intl.formatMessage(i18n.prevDBNeg)}
						style={style.buttonStyle}
						coverStyle={{
							flex: 0,
						}}
					/>
					<TouchableButton
						onPress={this.onUsePrevDb}
						text={intl.formatMessage(i18n.prevDBPos)}
						style={style.buttonStyle}
						coverStyle={{
							flex: 0,
						}}
					/>
				</View>
			</View>
		);
	}

	noItemsMessage(style: Object): Object {
		return (
			<View
				level={3}
				style={[style.container, {
					paddingHorizontal: 20,
					alignItems: 'center',
					justifyContent: 'center',
				}]}>
				<Icon
					name={'star'}
					size={style.starIconSize}
					level={23}/>
				<Text
					level={4}
					style={style.noItemsTitle}>
					{this.noItemsTitle}
				</Text>
				<Text
					level={26}
					style={style.noItemsContent}>
					{'\n'}
					{this.noItemsContent}
				</Text>
			</View>
		);
	}

	handleOnStartShouldSetResponder(ev: Object): boolean {
		return false;
	}

	onDismissDialogueHide() {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		toggleDialogueBox({show: false});
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

	openRGBControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('RGBControl',
			{
				id,
			});
	}

	openThermostatControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('ThermostatControl',
			{
				id,
			});
	}

	_onSortOrderUpdate = (data: Array<Object>) => {
		const {
			sortingDB,
			dispatch,
			screenProps,
		} = this.props;

		if (sortingDB === 'Alphabetical') {
			const settings = { sortingDB: 'Manual' };
			dispatch(changeSortingDB(settings));
			dispatch(showToast(screenProps.intl.formatMessage(i18n.dBSortChangedToManual)));
		}

		dispatch(updateDashboardOrder(data));
	}

	_onDelete = (index: number, item: Object, fullData: Array<Object>, {animateDeleted}: Object) => {
		if (item) {
			const {
				objectType,
				data,
			} = item;

			animateDeleted(() => {
				this.props.dispatch(removeFromDashboard(objectType, data.id));
			});
		}
	}

	render(): Object {
		const {
			screenProps,
			isDBEmpty,
			rows,
			gateways,
			gatewaysDidFetch,
			dBTileDisplayMode,
			hasPreviousDB,
		} = this.props;
		const {
			appLayout,
			addingNewLocation,
			addNewLocation,
			intl,
		} = screenProps;
		const {
			isRefreshing,
			tileWidth,
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

		if (hasPreviousDB) {
			return this.usePreviousDBMessage(style);
		}

		if (isDBEmpty) {
			return this.noItemsMessage(style);
		}

		const extraData = {
			propOne: tileWidth,
			propTwo: appLayout,
			dBTileDisplayMode,
		};

		return (
			<View
				level={3}
				onLayout={this._onLayout}
				style={style.container}>
				<DragAndDropScrollView
					data={rows}
					enableDragDrop
					showBin
					renderItem={this._renderRow}
					refreshControl={
						<ThemedRefreshControl
							enabled={showRefresh}
							refreshing={isRefreshing}
							onRefresh={this.onRefresh}
						/>
					}
					extraData={extraData}
					style={{
						width: '100%',
					}}
					contentContainerStyle={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						flexGrow: 1,
						paddingVertical: style.padding,
						paddingHorizontal: isDBEmpty ? 30 : style.padding,
					}}
					scrollEnabled={scrollEnabled}
					onSortOrderUpdate={this._onSortOrderUpdate}
					onDelete={this._onDelete}
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

	renderUnknown(id: number, tileStyle: Object, message: string): Object {
		return (
			<View
				level={2}
				style={[tileStyle,
					{
						...Theme.Core.shadow,
					},
				]}>
				<Text
					style={{
						color: Theme.Core.eulaContentColor,
						textAlign: 'center',
					}}
					key={id}>
					{message}
				</Text>
			</View>
		);
	}

	_renderRow(row: Object): Object {
		if (!row || !row.item) {
			return <EmptyView/>;
		}

		const {
			move,
			moveEnd,
		} = row;

		const { screenProps, navigation } = this.props;
		const { intl } = screenProps;
		let { tileWidth } = this.state;
		const { data, objectType } = row.item;
		const {
			supportLocalControl,
			id,
			isOnline,
		} = data || {};
		const tileMargin = this.getPadding() / 4;
		tileWidth -= (2 * tileMargin);

		let tileStyle = {
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: tileWidth - (2 * tileMargin),
			height: tileWidth - (2 * tileMargin),
			marginHorizontal: tileMargin,
			marginVertical: tileMargin,
			borderRadius: 2,
		};

		const sharedProps = {
			key: id,
			item: data,
			style: tileStyle,
			tileWidth,
			intl,
			navigation,
			isGatewayActive: isOnline || supportLocalControl,
		};

		let rowItem = <EmptyView/>;
		if (objectType !== SENSOR_KEY && objectType !== DEVICE_KEY && objectType !== MET_ID) {
			rowItem = this.renderUnknown(id, tileStyle, intl.formatMessage(i18n.unknownItem));
		} else if (!data) {
			rowItem = this.renderUnknown(id, tileStyle, intl.formatMessage(i18n.unknownItem));
		} else if (objectType === SENSOR_KEY) {
			rowItem = <SensorDashboardTile
				{...sharedProps}
				isGatewayActive={isOnline || supportLocalControl}
				onPress={this.changeDisplayType}
			/>;
		} else if (objectType === DEVICE_KEY) {
			rowItem = <DashboardRow
				{...sharedProps}
				setScrollEnabled={this.setScrollEnabled}
				onPressDimButton={this.showDimInfo}
				openRGBControl={this.openRGBControl}
				openThermostatControl={this.openThermostatControl}
			/>;
		} else if (objectType === MET_ID) {
			rowItem = <MetWeatherDbTile
				{...sharedProps}
				onPress={this.changeDisplayType}/>;
		}

		return (
			<TouchableOpacity
				onLongPress={move}
				onPressOut={moveEnd}
				style={{flex: 0}}>
				{rowItem}
			</TouchableOpacity>
		);
	}

	getPadding(): number {
		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	getStyles({
		appLayout,
	}: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = this.getPadding();

		const {
			androidLandMarginLeftFactor,
			fontSizeFactorFour,
		} = Theme.Core;

		return {
			container: {
				flex: 1,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : (width * androidLandMarginLeftFactor),
			},
			starIconSize: isPortrait ? Math.floor(width * 0.12) : Math.floor(height * 0.12),
			noItemsTitle: {
				textAlign: 'center',
				fontSize: isPortrait ? Math.floor(width * 0.068) : Math.floor(height * 0.068),
				paddingTop: 15,
			},
			noItemsContent: {
				textAlign: 'center',
				fontSize: isPortrait ? Math.floor(width * fontSizeFactorFour) : Math.floor(height * fontSizeFactorFour),
			},
			padding,
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
			oldDBButtonsCover: {
				width: '100%',
				justifyContent: 'center',
				alignItems: 'center',
				paddingVertical: padding,
			},
			buttonStyle: {
				flex: 0,
				minWidth: undefined,
				maxWidth: (deviceWidth - (padding * 3)),
				width: (deviceWidth - (padding * 6)),
				marginTop: padding,
			},
		};
	}
}

const getRows = createSelector(
	[
		({ dashboard }: Object): Object => dashboard,
		({ devices }: Object): Object => devices,
		({ sensors }: Object): Object => sensors,
		({ gateways }: Object): Object => gateways,
		({ app }: Object): Object => app,
		({ user }: Object): Object => user,
		({ thirdParties }: Object): Object => thirdParties,
		({ intl }: Object): Object => intl,
	],
	(dashboard: Object, devices: Object, sensors: Object, gateways: Object, app: Object, user: Object, thirdParties: Object, intl: Object): Array<any> => parseDashboardForListView(dashboard, devices, sensors, gateways, app, user, thirdParties, intl)
);

function mapStateToProps(state: Object, props: Object): Object {
	const { deviceIds = {}, sensorIds = {}, metWeatherIds = {}} = state.dashboard;
	const { defaultSettings } = state.app;
	const {
		dbCarousel = true,
		activeDashboardId,
		sortingDB,
		dBTileDisplayMode,
	} = defaultSettings || {};

	const { userId } = state.user;

	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];
	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];
	const userDbsAndMetWeathersIds = metWeatherIds[userId] || {};
	const metWeatherIdsInCurrentDb = userDbsAndMetWeathersIds[activeDashboardId] || [];

	const {
		screen: currentScreen,
		hiddenTabs = {},
	} = state.navigation;

	const hiddenTabsCurrentUser = hiddenTabs[userId] || [];

	const hasLoggedOutPrevDb = userDbsAndSensorIds.hasLoggedOut || userDbsAndDeviceIds.hasLoggedOut || userDbsAndMetWeathersIds.hasLoggedOut;
	const isDBEmpty = (deviceIdsInCurrentDb.length === 0) && (sensorIdsInCurrentDb.length === 0) && (metWeatherIdsInCurrentDb.length === 0);

	return {
		rows: getRows({
			...state,
			intl: props.screenProps.intl,
		}),
		isDBEmpty,
		dbCarousel,
		gateways: state.gateways.allIds,
		gatewaysDidFetch: state.gateways.didFetch,
		currentScreen,
		hiddenTabsCurrentUser,
		sortingDB,
		dBTileDisplayMode,
		hasLoggedOutPrevDb,
		hasPreviousDB: !isDBEmpty && hasLoggedOutPrevDb,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		changeSensorDisplayTypeDB: (id?: number, kind?: string) => {
			dispatch(changeSensorDisplayTypeDB(id, kind));
		},
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(DashboardTab): Object);

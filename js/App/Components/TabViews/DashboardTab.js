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
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import {
	Dimensions,
	FlatList,
	RefreshControl,
	LayoutAnimation,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
	Text,
	View,
} from '../../../BaseComponents';
import { DimmerControlInfo } from './SubViews/Device';
import { getDevices, getSensors, getGateways } from '../../Actions';
import { changeSensorDisplayTypeDB } from '../../Actions/Dashboard';

import i18n from '../../Translations/common';
import { parseDashboardForListView } from '../../Reducers/Dashboard';
import Theme from '../../Theme';

import {
	SensorDashboardTile,
	DashboardRow,
} from './SubViews';

import { getTabBarIcon, LayoutAnimations } from '../../Lib';

type Props = {
	rows: Array<Object>,
	isDBEmpty: boolean,
	screenProps: Object,
	dbCarousel: boolean,

	navigation: Object,
	changeSensorDisplayTypeDB: (id?: number) => void,
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
	_renderRow: (number) => Object;
	onDismissDialogueHide: () => void;

	showDimInfo: (Object) => void;

	openRGBControl: (number) => void;
	openThermostatControl: (number) => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => {
		const { intl, currentScreen } = screenProps;
		const { formatMessage } = intl;
		const postScript = currentScreen === 'Dashboard' ? formatMessage(i18n.labelActive) : formatMessage(i18n.defaultDescriptionButton);
		return {
			title: formatMessage(i18n.dashboard),
			tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'dashboard'),
			tabBarAccessibilityLabel: `${formatMessage(i18n.dashboardTab)}, ${postScript}`,
		};
	};

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

		this.showDimInfo = this.showDimInfo.bind(this);
		this.onDismissDialogueHide = this.onDismissDialogueHide.bind(this);

		this.openRGBControl = this.openRGBControl.bind(this);
		this.openThermostatControl = this.openThermostatControl.bind(this);
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

	changeDisplayType(id: number) {
		this.stopSensorTimer();
		LayoutAnimation.configureNext(LayoutAnimations.SensorChangeDisplay);
		this.props.changeSensorDisplayTypeDB(id);
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
		const { isDBEmpty, navigation, screenProps } = this.props;
		if (isDBEmpty && (screenProps.currentScreen === 'Dashboard' || screenProps.currentScreen === 'Tabs')) {
			navigation.navigate('Devices');
		}
		this.startSensorTimer();
	}

	componentWillUnmount() {
		this.stopSensorTimer();
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps.screenProps;
		if (currentScreen !== 'Dashboard' && this.timer) {
			this.stopSensorTimer();
		}
		return currentScreen === 'Dashboard';
	}

	componentDidUpdate(prevProps: Object) {
		const { currentScreen } = this.props.screenProps;
		if (currentScreen === 'Dashboard' && prevProps.screenProps.currentScreen !== 'Dashboard' && !this.timer) {
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

	noItemsMessage(style: Object): Object {
		return (
			<View style={[style.container, {
				paddingHorizontal: 20,
			}]}>
				<Icon name={'star'} size={style.starIconSize} color={Theme.Core.brandSecondary}/>
				<Text style={style.noItemsTitle}>
					{this.noItemsTitle}
				</Text>
				<Text style={style.noItemsContent}>
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

	showDimInfo(device: Object) {
		this.setState({
			dialogueBoxConf: {
				action: 'dim_info',
				device,
			},
		}, () => {
			this.openDialogueBox('dim_info', device);
		});
	}

	openRGBControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('RGBControl',
			{
				id,
			});
	}

	openDialogueBox(action: string, device: Object) {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = this.getDialogueBoxData(action, device);
		toggleDialogueBox(dialogueData);
	}

	openThermostatControl = (id: number) => {
		const { navigation } = this.props;
		navigation.navigate('ThermostatControl',
			{
				id,
			});
	}

	getDialogueBoxData(action: string, device: Object): Object {
		const { screenProps } = this.props;
		const { appLayout, intl } = screenProps;
		const style = this.getStyles(appLayout);

		let data = {
			show: true,
		};
		if (action === 'dim_info') {
			const { isOnline, name, id } = device;
			const styles = {
				dialogueHeaderTextStyle: style.dialogueHeaderTextStyle,
				dialogueBodyStyle: style.dialogueBodyStyle,
				dialogueBodyTextStyle: style.dialogueBodyTextStyle,
				headerWidth: style.headerWidth,
				headerHeight: style.headerHeight,
			};

			return {
				...data,
				showHeader: false,
				text: <DimmerControlInfo
					style={styles}
					name={name}
					id={id}
					onPressButton={this.onDismissDialogueHide}
					isOnline={isOnline}
					appLayout={appLayout}
					intl={intl}
				/>,
				style: style.dialogueBoxStyle,
				backdropOpacity: 0,
				closeOnPressPositive: true,
			};
		}
		return data;
	}

	render(): Object {
		const { screenProps, isDBEmpty, rows } = this.props;
		const { appLayout } = screenProps;
		const { isRefreshing, numColumns, tileWidth, scrollEnabled, showRefresh } = this.state;

		const style = this.getStyles(appLayout);

		if (isDBEmpty) {
			return this.noItemsMessage(style);
		}

		const extraData = {
			propOne: tileWidth,
			propTwo: appLayout,
		};

		return (
			<View onLayout={this._onLayout} style={style.container}>
				<FlatList
					ref="list"
					data={rows}
					renderItem={this._renderRow}
					refreshControl={
						<RefreshControl
							enabled={showRefresh}
							refreshing={isRefreshing}
							onRefresh={this.onRefresh}
						/>
					}
					key={numColumns}
					numColumns={numColumns}
					extraData={extraData}
					style={{width: '100%'}}
					contentContainerStyle={{
						flexGrow: 1,
						paddingVertical: style.padding,
						paddingHorizontal: isDBEmpty ? 30 : style.padding,
					}}
					scrollEnabled={scrollEnabled}
					onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
				/>
			</View>
		);
	}

	renderUnknown(id: number, tileStyle: Object, message: string): Object {
		return (
			<View
				style={[tileStyle,
					{
						...Theme.Core.shadow,
						backgroundColor: '#fff',
					},
				]}>
				<Text
					style={{
						color: Theme.Core.eulaContentColor,
					}}
					key={id}>
					{message}
				</Text>
			</View>
		);
	}

	_renderRow(row: Object): Object {
		const { screenProps } = this.props;
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

		if (objectType !== 'sensor' && objectType !== 'device') {
			return this.renderUnknown(id, tileStyle, intl.formatMessage(i18n.unknownItem));
		}
		if (!data) {
			return this.renderUnknown(id, tileStyle, intl.formatMessage(i18n.unknownItem));
		}

		if (objectType === 'sensor') {
			return <SensorDashboardTile
				key={id}
				item={data}
				isGatewayActive={isOnline || supportLocalControl}
				style={tileStyle}
				tileWidth={tileWidth}
				intl={screenProps.intl}
				onPress={this.changeDisplayType}
			/>;
		}

		return <DashboardRow
			key={id}
			item={data}
			isGatewayActive={isOnline || supportLocalControl}
			style={tileStyle}
			tileWidth={tileWidth}
			intl={screenProps.intl}
			setScrollEnabled={this.setScrollEnabled}
			onPressDimButton={this.showDimInfo}
			openRGBControl={this.openRGBControl}
			openThermostatControl={this.openThermostatControl}
		/>;
	}

	getPadding(): number {
		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = this.getPadding();

		return {
			container: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : (width * 0.07303),
				backgroundColor: Theme.Core.appBackground,
			},
			starIconSize: isPortrait ? Math.floor(width * 0.12) : Math.floor(height * 0.12),
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
				overflow: 'visible',
			},
		};
	}
}

DashboardTab.propTypes = {
	rows: PropTypes.array,
};

const getRows = createSelector(
	[
		({ dashboard }: Object): Object => dashboard,
		({ devices }: Object): Object => devices,
		({ sensors }: Object): Object => sensors,
		({ gateways }: Object): Object => gateways,
		({ app }: Object): Object => app,
		({ user }: Object): Object => user,
	],
	(dashboard: Object, devices: Object, sensors: Object, gateways: Object, app: Object, user: Object): Array<any> => parseDashboardForListView(dashboard, devices, sensors, gateways, app, user)
);

function mapStateToProps(state: Object, props: Object): Object {
	const { deviceIds = [], sensorIds = []} = state.dashboard;
	const { defaultSettings } = state.app;
	const { dbCarousel = true, activeDashboardId } = defaultSettings || {};

	const { userId } = state.user;

	const userDbsAndSensorIds = sensorIds[userId] || {};
	const sensorIdsInCurrentDb = userDbsAndSensorIds[activeDashboardId] || [];
	const userDbsAndDeviceIds = deviceIds[userId] || {};
	const deviceIdsInCurrentDb = userDbsAndDeviceIds[activeDashboardId] || [];

	return {
		rows: getRows(state),
		isDBEmpty: (deviceIdsInCurrentDb.length === 0) && (sensorIdsInCurrentDb.length === 0),
		dbCarousel,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		changeSensorDisplayTypeDB: (id?: number) => {
			dispatch(changeSensorDisplayTypeDB(id));
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DashboardTab);

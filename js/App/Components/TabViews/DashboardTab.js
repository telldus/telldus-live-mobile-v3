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
import { Dimensions, FlatList, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import Platform from 'Platform';
import Icon from 'react-native-vector-icons/FontAwesome';
import { defineMessages } from 'react-intl';
import isEqual from 'lodash/isEqual';

import { Text, View } from '../../../BaseComponents';
import { getDevices } from '../../Actions/Devices';
import { changeSensorDisplayType } from '../../Actions/Dashboard';

import i18n from '../../Translations/common';
import { parseDashboardForListView } from '../../Reducers/Dashboard';
import { getUserProfile } from '../../Reducers/User';
import Theme from '../../Theme';

import {
	SensorDashboardTile,
	DashboardRow,
} from './SubViews';

import { getTabBarIcon } from '../../Lib';

const messages = defineMessages({
	messageNoItemsTitle: {
		id: 'pages.dashboard.messageNoItemsTitle',
		defaultMessage: 'Your dashboard is empty.',
		description: 'Message title when no items',
	},
	messageNoItemsContent: {
		id: 'pages.dashboard.messageNoItemsContent',
		defaultMessage: 'You have not added any devices or sensors to your dashboard yet. ' +
		'Go to devices or sensors tab, swipe left on the row and click the star to select the ' +
		'ones you want to add.',
		description: 'Message title when no items',
	},
});

type Props = {
	rows: Array<Object>,
	userProfile: Object,
	navigation: Object,
	dashboard: Object,
	tab: string,
	onChangeDisplayType: () => void,
	dashboard: Object,
	dispatch: Function,
	navigation: Object,
	onTurnOn: (number) => void,
	onTurnOff: (number) => void,
	onDim: (number) => void,
	onDimmerSlide: (number) => void,
	onBell: (number) => void,
	onUp: (number) => void,
	onDown: (number) => void,
	onStop: (number) => void,
	events: Object,
	screenProps: Object,
	appLayout: Object,
};

type State = {
	tileWidth: number,
	listWidth: number,
	settings: boolean,
	numColumns: number,
	isRefreshing: boolean,
	scrollEnabled: boolean,
	showRefresh: boolean,
};

class DashboardTab extends View {

	props: Props;
	state: State;

	tab: string;
	_onLayout: (Object) => void;
	setScrollEnabled: (boolean) => void;
	onSlidingStart: (name: string, value: number) => void;
	onSlidingComplete: () => void;
	onValueChange: (number) => void;
	startSensorTimer: () => void;
	stopSensorTimer: () => void;
	changeDisplayType: () => void;
	onRefresh: () => void;
	_renderRow: (number) => Object;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(i18n.dashboard),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'dashboard'),
	});

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
		};

		this.tab = 'Dashboard';
		this.timer = null;

		this._onLayout = this._onLayout.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.startSensorTimer = this.startSensorTimer.bind(this);
		this.stopSensorTimer = this.stopSensorTimer.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);
		this.onRefresh = this.onRefresh.bind(this);

		this.noItemsTitle = props.screenProps.intl.formatMessage(messages.messageNoItemsTitle);
		this.noItemsContent = props.screenProps.intl.formatMessage(messages.messageNoItemsContent);
	}

	startSensorTimer() {
		this.timer = setInterval(() => {
			this.props.onChangeDisplayType();
		}, 5000);
	}

	stopSensorTimer() {
		clearInterval(this.timer);
		this.timer = null;
	}

	changeDisplayType() {
		this.stopSensorTimer();
		this.props.onChangeDisplayType();
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
		this.props.dispatch(getDevices())
			.then(() => {
				this.setState({
					isRefreshing: false,
				});
			})
			.catch(() => {
				this.setState({
					isRefreshing: false,
				});
			});
	}

	componentDidMount() {
		if (!this.props.dashboard.deviceIds.length > 0 && !this.props.dashboard.sensorIds.length > 0) {
			this.props.navigation.navigate('Devices');
		}
		this.startSensorTimer();
	}

	componentWillUnmount() {
		this.stopSensorTimer();
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps } = nextProps;
		const { currentScreen } = screenProps;

		const isStateEqual = isEqual(this.state, nextState);
		const isPropsEqual = isEqual(this.props, nextProps);
		if (currentScreen !== 'Dashboard' && this.timer) {
			this.stopSensorTimer();
		}
		if (currentScreen === 'Dashboard' && !this.timer) {
			this.startSensorTimer();
		}

		return (currentScreen === 'Dashboard') && (!isStateEqual || !isPropsEqual);
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
		const { appLayout } = this.props;
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
			<View style={style.container}>
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

	render(): Object {
		let { appLayout, dashboard, rows } = this.props;
		let { isRefreshing, numColumns, tileWidth, scrollEnabled, showRefresh } = this.state;

		let style = this.getStyles(appLayout);

		if (!dashboard.deviceIds.length > 0 && !dashboard.sensorIds.length > 0) {
			return this.noItemsMessage(style);
		}

		let extraData = {
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
					numColumns={numColumns}
					extraData={extraData}
					key={numColumns}
					style={{width: '100%'}}
					scrollEnabled={scrollEnabled}
					onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
				/>
			</View>
		);
	}

	_renderRow(row: Object): Object {
		let { screenProps } = this.props;
		let { tileWidth } = this.state;
		let { data, objectType } = row.item;
		let tileMargin = this.getPadding() / 4;
		tileWidth -= (2 * tileMargin);
		let key = data.id;
		if (objectType !== 'sensor' && objectType !== 'device') {
			return <Text key={key}>unknown device or sensor</Text>;
		}
		if (!data) {
			return <Text key={key}>Unknown device or sensor</Text>;
		}
		let { isOnline } = data;

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

		if (objectType === 'sensor') {
			return <SensorDashboardTile
				style={tileStyle}
				tileWidth={tileWidth}
				item={data}
				onPress={this.changeDisplayType}
				intl={screenProps.intl}
				key={key}
				isGatewayActive={isOnline}
			/>;
		}

		return (
			<DashboardRow
				style={tileStyle}
				item={data}
				tileWidth={tileWidth}
				intl={screenProps.intl}
				key={key}
				isGatewayActive={isOnline}
				setScrollEnabled={this.setScrollEnabled}
			/>
		);
	}

	getPadding(): number {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const isEmpty = !this.props.dashboard.deviceIds.length > 0 && !this.props.dashboard.sensorIds.length > 0;

		const padding = this.getPadding();

		return {
			container: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				padding: isEmpty ? 30 : padding,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
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
	],
	(dashboard: Object, devices: Object, sensors: Object, gateways: Object): Array<any> => parseDashboardForListView(dashboard, devices, sensors, gateways)
);

function mapStateToProps(state: Object, props: Object): Object {
	return {
		rows: getRows(state),
		userProfile: getUserProfile(state),
		tab: state.navigation.tab,
		dashboard: state.dashboard,
		appLayout: state.app.layout,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onChangeDisplayType: () => {
			dispatch(changeSensorDisplayType());
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DashboardTab);

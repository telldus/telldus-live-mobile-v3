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
import { Dimensions } from 'react-native';
import { connect } from 'react-redux';
import Subscribable from 'Subscribable';
import Platform from 'Platform';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Text, List, ListDataSource, View } from 'BaseComponents';
import { getDevices } from 'Actions_Devices';
import { changeSensorDisplayType } from 'Actions_Dashboard';
import { defineMessages } from 'react-intl';

import i18n from '../../Translations/common';
import { parseDashboardForListView } from '../../Reducers/Dashboard';
import { getUserProfile } from '../../Reducers/User';
import Theme from 'Theme';

import {
	DimmerDashboardTile,
	NavigationalDashboardTile,
	BellDashboardTile,
	ToggleDashboardTile,
	SensorDashboardTile,
} from 'TabViews_SubViews';

import getDeviceType from '../../Lib/getDeviceType';
import getTabBarIcon from '../../Lib/getTabBarIcon';
import reactMixin from 'react-mixin';

const messages = defineMessages({
	messageNoItemsTitle: {
		id: 'pages.dashboard.messageNoItemsTitle',
		defaultMessage: 'Your dashboard is empty.',
		description: 'Message title when no items',
	},
	messageNoItemsContent: {
		id: 'pages.dashboard.messageNoItemsContent',
		defaultMessage: 'You have not added any devices or sensors to your dashboard yet. Go to devices or sensors tab, click the ' +
		'start in the top right corner and choose the ones you want to add.',
		description: 'Message title when no items',
	},
});

type Props = {
	rows: Array<Object>,
	gateways: Object,
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
	dataSource: Object,
	settings: boolean,
};

const tileMargin = 8;
const listMargin = 8;

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
	orientationDidChange: (string) => void;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(i18n.dashboard),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'dashboard'),
	});

	constructor(props: Props) {
		super(props);
		const { width } = Dimensions.get('window');
		const tileWidth: number = this.calculateTileWidth(width, props.screenProps.orientation);

		this.state = {
			tileWidth,
			listWidth: 0,
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
			}).cloneWithRows(this.props.rows),
			settings: false,
		};

		this.tab = 'dashboardTab';

		this._onLayout = this._onLayout.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.startSensorTimer = this.startSensorTimer.bind(this);
		this.stopSensorTimer = this.stopSensorTimer.bind(this);
		this.changeDisplayType = this.changeDisplayType.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.mixins = [Subscribable.Mixin];

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
	}

	changeDisplayType() {
		this.stopSensorTimer();
		this.props.onChangeDisplayType();
		this.startSensorTimer();
	}

	rowHasChanged(r1, r2) {
		return r1.childObject !== r2.childObject;
	}

	setScrollEnabled(enable) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	onRefresh() {
		this.props.dispatch(getDevices());
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

	componentWillReceiveProps(nextProps) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.rows),
		});

		if (nextProps.tab !== 'dashboardTab') {
			this.stopSensorTimer();
			this.tab = nextProps.tab;
		} else if (nextProps.tab === 'dashboardTab' && this.tab !== 'dashboardTab') {
			this.startSensorTimer();
			this.tab = 'dashboardTab';
		}
	}

	_onLayout = (event) => {
		const tileWidth = this.calculateTileWidth(event.nativeEvent.layout.width, this.props.screenProps.orientation);
		if (tileWidth !== this.state.tileWidth) {
			this.setState({
				tileWidth,
			});
		}
	};

	calculateTileWidth(listWidth: number, orientation: string): number {
		listWidth -= listMargin;
		const isPortrait = orientation === 'PORTRAIT';
		if (listWidth <= 0) {
			return 0;
		}
		const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
		const tilesPerRow = Math.floor(listWidth / baseTileSize);
		const tileWidth = tilesPerRow === 0 ? baseTileSize : Math.floor(listWidth / tilesPerRow);
		return tileWidth;
	}

	noItemsMessage(style: Object) {
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

	render() {

		let { appLayout } = this.props;

		let style = this.getStyles(appLayout);

		// add to List props: enableEmptySections={true}, to surpress warning

		if (!this.props.dashboard.deviceIds.length > 0 && !this.props.dashboard.sensorIds.length > 0) {
			return this.noItemsMessage(style);
		}

		return (
			<View onLayout={this._onLayout} style={style.container}>
				<List
					ref="list"
					contentContainerStyle={{
						flexDirection: 'row',
						flexWrap: 'wrap',
					}}
					key={this.state.tileWidth}
					dataSource={this.state.dataSource}
					renderRow={this._renderRow(this.state.tileWidth)}
					pageSize={100}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	_renderRow(tileWidth) {
		tileWidth -= tileMargin;
		return (row, secId, rowId, rowMap) => {
			if (row.objectType !== 'sensor' && row.objectType !== 'device') {
				return <Text>unknown device or sensor</Text>;
			}
			if (!row.childObject) {
				return <Text>Unknown device or sensor</Text>;
			}

			let tileStyle = {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				width: tileWidth - tileMargin,
				height: tileWidth - tileMargin,
				marginTop: tileMargin,
				marginLeft: tileMargin,
				borderRadius: 2,
			};

			if (row.objectType === 'sensor') {
				return <SensorDashboardTile
					style={tileStyle}
					tileWidth={tileWidth}
					item={row.childObject}
					onPress={this.changeDisplayType}
				/>;
			}

			const deviceType = getDeviceType(row.childObject.supportedMethods);

			if (deviceType === 'TOGGLE') {
				return <ToggleDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
			}

			if (deviceType === 'DIMMER') {
				return <DimmerDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					setScrollEnabled={this.setScrollEnabled}
				/>;
			}

			if (deviceType === 'BELL') {
				return <BellDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
			}

			if (deviceType === 'NAVIGATIONAL') {
				return <NavigationalDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
			}

			return <ToggleDashboardTile
				style={tileStyle}
				item={row.childObject}
				tileWidth={tileWidth}
			/>;
		};
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;
		let isEmpty = !this.props.dashboard.deviceIds.length > 0 && !this.props.dashboard.sensorIds.length > 0;

		return {
			container: {
				flex: 1,
				alignItems: isEmpty ? 'center' : 'flex-start',
				justifyContent: 'center',
				paddingHorizontal: isEmpty ? 30 : 0,
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
		({ dashboard }) => dashboard,
		({ devices }) => devices,
		({ sensors }) => sensors,
	],
	(dashboard, devices, sensors) => parseDashboardForListView(dashboard, devices, sensors)
);

function mapStateToProps(state, props) {
	return {
		rows: getRows(state),
		gateways: state.gateways,
		userProfile: getUserProfile(state),
		tab: state.navigation.tab,
		dashboard: state.dashboard,
		appLayout: state.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onChangeDisplayType: () => dispatch(changeSensorDisplayType()),
		dispatch,
	};
}

reactMixin(DashboardTab.prototype, Subscribable.Mixin);

module.exports = connect(mapStateToProps, mapDispatchToProps)(DashboardTab);

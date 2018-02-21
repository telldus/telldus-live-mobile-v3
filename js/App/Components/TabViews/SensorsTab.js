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
import { SectionList, ScrollView, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Platform from 'Platform';

import { View, IconTelldus } from '../../../BaseComponents';
import { DeviceHeader, SensorRow, SensorRowHidden } from 'TabViews_SubViews';

import { getSensors, setIgnoreSensor, showGlobalError } from 'Actions';

import i18n from '../../Translations/common';
import { parseSensorsForListView } from '../../Reducers/Sensors';
import getTabBarIcon from '../../Lib/getTabBarIcon';
import Theme from '../../Theme';

type Props = {
	rowsAndSections: Object,
	gatewaysById: Object,
	tab: string,
	dispatch: Function,
	appLayout: Object,
	screenProps: Object,
};

type State = {
	visibleList: Array<Object>,
	hiddenList: Array<Object>,
	makeRowAccessible: 0 | 1,
	isRefreshing: boolean,
	listEnd: boolean,
	showHiddenList: boolean,
};

class SensorsTab extends View {

	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	renderHiddenRow: (Object) => Object;
	onRefresh: (Object) => void;
	keyExtractor: (Object) => number;
	onEndReachedVisibleList: () => void;
	toggleHiddenList: () => void;
	setIgnoreSensor: (Object) => void;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(i18n.sensors),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'sensors'),
	});

	constructor(props: Props) {
		super(props);

		let { visibleList, hiddenList } = props.rowsAndSections;

		this.state = {
			visibleList,
			hiddenList,
			makeRowAccessible: 0,
			isRefreshing: false,
			listEnd: visibleList.length === 0 ? true : false,
			showHiddenList: false,
		};

		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHiddenRow = this.renderHiddenRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);

		this.onEndReachedVisibleList = this.onEndReachedVisibleList.bind(this);
		this.toggleHiddenList = this.toggleHiddenList.bind(this);
		this.setIgnoreSensor = this.setIgnoreSensor.bind(this);

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.addedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.removedFromHiddenList);

		let hiddenSensors = formatMessage(i18n.hiddenSensors).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenSensors}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenSensors}`;
	}

	componentWillReceiveProps(nextProps) {

		let { makeRowAccessible, listEnd } = this.state;
		let { screenReaderEnabled, rowsAndSections } = nextProps;
		let { currentScreen, currentTab } = nextProps.screenProps;
		if (screenReaderEnabled && currentScreen === 'Tabs' && currentTab === 'Sensors') {
			makeRowAccessible = 1;
		} else {
			makeRowAccessible = 0;
		}

		let { visibleList, hiddenList } = rowsAndSections;

		this.setState({
			visibleList,
			hiddenList,
			makeRowAccessible,
			listEnd: visibleList.length === 0 ? true : listEnd,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object) {
		return nextProps.tab === 'sensorsTab';
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});
		this.props.dispatch(getSensors())
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

	onEndReachedVisibleList() {
		this.setState({
			listEnd: true,
		});
	}

	toggleHiddenList() {
		this.setState({
			showHiddenList: !this.state.showHiddenList,
		});
	}

	setIgnoreSensor(sensor: Object) {
		let ignore = sensor.ignored ? 0 : 1;
		this.props.dispatch(setIgnoreSensor(sensor.id, ignore)).then((res) => {
			let message = sensor.ignored ?
				this.removedFromHiddenList : this.addedToHiddenList;
			let payload = {
				customMessage: message,
			};
			this.props.dispatch(showGlobalError(payload));
			this.props.dispatch(getSensors());
		}).catch(err => {
			let payload = {
				customMessage: err.message ? err.message : null,
			};
			this.props.dispatch(showGlobalError(payload));
		});
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

		let { appLayout } = this.props;
		let { listEnd, showHiddenList, hiddenList, visibleList, isRefreshing } = this.state;

		let style = this.getStyles(appLayout);
		let extraData = {
			makeRowAccessible: this.state.makeRowAccessible,
			appLayout: appLayout,
		};

		return (
			<ScrollView style={style.container}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={this.onRefresh}
					/>}>
				<SectionList
					sections={visibleList}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					initialNumToRender={15}
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

	renderSectionHeader(sectionData) {
		return (
			<DeviceHeader
				gateway={sectionData.section.key}
			/>
		);
	}

	renderRow(row) {
		let { screenProps, gatewaysById } = this.props;
		let { intl, currentTab, currentScreen } = screenProps;
		let isGatewayActive = gatewaysById[row.item.clientId].online;

		return (
			<SensorRow
				sensor={row.item}
				intl={intl}
				appLayout={this.props.appLayout}
				currentTab={currentTab}
				currentScreen={currentScreen}
				isGatewayActive={isGatewayActive}
				setIgnoreSensor={this.setIgnoreSensor}/>
		);
	}

	renderHiddenRow(row) {
		let { screenProps } = this.props;

		return (
			<SensorRowHidden {...row} intl={screenProps.intl}/>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			container: {
				flex: 1,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
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
		({ sensors }) => sensors.byId,
		({ gateways }) => gateways.byId,
	],
	(sensors, gateways) => {
		return parseSensorsForListView(sensors, gateways);
	}
);

function mapStateToProps(store) {
	return {
		rowsAndSections: getRowsAndSections(store),
		gatewaysById: store.gateways.byId,
		tab: store.navigation.tab,
		appLayout: store.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SensorsTab);

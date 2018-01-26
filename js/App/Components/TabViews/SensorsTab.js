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
import { SectionList } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Platform from 'Platform';

import { View } from 'BaseComponents';
import { DeviceHeader, SensorRow, SensorRowHidden } from 'TabViews_SubViews';

import { getSensors } from 'Actions';
import { toggleEditMode } from 'Actions';

import i18n from '../../Translations/common';
import { parseSensorsForListView } from '../../Reducers/Sensors';
import getTabBarIcon from '../../Lib/getTabBarIcon';

type Props = {
	rowsAndSections: Object,
	gatewaysById: Object,
	editMode: boolean,
	tab: string,
	dispatch: Function,
	appLayout: Object,
	screenProps: Object,
};

type State = {
	dataSource: Object,
	makeRowAccessible: 0 | 1,
};

class SensorsTab extends View {

	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	renderHiddenRow: (Object) => Object;
	onRefresh: (Object) => void;
	keyExtractor: (Object) => number;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(i18n.sensors),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'sensors'),
	});

	constructor(props: Props) {
		super(props);

		this.state = {
			dataSource: this.props.rowsAndSections,
			makeRowAccessible: 0,
		};

		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHiddenRow = this.renderHiddenRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);
	}

	componentWillReceiveProps(nextProps) {

		let { makeRowAccessible } = this.state;
		let { screenReaderEnabled } = nextProps;
		let { currentScreen, currentTab } = nextProps.screenProps;
		if (screenReaderEnabled && currentScreen === 'Tabs' && currentTab === 'Sensors') {
			makeRowAccessible = 1;
		} else {
			makeRowAccessible = 0;
		}

		this.setState({
			dataSource: nextProps.rowsAndSections,
			makeRowAccessible,
		});

		if (nextProps.tab !== 'sensorsTab' && nextProps.editMode === true) {
			this.props.dispatch(toggleEditMode('sensorsTab'));
		}
	}

	onRefresh() {
		this.props.dispatch(getSensors());
	}

	keyExtractor(item) {
		return item.id;
	}

	render() {

		let { appLayout } = this.props;

		let style = this.getStyles(appLayout);
		let extraData = {
			makeRowAccessible: this.state.makeRowAccessible,
			appLayout: appLayout,
		};

		return (
			<View style={style.container}>
				<SectionList
					sections={this.state.dataSource}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					initialNumToRender={15}
					onRefresh={this.onRefresh}
					refreshing={false}
					keyExtractor={this.keyExtractor}
					extraData={extraData}
				/>
			</View>
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
		let { intl, currentTab, currentScreen } = this.props.screenProps;
		return (
			<SensorRow
				sensor={row.item}
				intl={intl}
				appLayout={this.props.appLayout}
				currentTab={currentTab}
				currentScreen={currentScreen}/>
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
		};
	}
}

const getRowsAndSections = createSelector(
	[
		({ sensors }) => sensors.byId,
		({ gateways }) => gateways.byId,
	],
	(sensors, gateways) => {
		const sections = parseSensorsForListView(sensors, gateways);
		return sections;
	}
);

function mapStateToProps(store) {
	return {
		rowsAndSections: getRowsAndSections(store),
		gatewaysById: store.gateways.byId,
		editMode: store.tabs.editModeSensorsTab,
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

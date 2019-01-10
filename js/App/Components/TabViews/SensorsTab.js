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
import { SectionList, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Platform from 'Platform';

import { View, IconTelldus, DialogueBox, DialogueHeader, Text } from '../../../BaseComponents';
import { DeviceHeader, SensorRow } from './SubViews';

import { getSensors, setIgnoreSensor, showToast } from '../../Actions';

import i18n from '../../Translations/common';
import { parseSensorsForListView } from '../../Reducers/Sensors';
import { getTabBarIcon } from '../../Lib';
import Theme from '../../Theme';

type Props = {
	rowsAndSections: Object,
	screenProps: Object,
	screenReaderEnabled: boolean,
	navigation: Object,
	dispatch: Function,
};

type State = {
	isRefreshing: boolean,
	showHiddenList: boolean,
	propsSwipeRow: Object,
	showConfirmDialogue: boolean,
	sensorToHide: Object,
};

class SensorsTab extends View {

	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	onRefresh: (Object) => void;
	keyExtractor: (Object) => number;
	toggleHiddenList: () => void;
	setIgnoreSensor: (Object) => void;
	closeVisibleRows: (string) => void;
	onDismissDialogueHide: () => void;
	onConfirmDialogueHide: () => void;
	openSensorDetail: (number) => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(i18n.sensors),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'sensors'),
	});

	constructor(props: Props) {
		super(props);

		this.state = {
			isRefreshing: false,
			showHiddenList: false,
			propsSwipeRow: {
				idToKeepOpen: null,
				forceClose: false,
			},
			showConfirmDialogue: false,
			sensorToHide: {},
		};

		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);

		this.toggleHiddenList = this.toggleHiddenList.bind(this);
		this.setIgnoreSensor = this.setIgnoreSensor.bind(this);
		this.closeVisibleRows = this.closeVisibleRows.bind(this);
		this.onDismissDialogueHide = this.onDismissDialogueHide.bind(this);
		this.onConfirmDialogueHide = this.onConfirmDialogueHide.bind(this);

		let { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.sensorAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.sensorRemovedFromHiddenList);

		let hiddenSensors = formatMessage(i18n.hiddenSensors).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenSensors}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenSensors}`;

		const labelSensor = formatMessage(i18n.labelSensor).toLowerCase();
		this.headerOnHide = formatMessage(i18n.headerOnHide, { type: labelSensor });
		this.messageOnHide = formatMessage(i18n.messageOnHide, { type: labelSensor });
		this.labelHide = formatMessage(i18n.hide).toUpperCase();

		this.openSensorDetail = this.openSensorDetail.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps.screenProps;
		const { currentScreen: prevScreen } = this.props.screenProps;
		return (currentScreen === 'Sensors') || (currentScreen !== 'Sensors' && prevScreen === 'Sensors');
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

	keyExtractor(item: Object): string {
		return item.id;
	}

	toggleHiddenList() {
		this.setState({
			showHiddenList: !this.state.showHiddenList,
		});
	}

	setIgnoreSensor(sensor: Object) {
		let ignore = sensor.ignored ? 0 : 1;
		if (!sensor.ignored && !this.state.showConfirmDialogue) {
			this.setState({
				showConfirmDialogue: true,
				sensorToHide: sensor,
			});
		} else {
			this.props.dispatch(setIgnoreSensor(sensor.id, ignore)).then((res: Object) => {
				let message = sensor.ignored ?
					this.removedFromHiddenList : this.addedToHiddenList;
				this.props.dispatch(showToast(message));
				this.props.dispatch(getSensors());
			}).catch((err: Object) => {
				let message = err.message ? err.message : null;
				this.props.dispatch(showToast(message));
			});
		}
	}

	openSensorDetail(sensor: Object) {
		this.props.navigation.navigate({
			routeName: 'SensorDetails',
			key: 'SensorDetails',
			params: { id: sensor.id },
		});
	}

	onConfirmDialogueHide() {
		this.setIgnoreSensor(this.state.sensorToHide);
		this.setState({
			showConfirmDialogue: false,
		});
	}

	onDismissDialogueHide() {
		this.setState({
			showConfirmDialogue: false,
		});
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

	render(): Object {

		const { rowsAndSections, screenReaderEnabled, screenProps } = this.props;
		const { appLayout } = screenProps;
		const {
			showHiddenList,
			isRefreshing,
			propsSwipeRow,
			showConfirmDialogue,
		} = this.state;
		const { visibleList, hiddenList } = rowsAndSections;

		const style = this.getStyles(appLayout);

		let makeRowAccessible = 0;
		if (screenReaderEnabled && screenProps.currentScreen === 'Sensors') {
			makeRowAccessible = 1;
		}
		const extraData = {
			makeRowAccessible,
			appLayout,
			propsSwipeRow,
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
				/>
				<View importantForAccessibility={screenProps.currentScreen === 'Sensors' ? 'no' : 'no-hide-descendants'}>
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
		const { propsSwipeRow } = this.state;
		const { intl, currentScreen, appLayout, screenReaderEnabled } = screenProps;
		const { item } = row;
		const { isOnline } = item;

		return (
			<SensorRow
				sensor={item}
				intl={intl}
				appLayout={appLayout}
				currentScreen={currentScreen}
				isGatewayActive={isOnline}
				setIgnoreSensor={this.setIgnoreSensor}
				onHiddenRowOpen={this.closeVisibleRows}
				propsSwipeRow={propsSwipeRow}
				onSettingsSelected={this.openSensorDetail}
				screenReaderEnabled={screenReaderEnabled}/>
		);
	}

	closeVisibleRows(sensorId: string) {
		this.setState({
			propsSwipeRow: {
				idToKeepOpen: sensorId,
				forceClose: true,
			},
		});
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
			container: {
				flex: 1,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
				backgroundColor: Theme.Core.appBackground,
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
		};
	}
}

const getRowsAndSections = createSelector(
	[
		({ sensors }: Object): Object => sensors.byId,
		({ gateways }: Object): Object => gateways.byId,
	],
	(sensors: Object, gateways: Object): Object => {
		return parseSensorsForListView(sensors, gateways);
	}
);

function mapStateToProps(store: Object): Object {
	const { screenReaderEnabled } = store.app;
	return {
		rowsAndSections: getRowsAndSections(store),
		screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SensorsTab);

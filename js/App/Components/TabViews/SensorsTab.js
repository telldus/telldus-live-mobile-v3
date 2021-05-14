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
	SectionList,
	TouchableOpacity,
	LayoutAnimation,
	Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';

import {
	View,
	IconTelldus,
	Text,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import { DeviceHeader, SensorRow } from './SubViews';
import {
	NoSensors,
	NoGateways,
} from './SubViews/EmptyInfo';

import { getSensors, setIgnoreSensor, showToast, getGateways } from '../../Actions';

import i18n from '../../Translations/common';
import { parseSensorsForListView } from '../../Reducers/Sensors';
import { LayoutAnimations, getItemLayout } from '../../Lib';
import Theme from '../../Theme';

type Props = {
	rowsAndSections: Object,
	screenProps: Object,
	screenReaderEnabled: boolean,
	navigation: Object,
	dispatch: Function,
	sensors: Array<any>,
	sensorsDidFetch: boolean,
	gatewaysById: Object,
	route: Object,
	gatewaysDidFetch: boolean,
	gateways: Array<any>,
	currentScreen: string,
	batteryStatus: string,
};

type State = {
	isRefreshing: boolean,
	showHiddenList: boolean,
	propsSwipeRow: Object,
	sensorToHide: Object,
};

class SensorsTab extends View {

	props: Props;
	state: State;

	renderSectionHeader: (sectionData: Object) => Object | null;
	renderRow: (Object) => Object;
	onRefresh: (Object) => void;
	keyExtractor: (Object) => string;
	toggleHiddenList: () => void;
	setIgnoreSensor: (Object) => void;
	closeVisibleRows: (string) => void;
	onDismissDialogueHide: () => void;
	onConfirmDialogueHide: () => void;
	openSensorDetail: (number) => void;

	setRef: (any) => void;
	listView: any;
	defaultDescriptionButton: string;

	noSensorsTitle: string;
	noSensorsContent: string;

	constructor(props: Props) {
		super(props);

		this.state = {
			isRefreshing: false,
			showHiddenList: false,
			propsSwipeRow: {
				idToKeepOpen: null,
				forceClose: false,
			},
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

		const { intl, appLayout } = props.screenProps;
		let { formatMessage } = intl;

		this.addedToHiddenList = formatMessage(i18n.sensorAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.sensorRemovedFromHiddenList);
		this.defaultDescriptionButton = formatMessage(i18n.defaultDescriptionButton);

		let hiddenSensors = formatMessage(i18n.hiddenSensors).toLowerCase();
		this.hideHidden = `${formatMessage(i18n.hide)} ${hiddenSensors}`;
		this.showHidden = `${formatMessage(i18n.show)} ${hiddenSensors}`;

		const labelSensor = formatMessage(i18n.labelSensor).toLowerCase();
		this.headerOnHide = formatMessage(i18n.headerOnHide, { type: labelSensor });
		this.messageOnHide = formatMessage(i18n.messageOnHide, { type: labelSensor });
		this.labelHide = formatMessage(i18n.hide);

		this.openSensorDetail = this.openSensorDetail.bind(this);
		this.setRef = this.setRef.bind(this);
		this.listView = null;

		this.timeoutScrollToHidden = null;

		this.noSensorsTitle = formatMessage(i18n.noSensorsTitle);
		this.noSensorsContent = formatMessage(i18n.noSensorsContent);

		this.getItemLayout = getItemLayout(appLayout);
		this.calledOnNewlyAddedDidMount = false;
	}

	componentDidMount() {
		this.normalizeNewlyAddedUITimeout();
		this.calledOnNewlyAddedDidMount = false;
	}

	componentDidUpdate() {
		this.normalizeNewlyAddedUITimeout();

		const { route } = this.props;
		const {
			newSensors = {},
			gateway,
		} = route.params || {};
		if (gateway && newSensors && !isEmpty(newSensors) && !this.calledOnNewlyAddedDidMount) {
			Object.keys(newSensors).map((id: string) => {
				let gId = gateway.id.toString();
				this.onNewlyAddedDidMount(parseInt(id, 10), gId);
			});
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps;
		const { currentScreen: prevScreen } = this.props;
		return (currentScreen === 'Sensors') || (currentScreen !== 'Sensors' && prevScreen === 'Sensors');
	}

	componentWillUnmount() {
		clearTimeout(this.timeoutScrollToHidden);
		this.calledOnNewlyAddedDidMount = false;
	}

	setRef(ref: any) {
		this.listView = ref;
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});
		let promises = [
			this.props.dispatch(getGateways()),
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

	keyExtractor(item: Object): string {
		return item.id;
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

	setIgnoreSensor(sensor: Object) {
		if (!sensor.ignored) {
			this.setState({
				sensorToHide: sensor,
			}, () => {
				this.openDialogueBox('set_ignore', sensor);
			});
		} else {
			this.confirmSetIgnoreSensor(sensor);
		}
	}

	confirmSetIgnoreSensor(sensor: Object) {
		let { sensorToHide } = this.state;
		sensor = sensor ? sensor : sensorToHide;
		let ignore = sensor.ignored ? 0 : 1;
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

	openDialogueBox(action: string, sensor: Object) {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		const dialogueData = {
			show: true,
			showHeader: true,
			header: this.headerOnHide,
			text: this.messageOnHide,
			showNegative: true,
			onPressNegative: this.onDismissDialogueHide,
			showPositive: true,
			positiveText: this.labelHide,
			onPressPositive: this.onConfirmDialogueHide,
			closeOnPressPositive: true,
		};
		toggleDialogueBox(dialogueData);
	}

	openSensorDetail(sensor: Object) {
		this.props.navigation.navigate('SensorDetails', {
			id: sensor.id,
		});
	}

	onConfirmDialogueHide() {
		this.confirmSetIgnoreSensor();
	}

	onDismissDialogueHide() {
		const { screenProps } = this.props;
		const { toggleDialogueBox } = screenProps;
		toggleDialogueBox({show: false});
	}

	toggleHiddenListButton(): Object {
		const { screenProps, currentScreen } = this.props;
		const accessible = currentScreen === 'Sensors';
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
				accessibilityLabel={accessibilityLabel}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}>
				<IconTelldus
					level={2}
					icon="hidden"
					style={style.toggleHiddenListIcon}
					importantForAccessibility="no" accessible={false}/>
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

	noSensorsMessage(style: Object): Object {
		return (
			<View
				level={3}
				style={style.noItemsContainer}>
				<IconTelldus
					level={23}
					icon={'sensor'}
					style={style.sensorIconStyle}/>
				<Text
					level={4}
					style={style.noItemsTitle}>
					{this.noSensorsTitle}
				</Text>
				<Text
					level={4}
					style={style.noItemsContent}>
					{'\n'}
					{this.noSensorsContent}
				</Text>
			</View>
		);
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
			rowsAndSections,
			screenReaderEnabled,
			screenProps,
			sensorsDidFetch,
			sensors,
			gateways,
			gatewaysDidFetch,
			currentScreen,
		} = this.props;
		const {
			appLayout,
			addingNewLocation,
			addNewLocation,
		} = screenProps;
		const {
			isRefreshing,
			propsSwipeRow,
		} = this.state;

		const style = this.getStyles({
			appLayout,
		});

		if (gateways.length === 0 && gatewaysDidFetch) {
			return <NoGateways
				disabled={addingNewLocation}
				onPress={addNewLocation}/>;
		}

		const hasGateways = gateways.length > 0 && gatewaysDidFetch;
		if (hasGateways && sensors.length === 0 && sensorsDidFetch) {
			return <NoSensors/>;
		}

		let makeRowAccessible = 0;
		if (screenReaderEnabled && currentScreen === 'Sensors') {
			makeRowAccessible = 1;
		}

		const listData = this.prepareFinalListData(rowsAndSections);
		const extraData = {
			makeRowAccessible,
			appLayout,
			propsSwipeRow,
		};

		return (
			<View
				level={3}
				style={style.container}>
				<SectionList
					sections={listData}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					initialNumToRender={15}
					keyExtractor={this.keyExtractor}
					extraData={extraData}
					stickySectionHeadersEnabled={true}
					refreshControl={
						<ThemedRefreshControl
							refreshing={isRefreshing}
							onRefresh={this.onRefresh}
						/>}
					ref={this.setRef}
					getItemLayout={this.getItemLayout}
				/>
			</View>
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
				accessible={currentScreen === 'Sensors'}
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
		const { intl, appLayout, screenReaderEnabled } = screenProps;
		const { item, section, index } = row;
		const { isOnline, buttonRow, id } = item;

		if (buttonRow) {
			return (
				<View importantForAccessibility={currentScreen === 'Sensors' ? 'no' : 'no-hide-descendants'}>
					{this.toggleHiddenListButton()}
				</View>
			);
		}

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		const {
			newSensors = {},
		} = route.params || {};

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
				screenReaderEnabled={screenReaderEnabled}
				isLast={isLast}
				gatewayId={section.header}
				isNew={!!newSensors[id]}
				batteryStatus={batteryStatus}/>
		);
	}

	onNewlyAddedDidMount = (id: number, clientId: string) => {
		const { rowsAndSections, route } = this.props;
		const { visibleList } = rowsAndSections;
		const {
			newSensors = {},
		} = route.params || {};
		let section = 0, row = 0;
		let item = newSensors[id];
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

	normalizeNewlyAddedUITimeout = () => {
		const { route } = this.props;
		const {
			newSensors,
		} = route.params || {};
		if (newSensors && !this.timeoutNormalizeNewlyAdded ) {
			this.timeoutNormalizeNewlyAdded = setTimeout(() => {
				this.normalizeNewlyAddedUI();
				clearTimeout(this.timeoutNormalizeNewlyAdded);
				this.timeoutNormalizeNewlyAdded = null;
				this.calledOnNewlyAddedDidMount = false;
			}, 3000);
		}
	}

	normalizeNewlyAddedUI = () => {
		const { navigation, route } = this.props;
		const {
			newSensors,
		} = route.params || {};
		if (newSensors) {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			navigation.setParams({
				newSensors: undefined,
			});
		}
	}

	closeVisibleRows(sensorId: string) {
		this.setState({
			propsSwipeRow: {
				idToKeepOpen: sensorId,
				forceClose: true,
			},
		});
	}

	getStyles({
		appLayout,
	}: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			androidLandMarginLeftFactor,
			fontSizeFactorFour,
		} = Theme.Core;

		let hiddenListTextFontSize = Math.floor(deviceWidth * 0.049);
		hiddenListTextFontSize = hiddenListTextFontSize > 25 ? 25 : hiddenListTextFontSize;

		let hiddenListIconFontSize = Math.floor(deviceWidth * 0.088);
		hiddenListIconFontSize = hiddenListIconFontSize > 50 ? 50 : hiddenListIconFontSize;

		return {
			container: {
				flex: 1,
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
			noItemsContainer: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 30,
				paddingTop: 10,
				marginLeft: Platform.OS !== 'android' || isPortrait ? 0 : width * 0.08,
			},
			noItemsTitle: {
				textAlign: 'center',
				fontSize: Math.floor(deviceWidth * 0.068),
				paddingTop: 15,
			},
			noItemsContent: {
				textAlign: 'center',
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			sensorIconStyle: {
				fontSize: Math.floor(deviceWidth * 0.12),
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

	const {
		screenReaderEnabled,
		defaultSettings = {},
	 } = store.app;
	const { screen: currentScreen } = store.navigation;
	const {
		batteryStatus,
	} = defaultSettings;

	return {
		rowsAndSections: getRowsAndSections(store),
		screenReaderEnabled,
		sensors: store.sensors.allIds,
		sensorsDidFetch: store.sensors.didFetch,
		gatewaysById: store.gateways.byId,
		gateways: store.gateways.allIds,
		gatewaysDidFetch: store.gateways.didFetch,
		currentScreen,
		batteryStatus,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(SensorsTab): Object);


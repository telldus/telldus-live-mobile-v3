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
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';

import { View, TabBar } from '../../../BaseComponents';
import {
	GraphValuesDropDown,
	SensorHistoryLineChart,
	DateBlock,
	CalendarModalComponent,
} from './SubViews';

import { getSensorHistory, changeDefaultHistorySettings } from '../../Actions/Sensors';
import { getHistory, storeHistory, getLatestTimestamp, getSensorTypes } from '../../Actions/LocalStorage';

import type { SensorHistoryQueryParams } from '../../Lib/LocalStorage';
import { utils } from 'live-shared-data';
const { getHistoryTimestamp } = utils;

import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	screenProps: Object,
	sensor: Object,
	dispatch: Function,
	selectedOne: Object | null,
	selectedTwo: Object | null,
	showOne: boolean,
	showTwo: boolean,
};

type State = {
	hasRefreshed: boolean,
	refreshing: boolean,
	hasLoaded: boolean,
	chartDataOne: Array<any>,
	chartDataTwo: Array<any>,
	list?: Array<string>,
	showCalendar: boolean,
	timestamp: Object,
	propToUpdate: 1 | 2,
};

class HistoryTab extends View {
	props: Props;
	state: State;

	getHistoryDataFromAPI: (number, number | null) => void;
	getHistoryDataWithLatestTimestamp: () => void;
	onValueChangeOne: (itemValue: string, itemIndex: number, data: Array<Object>) => void;
	onValueChangeTwo: (itemValue: string, itemIndex: number, data: Array<Object>) => void;

	onPressShowCalendar: () => void;
	onPressPositive: (any) => void;
	onPressNegative: () => void;

	onToggleChartData: (Object) => void;

	delayRefreshHistoryData: any;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="history"
				tintColor={tintColor}
				label={i18n.historyHeader}
				accessibilityLabel={i18n.deviceHistoryTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('History');
		},
	});

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { screenProps } = props;
		if (screenProps.currentScreen !== 'History') {
			return {
				hasRefreshed: false,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.state = {
			hasRefreshed: false,
			refreshing: true,
			hasLoaded: false,
			chartDataOne: [],
			chartDataTwo: [],
			list: [],
			showCalendar: false,
			timestamp: getHistoryTimestamp(),
			propToUpdate: 1,
		};

		this.getHistoryDataFromAPI = this.getHistoryDataFromAPI.bind(this);
		this.getHistoryDataWithLatestTimestamp = this.getHistoryDataWithLatestTimestamp.bind(this);

		this.onValueChangeOne = this.onValueChangeOne.bind(this);
		this.onValueChangeTwo = this.onValueChangeTwo.bind(this);

		this.onPressShowCalendar = this.onPressShowCalendar.bind(this);
		this.onPressPositive = this.onPressPositive.bind(this);
		this.onPressNegative = this.onPressNegative.bind(this);

		this.onToggleChartData = this.onToggleChartData.bind(this);

		this.delayRefreshHistoryData = null;
	}

	componentDidMount() {
		// 'didMount' is called right when the tab navigator is opened(when being in overview tab itself)
		// the conditional check here is to prevent the history related query from happening when being in
		// overview tab, which can result in delay to open history tab if the query is running in the background.
		// Data fetch/query is handled at 'didUpdate' method.
		if (this.props.screenProps.currentScreen === 'History') {
			this.getHistoryData(false, true, this.getHistoryDataWithLatestTimestamp());
		}
	}

	/**
	 *
	 * @hasLoaded : Determines if data loading has been complete(incase when no data in local, API fetch makes loading complete)
	 * Used to determine if data is empty or not, if empty show message.
	 * @refreshing : Used to update the refreshControl state.
	 * @callBackWhenNoData : A callback function to be called when no data found local(Usually function that fetches data
	 * from the API)
	 */
	getHistoryData(hasLoaded: boolean = false, refreshing: boolean = false, callBackWhenNoData: Function = () => {}) {
		const { sensor, screenProps, dispatch } = this.props;
		const { formatMessage } = screenProps.intl;
		getSensorTypes(sensor.id, formatMessage).then((types: any) => {
			if (types && types.length !== 0) {
				const { selectedOne: selectedOnePrev, selectedTwo: selectedTwoPrev } = this.props;
				const selectedOne = selectedOnePrev ? selectedOnePrev : types[0];
				const selectedTwo = selectedTwoPrev ? selectedTwoPrev : (types[1] ? types[1] : null);
				if (selectedOne) {
					// $FlowFixMe
					let queryParams = { ...selectedOne, id: sensor.id };
					this.getSensorTypeHistory(hasLoaded, refreshing, queryParams, 1);
				}
				if (selectedTwo) {
					// $FlowFixMe
					let queryParams = { ...selectedTwo, id: sensor.id };
					this.getSensorTypeHistory(hasLoaded, refreshing, queryParams, 2);
				}
				const settings = {
					selectedOne,
					selectedTwo,
				};
				dispatch(changeDefaultHistorySettings(sensor.id, settings));
				this.setState({
					list: types,
				});
			} else {
				callBackWhenNoData();
			}
		}).catch(() => {
			callBackWhenNoData();
		});
	}

	getSensorTypeHistory(hasLoaded: boolean, refreshing: boolean, queryParams: SensorHistoryQueryParams, list: 1 | 2) {
		const { timestamp } = this.state;
		const { fromTimestamp: from, toTimestamp: to } = timestamp;
		const params = { ...queryParams, from, to };
		getHistory('sensor', params).then((data: Object) => {
			const { chartDataOne, chartDataTwo } = this.state;
			if (data && data.length !== 0) {
				this.setState({
					chartDataOne: list === 1 ? data : chartDataOne,
					chartDataTwo: list === 2 ? data : chartDataTwo,
					hasLoaded: true,
					refreshing: false,
				});
			} else {
				this.setState({
					chartDataOne,
					chartDataTwo,
					hasLoaded,
					refreshing,
				});
			}
		}).catch(() => {
			const { chartDataOne, chartDataTwo } = this.state;
			this.setState({
				chartDataOne,
				chartDataTwo,
				hasLoaded,
				refreshing,
			});
		});
	}

	getHistoryDataWithLatestTimestamp() {
		const { sensor } = this.props;
		const { timestamp } = this.state;
		const { fromTimestamp } = timestamp;
		const { id } = sensor;
		getLatestTimestamp('sensor', id).then((res: Object) => {
			let prevTimestamp = res.tsMax ? (res.tsMax + 1) : fromTimestamp;
			this.getHistoryDataFromAPI(id, prevTimestamp);
		}).catch(() => {
			this.getHistoryDataFromAPI(id, fromTimestamp);
		});
	}

	getHistoryDataFromAPI(id: number, from: number) {
		let noop = () => {};
		const { dispatch } = this.props;
		const { timestamp } = this.state;
		const { toTimestamp: to } = timestamp;
		const params = {
			id,
			from,
			to,
			includeKey: 0,
			includeUnit: 0,
		};
		dispatch(getSensorHistory(params))
			.then((response: Object) => {
				const { history } = response;
				if (history && history.length !== 0) {
					let data = {
						history,
						sensorId: id,
					};
					storeHistory('sensor', data).then(() => {
						this.getHistoryData(true, false, noop);
					}).catch(() => {
						this.getHistoryData(true, false, noop);
					});
				} else {
					this.getHistoryData(true, false, noop);
				}
			}).catch(() => {
				this.getHistoryData(true, false, noop);
			});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'History';
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { screenProps } = this.props;
		const { hasRefreshed, hasLoaded } = this.state;
		if (screenProps.currentScreen === 'History' && !hasRefreshed) {
			// If data fetch did not happen inside 'didMount' do it here
			if (!hasLoaded) {
				this.getHistoryDataWithLatestTimestamp();
			}
			// Whether data is fetched or not, do refresh the data, after timeout, once on each tab visit!
			this.refreshHistoryData();
			this.setState({
				hasRefreshed: true,
			});
		}
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.setState({
				refreshing: true,
			});
			that.getHistoryDataWithLatestTimestamp();
		}, 4000);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	onToggleChartData(settings: Object) {
		const { sensor, dispatch } = this.props;
		dispatch(changeDefaultHistorySettings(sensor.id, settings));
	}

	onValueChangeOne(itemValue: string, itemIndex: number, data: Array<Object>) {
		const { selectedTwo } = this.props;
		if (selectedTwo && selectedTwo.value !== itemValue) {
			const { sensor, dispatch } = this.props;
			const selectedOne = data.find((item: Object): boolean => {
				return item.value === itemValue;
			});
			const settings = {
				selectedOne,
			};
			dispatch(changeDefaultHistorySettings(sensor.id, settings));

			// $FlowFixMe
			const queryParams = {
				...selectedOne,
				id: sensor.id,
			};
			this.getSensorTypeHistory(true, true, queryParams, 1);
		}
	}

	onValueChangeTwo(itemValue: string, itemIndex: number, data: Array<Object>) {
		const { selectedOne } = this.props;
		if (selectedOne && selectedOne.value !== itemValue) {
			const { sensor, dispatch } = this.props;
			const selectedTwo = data.find((item: Object): boolean => {
				return item.value === itemValue;
			});
			const settings = {
				selectedTwo,
			};
			dispatch(changeDefaultHistorySettings(sensor.id, settings));

			// $FlowFixMe
			const queryParams = {
				...selectedTwo,
				id: sensor.id,
			};
			this.getSensorTypeHistory(true, true, queryParams, 2);
		}
	}

	onPressShowCalendar(index: number) {
		this.setState({
			showCalendar: true,
			propToUpdate: index,
		});
	}

	onPressPositive(date: any) {
		const { propToUpdate, timestamp } = this.state;
		const updatedTimestamp = propToUpdate === 1 ? { fromTimestamp: date } : { toTimestamp: date };
		const newTimestamp = { ...timestamp, ...updatedTimestamp };

		this.setState({
			showCalendar: false,
			timestamp: newTimestamp,
		}, () => {
			const { sensor } = this.props;
			const { fromTimestamp: from } = newTimestamp;
			this.getHistoryDataFromAPI(sensor.id, from);
		});
	}

	onPressNegative() {
		this.setState({
			showCalendar: false,
		});
	}

	getMaxDate(index: number, timestamp: Object): string {
		const { toTimestamp } = timestamp;
		if (index === 1) {
			return moment.unix(toTimestamp).format('YYYY-MM-DD');
		}
		return moment().format('YYYY-MM-DD');
	}

	render(): Object | null {
		const {
			screenProps,
			selectedOne,
			selectedTwo,
			showTwo,
			showOne,
		} = this.props;
		const {
			list,
			chartDataOne,
			chartDataTwo,
			hasLoaded,
			showCalendar,
			timestamp,
			propToUpdate,
		} = this.state;

		const { appLayout, intl } = screenProps;
		const { formatMessage } = intl;
		const { fromTimestamp, toTimestamp} = timestamp;

		const {
			containerStyle,
		} = this.getStyle(appLayout);

		if (!hasLoaded) {
			return null;
		}

		const maxDate = this.getMaxDate(propToUpdate, timestamp);
		const chartProps = {
			chartDataOne,
			chartDataTwo,
			selectedOne,
			selectedTwo,
			showTwo,
			showOne,
		};

		return (
			<ScrollView>
				<View style={containerStyle}>
					<View style={{
						flexDirection: 'row',
					}}>
						<DateBlock
							appLayout={appLayout}
							align={'left'}
							label={`${formatMessage(i18n.labelFrom)}:`}
							onPress={this.onPressShowCalendar}
							date={fromTimestamp}
							propToUpdateIndex={1}/>
						<DateBlock
							appLayout={appLayout}
							align={'right'}
							label={`${formatMessage(i18n.labelTo)}:`}
							onPress={this.onPressShowCalendar}
							date={toTimestamp}
							propToUpdateIndex={2}/>
					</View>
					<SensorHistoryLineChart
						{...chartProps}
						// TODO: After loading indicator is implemented, handle the 'loading' state
						// when timestamp and scale change, pass it as prop and handle inside chart's
						// shouldComponentUpdate. Else one scale/timestamp change if chart data length
						// stays the same the chart will not update.
						timestamp={timestamp}
						appLayout={appLayout}
						showCalendar={showCalendar}
						onToggleChartData={this.onToggleChartData}/>
					<GraphValuesDropDown
						selectedOne={selectedOne}
						selectedTwo={selectedTwo}
						list={list}
						onValueChangeOne={this.onValueChangeOne}
						onValueChangeTwo={this.onValueChangeTwo}
						appLayout={appLayout}/>
				</View>
				<CalendarModalComponent
					isVisible={showCalendar}
					current={propToUpdate === 1 ? fromTimestamp : toTimestamp}
					timestamp={timestamp}
					propToUpdate={propToUpdate}
					maxDate={maxDate}
					onPressPositive={this.onPressPositive}
					onPressNegative={this.onPressNegative}
					appLayout={appLayout}
					intl={intl}/>
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		return {
			containerStyle: {
				flex: 1,
				paddingLeft: padding / 2,
				paddingTop: padding,
				paddingBottom: padding / 2,
				paddingRight: padding,
			},
		};
	}

}

function prepareDefaultSettings(defaultSettings?: Object): Object {
	let settings = {
		selectedOne: null,
		selectedTwo: null,
		showOne: true,
		showTwo: true,
	};
	if (!defaultSettings) {
		return settings;
	}
	return { ...settings, ...defaultSettings.historySettings };
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];
	const { defaultSensorSettings } = state.sensorsList;
	const defaultSettings = defaultSensorSettings[id];
	const {
		selectedOne = null,
		selectedTwo = null,
		showOne = true,
		showTwo = true,
	} = prepareDefaultSettings(defaultSettings);

	return {
		sensor,
		selectedOne,
		selectedTwo,
		showOne,
		showTwo,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);

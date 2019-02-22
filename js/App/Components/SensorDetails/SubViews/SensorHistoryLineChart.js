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
import { Modal, Platform } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';
import Orientation from 'react-native-orientation-locker';
const isEqual = require('react-fast-compare');
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';

import { View, FullPageActivityIndicator } from '../../../../BaseComponents';
import ChartLegend from './ChartLegend';
import LineChartDetailed from './LineChartDetailed';
import LineChart from './LineChart';

import {
	storeHistory,
} from '../../../Actions/LocalStorage';
import shouldUpdate from '../../../Lib/shouldUpdate';
import Theme from '../../../Theme';

type Props = {
	chartDataOne: Array<Object>,
	chartDataTwo: Array<Object>,
	selectedOne: Object,
	selectedTwo: Object,
	appLayout: Object,
	timestamp: Object,
	showCalendar: boolean,
	showOne: boolean,
	showTwo: boolean,
	isChartLoading: boolean,
	smoothing: boolean,
	graphView: string,
	liveData: Object,
	sensorId: number,

	onToggleChartData: (Object) => void,
	refreshHistoryDataAfterLiveUpdate: () => Promise<any>,
};

type DefaultProps = {
	showOne: boolean,
	showTwo: boolean,
	smoothing: boolean,
	graphView: string,
};

type State = {
	fullscreen: Object,
	orientation: any,
	isLoading: boolean,
	isUpdating: boolean,
};

class SensorHistoryLineChart extends View<Props, State> {
	props: Props;
	state: State;
	static defaultProps: DefaultProps = {
		showOne: true,
		showTwo: true,
		smoothing: false,
		graphView: 'overview',
	};

	toggleOne: () => void;
	toggleTwo: () => void;
	onPressToggleView: () => void;
	onPressResetChartView: () => void;
	getLinearChartRef: (any) => void;
	_orientationDidChange: (string) => void;
	onRequestClose: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			fullscreen: {
				show: false,
				force: false,
			},
			orientation: Orientation.getInitialOrientation(),
			isLoading: false,
			isUpdating: false,
		};

		this.linearChartRef = undefined;
		this.toggleOne = this.toggleOne.bind(this);
		this.toggleTwo = this.toggleTwo.bind(this);
		this._orientationDidChange = this._orientationDidChange.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);

		this.onPressToggleView = this.onPressToggleView.bind(this);
		this.onPressResetChartView = this.onPressResetChartView.bind(this);
		this.getLinearChartRef = this.getLinearChartRef.bind(this);
		Orientation.addOrientationListener(this._orientationDidChange);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}

		const propsChange = shouldUpdate(this.props, nextProps, ['showOne', 'showTwo', 'isChartLoading', 'smoothing', 'graphView', 'liveData']);
		if (propsChange) {
			return propsChange;
		}

		const { selectedOne, selectedTwo } = this.props;
		const isSelectedEqual = isEqual(selectedOne, nextProps.selectedOne) && isEqual(selectedTwo, nextProps.selectedTwo);
		if (!isSelectedEqual) {
			return true;
		}
		const { timestamp } = this.props;
		const isTimestampEqual = isEqual(timestamp, nextProps.timestamp);
		if (!isTimestampEqual) {
			return true;
		}
		const isLayoutEqual = nextProps.appLayout.width === this.props.appLayout.width;
		if (!isLayoutEqual) {
			return true;
		}

		const isDataOneEqual = nextProps.chartDataOne.length === this.props.chartDataOne.length;
		if (!isDataOneEqual) {
			return true;
		}
		const isDataTwoEqual = nextProps.chartDataTwo.length === this.props.chartDataTwo.length;
		if (!isDataTwoEqual) {
			return true;
		}
		return false;
	}

	_orientationDidChange(orientation: string) {
		const { show, force } = this.state.fullscreen;
		// Hide fullscreen when switching back to PORTRAIT alone is handled here
		// Show fullscreen in LANDSCAPE is handled in componentDidUpdate
		if (orientation === 'PORTRAIT' && show && !force) {
			this.setFullscreenState(false, false, false, orientation);
		} else {
			this.setState({
				orientation: orientation,
			});
		}
	}

	componentWillUnmount() {
		Orientation.removeOrientationListener(this._orientationDidChange);
	}

	toggleTwo() {
		const { showTwo, showOne, onToggleChartData } = this.props;
		if (showOne || (!showOne && !showTwo)) {
			onToggleChartData({ showTwo: !showTwo });
		} else if (!showOne && !showTwo) {
			onToggleChartData({ showTwo: true });
		}
	}

	toggleOne() {
		const { showOne, showTwo, onToggleChartData } = this.props;
		if (showTwo || (!showTwo && !showOne)) {
			onToggleChartData({ showOne: !showOne });
		} else if (!showOne && !showTwo) {
			onToggleChartData({ showOne: true });
		}
	}

	onPressToggleView() {
		const { fullscreen, orientation } = this.state;
		const { appLayout } = this.props;
		const { width, height } = appLayout;
		const isPortrait = height > width;
		const { show } = fullscreen;
		const force = !show ? true : false;

		const isLoading = (Platform.OS === 'android' && isPortrait) ? true : false;
		this.setState({
			fullscreen: {
				show: !show,
				force,
			},
			isLoading,
		}, () => {
			const { show: currShow } = this.state.fullscreen;
			// Modal property 'supportedOrientations' is not supported in Android.
			// So, forcing landscape on show fullscreen and unlock on hide.
			// [IOS cannot be handled this way because it has issue when unlocking all orientation]
			if (Platform.OS === 'android' && currShow && (orientation === 'PORTRAIT' || orientation === 'LANDSCAPE-RIGHT')) {
				Orientation.lockToLandscapeLeft();
			}
			if (Platform.OS === 'android' && currShow && orientation === 'LANDSCAPE-LEFT') {
				Orientation.lockToLandscapeRight();
			}
			if (Platform.OS === 'android' && !currShow) {
				Orientation.unlockAllOrientations();
			}
		});
	}

	getLinearChartRef(ref: any) {
		this.linearChartRef = ref;
	}

	onPressResetChartView() {
		this.linearChartRef && this.linearChartRef.resetZoomDomainData();
	}

	setFullscreenState(show: boolean, force: boolean = false, isLoading: boolean, orientation?: string = this.state.orientation) {
		this.setState({
			fullscreen: {
				show,
				force,
			},
			orientation,
			isLoading,
		});
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { fullscreen, isLoading } = this.state;
		const { show, force } = fullscreen;
		const { appLayout, showCalendar } = this.props;
		const { width, height } = appLayout;
		// Show full screen on LANDSCAPE alone is handled here!
		// This is to wait for the appLayout to change and update the style and chart together
		// else the x-axis, tick and line are not getting updated.
		if ((width !== prevProps.appLayout.width && !showCalendar)) {
			if (width > height && !show) {
				this.setFullscreenState(true, false, false);
			}
			if (Platform.OS === 'android' && show && isLoading) {
				this.setFullscreenState(show, force, false);
			}
		}

		this.checkForLiveDataAndRefresh(prevProps);
	}

	checkForLiveDataAndRefresh(prevProps: Object) {
		const { sensorId, liveData, refreshHistoryDataAfterLiveUpdate } = this.props;
		const newLiveData = !isEqual(prevProps.liveData, liveData);
		// New live data available for the selected sensor scales.
		// Store locally and Refresh.
		if (newLiveData && !this.state.isUpdating) {
			this.setState({
				isUpdating: true,
			});
			const dataToStore = this.prepareLiveDataToStoreInSQLite(liveData, sensorId);
			storeHistory('sensor', dataToStore).then(() => {
				refreshHistoryDataAfterLiveUpdate().then(() => {
					this.setState({
						isUpdating: false,
					});
				}).catch(() => {
					this.setState({
						isUpdating: false,
					});
				});
			}).catch(() => {
				this.setState({
					isUpdating: false,
				});
			});
		}
	}

	prepareLiveDataToStoreInSQLite(liveData: Object, sensorId: number): Object {
		let history = [];
		for (let key in liveData) {
			const { lastUpdated, name, scale, value } = liveData[key];
			history.push({
				ts: lastUpdated,
				data: [{
					name,
					scale,
					value,
				}],
			});
		}
		return {
			history,
			sensorId,
		};
	}

	onRequestClose() {
		this.setFullscreenState(false, false, false);
		if (Platform.OS === 'android') {
			Orientation.unlockAllOrientations();
		}
	}

	renderChart(): Object | null {
		const { fullscreen, isLoading } = this.state;
		const { show } = fullscreen;
		const {
			chartDataOne,
			chartDataTwo,
			selectedOne,
			selectedTwo,
			appLayout,
			timestamp,
			showOne,
			showTwo,
			isChartLoading,
			smoothing,
			graphView,
		} = this.props;

		if (chartDataOne.length === 0 && chartDataTwo.length === 0) {
			return null;
		}

		const {
			containerStyle,
			chartWidth,
			chartHeight,
			colorsScatter,
		} = this.getStyle();

		const legendData = [{
			...selectedOne,
			onPress: this.toggleOne,
			color: showOne ? colorsScatter[0] : Theme.Core.inactiveTintColor,
		},
		{
			...selectedTwo,
			onPress: this.toggleTwo,
			color: showTwo ? colorsScatter[1] : Theme.Core.inactiveTintColor,
		}];

		const max1 = maxBy(chartDataOne, 'value') || { value: 0 };
		const max2 = maxBy(chartDataTwo, 'value') || { value: 0 };
		const min1 = minBy(chartDataOne, 'value') || { value: 0 };
		const min2 = minBy(chartDataTwo, 'value') || { value: 0 };

		const max = maxBy([max1, max2], 'value');
		const min = minBy([min1, min2], 'value');

		const chartCommonProps = {
			chartDataOne,
			chartDataTwo,
			max1,
			max2,
			min1,
			min2,
			selectedOne,
			selectedTwo,
			appLayout,
			timestamp,
			showOne,
			showTwo,
			fullscreen,
			smoothing,
			graphView,
		};

		return (
			<View style={containerStyle}>
				<ChartLegend
					legendData={legendData}
					appLayout={appLayout}
					fullscreen={show}
					onPressResetChartView={this.onPressResetChartView}
					onPressToggleView={this.onPressToggleView} />
				{isLoading || isChartLoading ?
					<View style={{ width: chartWidth, height: chartHeight }}>
						<FullPageActivityIndicator size={'small'} />
					</View>
					:
					<View style={{ flex: 0 }}>
						{graphView === 'overview' ?
							<LineChart
								ref={this.getLinearChartRef}
								{...chartCommonProps} />
							:
							<LineChartDetailed
								{...chartCommonProps}
								max={max}
								min={min} />
						}
					</View>
				}
			</View>
		);
	}

	render(): any {
		const { fullscreen, orientation } = this.state;
		const { show } = fullscreen;
		const chart = this.renderChart();
		if (!show) {
			return chart;
		}

		const supportedOrientations = (orientation === 'PORTRAIT' || orientation === 'LANDSCAPE-LEFT') ? 'landscape-right' :
			(orientation === 'LANDSCAPE-RIGHT' ? 'landscape-left' : 'landscape');


		return (
			<Modal
				isVisible={show}
				transparent={false}
				backdropColor={'#fff'}
				animationType={'none'}
				presentationStyle={'fullScreen'}
				onRequestClose={this.onRequestClose}
				supportedOrientations={[supportedOrientations]}
				hardwareAccelerated={true}>
				<View style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}>
					{chart}
				</View>
			</Modal>
		);
	}

	getStyle(): Object {
		const { show, force } = this.state.fullscreen;
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor, brandDanger, brandInfo, shadow } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		// In Android, on force show full screen orientation is locked to 'LANDSCAPE'
		// So use 'height' on in IOS
		const chartWidth = (Platform.OS === 'ios' && show && force && isPortrait) ? height - outerPadding : width - outerPadding;

		const top = 25, bottom = 30;

		const chartHeight = show ? deviceWidth - (top + bottom + outerPadding)
			:
			isPortrait ? chartWidth * 0.8 : chartWidth * 0.4;

		return {
			containerStyle: show ?
				{
					backgroundColor: '#fff',
					width: chartWidth,
					...shadow,
					alignItems: 'center',
					justifyContent: 'center',
				}
				:
				{
					backgroundColor: '#fff',
					marginLeft: padding / 2,
					width: chartWidth,
					...shadow,
					marginBottom: padding,
				},
			containerWhenLoading: {
				backgroundColor: '#fff',
				width: chartWidth,
				...shadow,
				alignItems: 'center',
				justifyContent: 'center',
				height: chartHeight,
				marginLeft: padding / 2,
				marginBottom: padding,
			},
			chartWidth,
			chartHeight,
			colorsScatter: [brandDanger, brandInfo],
		};
	}
}

function getNewData(data: Object, toTimestamp: number, selectedData: Object, tsOne?: number, tsTwo?: number): Object {
	const today = moment().format('YYYY-MM-DD');
	const toDay = moment.unix(toTimestamp).format('YYYY-MM-DD');
	// Return live data only if 'to' date is today.
	if (today !== toDay) {
		return {};
	}

	const { scale1, type1, scale2, type2 } = selectedData;
	let liveData = {};
	for (let key in data) {
		const { name, scale, lastUpdated, value } = data[key];
		// Return live data only if any of the two chosen scale has new value.
		if (name === type1 && scale === scale1 && lastUpdated > tsOne) {
			liveData[key] = {
				name,
				scale,
				lastUpdated,
				value,
			};
		}
		if (name === type2 && scale === scale2 && lastUpdated > tsTwo) {
			liveData[key] = {
				name,
				scale,
				lastUpdated,
				value,
			};
		}
	}

	return liveData;
}

const checkForNewData = createSelector(
	[
		({ data }: Object): Object => data,
		({ toTimestamp }: Object): number => toTimestamp,
		({ selectedData }: Object): Object => selectedData,
		({ tsOne }: Object): Object => tsOne,
		({ tsTwo }: Object): Object => tsTwo,
	],
	(data: Object, toTimestamp: number, selectedData: Object, tsOne?: number, tsTwo?: number): Object =>
		getNewData(data, toTimestamp, selectedData, tsOne, tsTwo)
);

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { sensors: { byId } } = state;
	const {
		timestamp,
		sensorId,
		selectedOne,
		selectedTwo,
		chartDataOne = [],
		chartDataTwo = [],
	} = ownProps;
	const sensor = byId[sensorId];
	const { scale: scale1, type: type1 } = selectedOne ? selectedOne : { scale: null, type: null };
	const { scale: scale2, type: type2 } = selectedTwo ? selectedTwo : { scale: null, type: null };
	const selectedData = { scale1, type1, scale2, type2 };

	let tsOne, tsTwo;
	if (chartDataOne[0] && chartDataOne[0].ts) {
		tsOne = chartDataOne[0].ts;
	}
	if (chartDataTwo[0] && chartDataTwo[0].ts) {
		tsTwo = chartDataTwo[0].ts;
	}

	let liveData = checkForNewData({ ...sensor, ...timestamp, selectedData, tsOne, tsTwo });

	return {
		liveData,
	};
}

export default connect(mapStateToProps)(SensorHistoryLineChart);

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
import {
	VictoryChart,
	VictoryAxis,
	VictoryLine,
	VictoryTheme,
	VictoryScatter,
	VictoryZoomContainer,
} from 'victory-native';
import moment from 'moment';
import Orientation from 'react-native-orientation-locker';
const isEqual = require('react-fast-compare');

import { View, FullPageActivityIndicator } from '../../../../BaseComponents';
import ChartLegend from './ChartLegend';
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
	liveData: Object,
	isChartLoading: boolean,

	onToggleChartData: (Object) => void,
};

type DefaultProps = {
	showOne: boolean,
	showTwo: boolean,
};

type State = {
	fullscreen: Object,
	orientation: any,
	isLoading: boolean,
};

class SensorHistoryLineChart extends View<Props, State> {
	props: Props;
	state: State;
	static defaultProps: DefaultProps = {
		showOne: true,
		showTwo: true,
	};

	toggleOne: () => void;
	toggleTwo: () => void;
	onPressToggleView: () => void;
	_orientationDidChange: (string) => void;
	onRequestClose: () => void;

	getY: (Object) => number;
	getX: (Object) => number;
	formatXTick: (number) => string;
	renderAxis: (Array<Object>, number) => Object;
	renderLine: (Array<Object>, number) => Object;

	constructor(props: Props) {
		super(props);

		this.state = {
			fullscreen: {
				show: false,
				force: false,
			},
			orientation: Orientation.getInitialOrientation(),
			isLoading: false,
		};
		this.toggleOne = this.toggleOne.bind(this);
		this.toggleTwo = this.toggleTwo.bind(this);
		this._orientationDidChange = this._orientationDidChange.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);

		this.onPressToggleView = this.onPressToggleView.bind(this);
		Orientation.addOrientationListener(this._orientationDidChange);

		this.getY = this.getY.bind(this);
		this.getX = this.getX.bind(this);
		this.formatXTick = this.formatXTick.bind(this);
		this.renderAxis = this.renderAxis.bind(this);
		this.renderLine = this.renderLine.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const isStateEqual = isEqual(this.state, nextState);
		if (!isStateEqual) {
			return true;
		}
		const { showOne, showTwo, isChartLoading } = this.props;
		if ((showOne !== nextProps.showOne) || (showTwo !== nextProps.showTwo) || (isChartLoading !== nextProps.isChartLoading)) {
			return true;
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
		const { liveData } = this.props;
		const isLiveDataEqual = isEqual(liveData, nextProps.liveData);
		if (!isLiveDataEqual) {
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
		const { showTwo, onToggleChartData } = this.props;
		const settings = {
			showTwo: !showTwo,
		};
		onToggleChartData(settings);
	}

	toggleOne() {
		const { showOne, onToggleChartData } = this.props;
		const settings = {
			showOne: !showOne,
		};
		onToggleChartData(settings);
	}

	getTickConfigX(): Object {
		const { fromTimestamp, toTimestamp } = this.props.timestamp;
		const from = moment.unix(fromTimestamp);
		const to = moment.unix(toTimestamp);
		const domainX = Math.abs(from.diff(to, 'days'));

		let ticks = [], day = from;
		ticks.push(fromTimestamp);
		for (let i = 1; i < domainX; i++) {
			let d = day.add(1, 'd');
			ticks.push(d.unix());
		}
		return { ticks };
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
	}

	onRequestClose() {
		this.setFullscreenState(false, false, false);
		if (Platform.OS === 'android') {
			Orientation.unlockAllOrientations();
		}
	}

	getY(data: Object): number {
		return data.value;
	}

	getX(data: Object): number {
		return data.ts;
	}

	formatXTick(tick: number): string {
		return `${moment.unix(tick).format('D')}/${moment.unix(tick).format('M')}`;
	}

	renderAxis(d: Array<Object>, i: number): null | Object {
		const {
			showOne,
			showTwo,
		} = this.props;

		if (!d) {
			return null;
		}
		if (!showOne && i === 0) {
			return null;
		}
		if (!showTwo && i === 1) {
			return null;
		}

		const {
			xOffsets,
			tickPadding,
			anchors,
			chartLineStyle,
		} = this.getStyle();

		return (
			<VictoryAxis dependentAxis
				key={i}
				offsetX={xOffsets[i]}
				style={{
					axis: chartLineStyle,
					ticks: { padding: tickPadding[i] },
					tickLabels: { fill: Theme.Core.inactiveTintColor, textAnchor: anchors[i] },
					grid: chartLineStyle,
				}}
				tickCount={3}
			/>
		);
	}

	renderLine(d: Array<Object>, i: number): null | Object {
		const {
			showOne,
			showTwo,
		} = this.props;

		if (!d) {
			return null;
		}
		if (!showOne && i === 0) {
			return null;
		}
		if (!showTwo && i === 1) {
			return null;
		}

		const {
			colors,
		} = this.getStyle();

		if (d.length === 1) {
			return (
				<VictoryScatter
					key={i}
					data={d}
					style={{ data: { fill: colors[i] } }}
					y={this.getY}
					x={this.getX}
				/>
			);
		}
		return (<VictoryLine
			interpolation={'natural'}
			key={i}
			data={d}
			style={{ data: { stroke: colors[i] } }}
			y={this.getY}
			x={this.getX}
		/>);
	}

	getUpdatedData(currentData: Array<Object>, { ts, value }: Object): Array<Object> {
		const { ts: tsCurrLat } = currentData[0];
		if (ts > tsCurrLat) {
			currentData.unshift({ ts, value });
			return currentData;
		}
		return currentData;
	}

	renderChart(): Object | null {
		const { fullscreen } = this.state;
		const { show } = fullscreen;
		const {
			selectedOne,
			selectedTwo,
			appLayout,
			showOne,
			showTwo,
			liveData,
		} = this.props;

		let {
			chartDataOne,
			chartDataTwo,
		} = this.props;
		if (chartDataOne.length === 0 && chartDataOne.length === 0) {
			return null;
		}

		let chartData = [];
		if (chartDataOne.length !== 0) {
			if (liveData.tsOne) {
				const { tsOne, vOne } = liveData;
				chartDataOne = this.getUpdatedData(chartDataOne, { ts: tsOne, value: vOne });
			}
			chartData.unshift(chartDataOne);
		}
		if (chartDataTwo.length !== 0) {
			if (liveData.tsTwo) {
				const { tsTwo, vTwo } = liveData;
				chartDataTwo = this.getUpdatedData(chartDataTwo, { ts: tsTwo, value: vTwo });
			}
			chartData.push(chartDataTwo);
		}

		const {
			containerStyle,
			chartWidth,
			chartHeight,
			colorsScatter,
			chartLineStyle,
			domainPadding,
			chartPadding,
		} = this.getStyle();

		const { ticks } = this.getTickConfigX();

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

		return (
			<View style={containerStyle}>
				<ChartLegend
					legendData={legendData}
					appLayout={appLayout}
					fullscreen={show}
					onPressToggleView={this.onPressToggleView}/>
				<View style={{flex: 0}}>
					<VictoryChart
						theme={VictoryTheme.material}
						width={chartWidth} height={chartHeight}
						padding={chartPadding}
						domainPadding={{ y: domainPadding, x: 20 }}
						containerComponent={
							<VictoryZoomContainer/>
						}
					>
						<VictoryAxis
							orientation={'bottom'}
							style={{
								parent: {
									border: '0px',
								},
								axis: chartLineStyle,
								tickLabels: { fill: Theme.Core.inactiveTintColor },
								grid: chartLineStyle,
							}}
							tickValues={ticks}
							tickFormat={this.formatXTick}
						/>
						{chartData.map(this.renderAxis)}
						{chartData.map(this.renderLine)}
					</VictoryChart>
				</View>
			</View>
		);
	}

	render(): any {
		const { fullscreen, orientation, isLoading } = this.state;
		const { show } = fullscreen;
		const { isChartLoading } = this.props;

		const {
			containerStyle,
			containerWhenLoading,
		} = this.getStyle();
		if (isChartLoading) {
			return (
				<View style={containerWhenLoading}>
					<FullPageActivityIndicator size={'small'}/>
				</View>
			);
		}

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
					{isLoading ?
						<View style={containerStyle}>
							<FullPageActivityIndicator size={'small'}/>
						</View>
						:
						chart
					}
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

		const { paddingFactor, brandDanger, brandInfo, shadow, inactiveTintColor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		// In Android, on force show full screen orientation is locked to 'LANDSCAPE'
		// So use 'height' on in IOS
		const chartWidth = (Platform.OS === 'ios' && show && force && isPortrait) ? height - outerPadding : width - outerPadding;
		const domainPadding = chartWidth * 0.05;

		const top = 25, bottom = 30;
		const chartPadding = {
			left: 0, top, right: 0, bottom,
		};

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
			padding,
			xOffsets: [0, chartWidth],
			tickPadding: [-20, 5],
			anchors: ['start', 'start'],
			colors: [brandDanger, brandInfo],
			colorsScatter: [brandDanger, brandInfo],
			chartPadding,
			domainPadding,
			chartLineStyle: {
				strokeDasharray: '',
				strokeWidth: 0.9,
				strokeOpacity: 0.25,
				fill: inactiveTintColor,
				stroke: inactiveTintColor,
				pointerEvents: 'painted',
			},
		};
	}
}

function getNewData(data: Object, toTimestamp: number, selectedData: Object): any {
	const today = moment().format('YYYY-MM-DD');
	const toDay = moment.unix(toTimestamp).format('YYYY-MM-DD');
	if (today !== toDay) {
		return {
			tsOne: null,
			vOne: null,
			tsTwo: null,
			vTwo: null,
		};
	}

	const { scale: scale1, type: type1, scale2, type2 } = selectedData;
	let tsOne = null, vOne = null, tsTwo = null, vTwo = null;
	for (let key in data) {
		const { name, scale, lastUpdated, value } = data[key];
		if (name === type1 && scale === scale1) {
			tsOne = lastUpdated;
			vOne = parseInt(value, 10);
		}
		if (name === type2 && scale === scale2) {
			tsTwo = lastUpdated;
			vTwo = parseInt(value, 10);
		}
	}

	if (!tsOne && !tsTwo) {
		return {
			tsOne: null,
			vOne: null,
			tsTwo: null,
			vTwo: null,
		};
	}

	return {
		tsOne,
		vOne,
		tsTwo,
		vTwo,
	};
}

const checkForNewData = createSelector(
	[
		({ data }: Object): Object => data,
		({ toTimestamp }: Object): number => toTimestamp,
		({ selectedData }: Object): Object => selectedData,
	],
	(data: Object, toTimestamp: number, selectedData: Object): Array<any> => getNewData(data, toTimestamp, selectedData)
);

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { sensors: { byId }} = state;
	const { timestamp, sensorId, selectedOne, selectedTwo } = ownProps;
	const sensor = byId[sensorId];
	const { scale: scale1, type: type1 } = selectedOne ? selectedOne : {scale: null, type: null};
	const { scale: scale2, type: type2 } = selectedTwo ? selectedTwo : {scale: null, type: null};
	const selectedData = { scale1, type1, scale2, type2 };

	return {
		liveData: checkForNewData({...sensor, ...timestamp, selectedData}),
	};
}

export default connect(mapStateToProps, null)(SensorHistoryLineChart);

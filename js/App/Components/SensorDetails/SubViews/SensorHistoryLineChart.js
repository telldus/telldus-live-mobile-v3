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
import { Modal } from 'react-native';
import {
	VictoryChart,
	VictoryAxis,
	VictoryLine,
	VictoryTheme,
} from 'victory-native';
import moment from 'moment';
import Orientation from 'react-native-orientation';

import { View } from '../../../../BaseComponents';
import ChartLegend from './ChartLegend';
import Theme from '../../../Theme';

type Props = {
	chartDataOne: Array<any>,
	chartDataTwo: Array<any>,
	selectedOne: Object,
	selectedTwo: Object,
	appLayout: Object,
	landscape: boolean,
	fullscreen: boolean,
	onPressToggleView: () => void,
};

type State = {
	showOne: boolean,
	showTwo: boolean,
};

export default class SensorHistoryLineChart extends View<Props, State> {
	props: Props;

	toggleOne: () => void;
	toggleTwo: () => void;
	constructor(props: Props) {
		super(props);

		this.state = {
			showOne: true,
			showTwo: true,
		};
		this.toggleOne = this.toggleOne.bind(this);
		this.toggleTwo = this.toggleTwo.bind(this);
	}

	toggleTwo() {
		this.setState({
			showTwo: !this.state.showTwo,
		});
	}

	toggleOne() {
		this.setState({
			showOne: !this.state.showOne,
		});
	}

	getTickConfigX(): Object {
		const { fromTimestamp, toTimestamp } = this.props.timestamp;
		const from = moment.unix(fromTimestamp);
		const to = moment.unix(toTimestamp);
		const domainX = Math.abs(from.diff(to, 'days'));
		return { domainX };
	}

	componentDidUpdate(prevProps: Object) {
		if (!prevProps.landscape && this.props.landscape) {
			Orientation.lockToLandscape();
		} else if (prevProps.landscape && !this.props.landscape) {
			Orientation.unlockAllOrientations();
		}
	}

	renderChart(): Object | null {
		const { showOne, showTwo } = this.state;
		const {
			chartDataOne,
			chartDataTwo,
			selectedOne,
			selectedTwo,
			appLayout,
			fullscreen,
			onPressToggleView,
		} = this.props;
		if (chartDataOne.length === 0 && chartDataOne.length === 0) {
			return null;
		}
		let chartData = [];
		if (chartDataOne.length !== 0) {
			chartData.unshift(chartDataOne);
		}
		if (chartDataTwo.length !== 0) {
			chartData.push(chartDataTwo);
		}
		let maxima = chartData.map((dataset: Array<any>): any => {
			return Math.max(...dataset.map((d: Object): any => d.value));
		});

		const {
			containerStyle,
			chartWidth,
			chartHeight,
			xOffsets,
			tickPadding,
			colors,
			colorsScatter,
			anchors,
			chartLineStyle,
			domainPadding,
		} = this.getStyle(appLayout);

		const { domainX } = this.getTickConfigX();

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
					fullscreen={fullscreen}
					onPressToggleView={onPressToggleView}/>
				<VictoryChart
					theme={VictoryTheme.material}
					width={chartWidth} height={chartHeight}
					padding={{left: 0, top: 25, right: 0, bottom: 30}}
					domainPadding={{ y: domainPadding }}
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
						tickCount={domainX}
						tickFormat={(x: number): number => moment.unix(x).format('E')} // eslint-disable-line
					/>
					{chartData.map((d: Array<Object>, i: number): Object | null => {
						if (!d) {
							return null;
						}
						if (!showOne && i === 0) {
							return null;
						}
						if (!showTwo && i === 1) {
							return null;
						}
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
								// Use normalized tickValues (0 - 1)
								tickValues={[0, 0.5, 1]}
								// Re-scale ticks by multiplying by correct maxima
								tickFormat={(t: number): number => t * maxima[i]} // eslint-disable-line
							/>
						);
					}
					)}
					{chartData.map((d: Array<Object>, i: number): Array<Object> | null => {
						if (!d) {
							return null;
						}
						if (!showOne && i === 0) {
							return null;
						}
						if (!showTwo && i === 1) {
							return null;
						}
						return (<VictoryLine
							key={i}
							data={d}
							interpolation={'natural'}
							style={{ data: { stroke: colors[i] } }}
							// normalize data
							y={(datum: Object): number => {// eslint-disable-line
								return datum.value === 0 ? 0 : datum.value / maxima[i];
							}}
							x={(datum: Object): number => datum.ts} // eslint-disable-line
						/>);
					}
					)}
				</VictoryChart>
			</View>
		);
	}

	render(): Object {
		const { fullscreen } = this.props;
		const chart = this.renderChart();
		if (!fullscreen) {
			return chart;
		}
		return (
			<Modal
				isVisible={fullscreen}
				transparent={false}
				backdropColor={'#fff'}
				animationType={'slide'}
				presentationStyle={'fullScreen'}
				onRequestClose={this.noOP}
				supportedOrientations={['landscape']}>
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

	getStyle(appLayout: Object): Object {
		const { fullscreen } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor, brandDanger, brandInfo, shadow, inactiveTintColor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		const chartWidth = fullscreen ? (height - outerPadding) : (deviceWidth - outerPadding);
		const chartHeight = fullscreen ? deviceWidth - 50 : chartWidth * 0.8;

		return {
			containerStyle: {
				backgroundColor: '#fff',
				marginLeft: padding / 2,
				width: chartWidth,
				...shadow,
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
			domainPadding: chartWidth * 0.05,
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

	noOP() {
	}
}

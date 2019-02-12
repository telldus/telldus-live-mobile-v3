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
import { Platform } from 'react-native';
import {
	VictoryChart,
	VictoryAxis,
	VictoryLine,
	VictoryTheme,
	VictoryScatter,
	VictoryZoomContainer,
} from 'victory-native';
import moment from 'moment';
const isEqual = require('react-fast-compare');

import { View } from '../../../../BaseComponents';

import shouldUpdate from '../../../Lib/shouldUpdate';
import Theme from '../../../Theme';

type Props = {
	chartDataOne: Array<Object>,
	chartDataTwo: Array<Object>,
	selectedOne: Object,
	selectedTwo: Object,
	appLayout: Object,
	timestamp: Object,
	showOne: boolean,
	showTwo: boolean,
	smoothing: boolean,
	graphView: string,
	fullscreen: Object,

	max1: Object,
	max2: Object,
	min1: Object,
	min2: Object,
};

type DefaultProps = {
	showOne: boolean,
	showTwo: boolean,
	smoothing: boolean,
	graphView: string,
};

class LineChart extends View<Props, null> {
props: Props;
static defaultProps: DefaultProps = {
	showOne: true,
	showTwo: true,
	smoothing: false,
	graphView: 'overview',
};

getY: (Object) => number;
getX: (Object) => number;
formatXTick: (number) => string;
renderAxis: (Array<Object>, number) => Object;
renderLine: (Array<Object>, number) => Object;
getYOne: (Object) => number;
getYTwo: (Object) => number;
formatYTickOne: (number) => number;
formatYTickTwo: (number) => number;

constructor(props: Props) {
	super(props);

	this.getY = this.getY.bind(this);
	this.getX = this.getX.bind(this);
	this.formatXTick = this.formatXTick.bind(this);
	this.renderAxis = this.renderAxis.bind(this);
	this.renderLine = this.renderLine.bind(this);

	this.getYOne = this.getYOne.bind(this);
	this.getYTwo = this.getYTwo.bind(this);
	this.formatYTickOne = this.formatYTickOne.bind(this);
	this.formatYTickTwo = this.formatYTickTwo.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const propsChange = shouldUpdate( this.props, nextProps, [
		'showOne', 'showTwo', 'smoothing', 'fullscreen', 'graphView',
	]);
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

getTickConfigX(): Object {
	const { fromTimestamp, toTimestamp } = this.props.timestamp;
	const from = moment.unix(fromTimestamp);
	const to = moment.unix(toTimestamp);
	const domainX = Math.abs(from.diff(to, 'days'));

	let ticks = [], day = from;
	ticks.push(fromTimestamp);
	for (let i = 1; i <= domainX; i++) {
		let d = day.add(1, 'd');
		ticks.push(d.unix());
	}
	return { ticks };
}

getY(data: Object): number {
	return data.value;
}

getYOne(data: Object): number {
	const { max1 } = this.props;
	if (!data.value || !max1) {
		return data.value;
	}
	return data.value / max1.value;
}

getYTwo(data: Object): number {
	const { max2 } = this.props;
	if (!data.value || !max2) {
		return data.value;
	}
	return data.value / max2.value;
}

getX(data: Object): number {
	return data.ts;
}

formatXTick(tick: number): string {
	return `${moment.unix(tick).format('D')}/${moment.unix(tick).format('M')}`;
}

formatYTickOne(tick: number): number {
	const { max1 } = this.props;
	if (!max1) {
		return tick;
	}
	return Math.ceil(tick * max1.value);
}

formatYTickTwo(tick: number): number {
	const { max2 } = this.props;
	if (!max2) {
		return tick;
	}
	return Math.ceil(tick * max2.value);
}

getDomainY(): Array<number> {
	const { min1, min2 } = this.props;

	if ((min1 && min1.value < 0) || (min2 && min2.value < 0)) {
		return [-1, 1];
	}
	return [0, 1];
}

getTicksY(): Array<number> {
	const { min1, min2 } = this.props;

	if ((min1 && min1.value < 0) || (min2 && min2.value < 0)) {
		return [-1, -0.5, 0, 0.5, 1];
	}
	return [0, 0.5, 1];
}

renderAxis(d: Array<Object>, i: number, styles: Object): null | Object {
	const {
		showOne,
		showTwo,
		graphView,
	} = this.props;

	if (!d || d.length === 0) {
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
	} = styles;

	let dependentConfigs = {};
	if (graphView === 'detailed' && d.length > 1) {
		let formatYTick = this.formatYTickOne;
		if (i === 1) {
			formatYTick = this.formatYTickTwo;
		}
		const tickValues = this.getTicksY();
		dependentConfigs = {
			tickValues,
			tickFormat: formatYTick,
		};
	} else {
		dependentConfigs = {
			tickCount: 3,
		};
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
			{...dependentConfigs}
		/>
	);
}

renderLine(d: Array<Object>, i: number, styles: Object): null | Object {
	const {
		showOne,
		showTwo,
		smoothing,
		graphView,
	} = this.props;

	if (!d || d.length === 0) {
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
	} = styles;

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

	let getY = this.getY;
	if (graphView === 'detailed') {
		getY = this.getYOne;
		if (i === 1) {
			getY = this.getYTwo;
		}
	}

	return (<VictoryLine
		interpolation={smoothing ? 'monotoneX' : 'linear'}
		key={i}
		data={d}
		style={{ data: { stroke: colors[i] } }}
		y={getY}
		x={this.getX}
	/>);
}

render(): Object | null {
	const {
		chartDataOne,
		chartDataTwo,
		graphView,
	} = this.props;

	if (chartDataOne.length === 0 && chartDataTwo.length === 0) {
		return null;
	}

	const styles = this.getStyle();
	const {
		chartWidth,
		chartHeight,
		chartLineStyle,
		domainPadding,
		chartPadding,
		...others
	} = styles;

	const { ticks } = this.getTickConfigX();

	let dependentConfigs = {};
	if (graphView === 'detailed' && chartDataOne.length > 1 && chartDataTwo.length > 1) {
		const y = this.getDomainY();
		dependentConfigs = {
			domain: { y },
		};
	}

	const axisOne = this.renderAxis(chartDataOne, 0, styles);
	const axisTwo = this.renderAxis(chartDataTwo, 1, styles);

	const lineOne = this.renderLine(chartDataOne, 0, others);
	const lineTwo = this.renderLine(chartDataTwo, 1, others);

	return (
		<VictoryChart
			theme={VictoryTheme.material}
			width={chartWidth} height={chartHeight}
			padding={chartPadding}
			domainPadding={{ y: domainPadding, x: 20 }}
			containerComponent={
				<VictoryZoomContainer/>
			}
			{...dependentConfigs}
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
			{axisOne}
			{axisTwo}
			{lineOne}
			{lineTwo}
		</VictoryChart>
	);
}

getStyle(): Object {
	const { appLayout, fullscreen } = this.props;
	const { show, force } = fullscreen;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, brandDanger, brandInfo, inactiveTintColor } = Theme.Core;

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

export default LineChart;

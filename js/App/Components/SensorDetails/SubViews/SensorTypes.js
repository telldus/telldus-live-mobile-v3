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
import moment from 'moment';

import { View } from '../../../../BaseComponents';
import SensorBlock from './SensorBlock';

import { getSensorInfo, getWindDirection } from '../../../Lib';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	sensor: Object,
	intl: Object,
};

type State = {
};

export default class SensorTypes extends View<Props, State> {
	props: Props;
	state: State;
	constructor(props: Props) {
		super(props);
		this.state = {
		};

		const { formatMessage } = this.props.intl;

		this.labelSensor = formatMessage(i18n.labelSensor);
	}

	getSensors(): Array<Object> {
		const { appLayout, sensor, intl } = this.props;
		const { data } = sensor;
		const { formatMessage } = intl;

		let sensors = [], sensorAccessibilityInfo = '';
		Object.values(data).forEach((values: any, index: number) => {
			const { value, scale, name, lastUpdated, max, min, maxTime, minTime } = values;
			const { label, unit, icon, sensorInfo, formatOptions } = getSensorInfo(name, scale, value, false, formatMessage);

			let props = {
				key: index,
				name,
				value,
				unit,
				icon,
				label,
				max,
				min,
				maxTime: moment.unix(maxTime),
				minTime: moment.unix(minTime),
				appLayout,
				lastUpdated: moment.unix(lastUpdated),
				formatOptions,
			};
			sensorAccessibilityInfo = `${sensorAccessibilityInfo}, ${sensorInfo}`;

			if (name === 'wdir') {
				props = { ...props, value: getWindDirection(value, formatMessage) };
			}
			sensors.push(
				<SensorBlock {...props}/>);

		});
		return sensors;
	}

	render(): Object {
		const { appLayout } = this.props;

		const { containerStyle } = this.getStyles(appLayout);
		const sensors = this.getSensors();

		return (
			<View style={containerStyle}>
				{sensors}
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		return {
			containerStyle: {
				flex: 0,
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
		};
	}
}

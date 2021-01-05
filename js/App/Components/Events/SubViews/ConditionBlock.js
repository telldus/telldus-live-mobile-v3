
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
 *
 */

// @flow

'use strict';

import React, {
	memo,
	useMemo,
} from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import BlockItem from './BlockItem';

import {
	getDeviceActionIcon,
} from '../../../Lib/DeviceUtils';
import {
	getSensorInfo,
} from '../../../Lib/SensorUtils';
import {
	getSelectedDays,
} from '../../../Lib/getDays';

// import i18n from '../../../Translations/common';


type Props = {
	type: string,
	isLast: boolean,
	isFirst: boolean,

	clientId?: string,

	deviceId?: string,
	method?: string,

	sensorId?: string,
	value?: string,
	valueType?: string,
	edge?: string,
	scale?: string,

	sunStatus?: string,
	offset?: string,

	fromHour?: string,
    fromMinute?: string,
    toHour?: string,
    toMinute?: string,

	seperatorText: string,

	weekdays?: string,
};

const prepareInfoFromTriggerData = (type: string, {
	formatMessage,
	formatDate,
	formatTime,
	device,
	method,
	sensor,
	...others
}: Object): Object => { // TODO: Translate
	if (type === 'device') {
		if (!device) {
			return {
				label: 'Device not found',
				leftIcon: 'device-alt',
			};
		}
		const {
			deviceType,
			name,
			supportedMethods = {},
		} = device;
		method = parseInt(method, 10);
		const {
			TURNON,
			TURNOFF,
		} = getDeviceActionIcon(deviceType, method, supportedMethods);
		switch (deviceType) {
			case '0000004-0001-1000-2005-ACCA54000000':
			case '00000004-0001-1000-2005-ACCA54000000': {
				if (method === 1) {
					return {
						label: `If ${name} is opened.`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `If ${name} is closed.`,
					leftIcon: TURNOFF,
				};
			}
			default: {
				if (method === 1) {
					return {
						label: `If ${name} is turned on.`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `If ${name} is turned off.`,
					leftIcon: TURNOFF,
				};
			}
		}
	} else if (type === 'sensor') {
		if (!sensor) {
			return {
				label: 'Sensor not found',
				leftIcon: 'sensor',
			};
		}
		const {
			value = '',
			edge,
			scale,
			valueType,
		} = others;
		const sName = sensor.name || '';
		const { label = '', unit = '', icon } = getSensorInfo(valueType, scale, value, false, formatMessage);
		let leftIcon = icon;
		if (edge === '-1') {
			return {
				label: `If ${label} of ${sName} goes below ${value}${unit}.`,
				leftIcon,
			};
		} else if (edge === '1') {
			return {
				label: `If ${label} of ${sName} goes over ${value}${unit}.`,
				leftIcon,
			};
		}
		return {
			label: `If ${label} of ${sName} is equal to ${value}${unit}.`,
			leftIcon,
		};
	} else if (type === 'suntime' && others.client) {
		const {
			client = {},
			sunStatus,
		} = others;
		const {
			sunrise,
			sunset,
		} = client;
		if (sunStatus === '1') {
			let date = new Date(sunrise * 1000);
			return {
				label: `When the sun goes up. Today at ${formatTime(date)}.`,
				leftIcon: 'sunrise',
			};
		}
		let date = new Date(sunset * 1000);
		return {
			label: `When the sun goes down. Today at ${formatTime(date)}.`,
			leftIcon: 'sunset',
		};
	} else if (type === 'time') {
		const {
			fromHour,
			fromMinute,
			toHour,
			toMinute,
		} = others;
		const leftIcon = 'time';
		const dateFrom = Date.parse(`01/01/2017 ${fromHour}:${fromMinute}`);
		const dateTo = Date.parse(`01/01/2017 ${toHour}:${toMinute}`);
		return {
			label: `If current time is between ${formatTime(dateFrom)} and ${formatTime(dateTo)}.`,
			leftIcon,
		};
	} else if (type === 'weekdays') {
		const {
			weekdays = '',
		} = others;
		const prefix = 'If today is';
		let _weekdays = weekdays.split(',');
		_weekdays = _weekdays.map((w: string): number => parseInt(w, 10));
		let days: string[] = getSelectedDays(_weekdays, formatDate, {
			formatDateConfigWeekday: 'short',
		});
		let _days = '';
		days.forEach((d: string) => {
			_days += `${d}, `;
		});
		_days = _days.slice(0, -2);
		return {
			label: `${prefix} ${_days}.`,
			leftIcon: 'day',
		};
	}
	return {
		label: 'Device not found',
		leftIcon: 'device-alt',
	};
};

const ConditionBlock = memo<Object>((props: Props): Object => {
	const {
		deviceId,
		method,
		type,
		isLast,
		sensorId,
		value,
		valueType,
		edge,
		scale,
		sunStatus,
		offset,
		clientId,
		seperatorText,
		isFirst,
		fromHour,
		fromMinute,
		toHour,
		toMinute,
		weekdays,
	} = props;
	const intl = useIntl();

	const { byId } = useSelector((state: Object): Object => state.devices);
	const device = byId[deviceId];
	const { byId: sById } = useSelector((state: Object): Object => state.sensors);
	const sensor = sById[sensorId];
	const { byId: cById } = useSelector((state: Object): Object => state.gateways);
	const client = cById[clientId];
	const {
		label,
		leftIcon,
	} = useMemo((): Object => {
		return prepareInfoFromTriggerData(type, {
			...intl,
			device,
			method,

			sensor,
			value,
			valueType,
			edge,
			scale,

			client,
			sunStatus,
			offset,

			fromHour,
			fromMinute,
			toHour,
			toMinute,

			weekdays,
		});
	}, [client, device, edge, fromHour, fromMinute, intl, method, offset, scale, sensor, sunStatus, toHour, toMinute, type, value, valueType, weekdays]);

	return (
		<BlockItem
			label={label}
			leftIcon={leftIcon}
			isLast={isLast}
			seperatorText={seperatorText}
			isFirst={isFirst}/>
	);
});

export default ConditionBlock;

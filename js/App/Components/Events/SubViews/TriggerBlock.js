
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

// import i18n from '../../../Translations/common';


type Props = {
	type: string,
	isLast: boolean,

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
	if (type === 'device' && device) {
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
						label: `${name} is opened`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `${name} is closed`,
					leftIcon: TURNOFF,
				};
			}
			default: {
				if (method === 1) {
					return {
						label: `${name} is turned on`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `${name} is turned off`,
					leftIcon: TURNOFF,
				};
			}
		}
	} else if (type === 'sensor' && sensor) {
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
				label: `${label} of ${sName} goes below ${value}${unit}`,
				leftIcon,
			};
		} else if (edge === '1') {
			return {
				label: `${label} of ${sName} goes over ${value}${unit}`,
				leftIcon,
			};
		}
		return {
			label: `${label} of ${sName} is equal to ${value}${unit}`,
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
				label: `When the sun goes up. Today at ${formatTime(date)}`,
				leftIcon: 'sunrise',
			};
		}
		let date = new Date(sunset * 1000);
		return {
			label: `When the sun goes down. Today at ${formatTime(date)}`,
			leftIcon: 'sunset',
		};
	} else if (type === 'time') {
		return {
			label: 'time',
		};
	} else if (type === 'blockheater') {
		return {
			label: 'blockheater',
		};
	}
	return {
		label: 'unknown',
	};
};

const TriggerBlock = memo<Object>((props: Props): Object => {
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
		});
	}, [client, device, edge, intl, method, offset, scale, sensor, sunStatus, type, value, valueType]);

	return (
		<BlockItem
			label={label}
			leftIcon={leftIcon}
			isLast={isLast}
			seperatorText={'or'}/>
	);
});

export default TriggerBlock;

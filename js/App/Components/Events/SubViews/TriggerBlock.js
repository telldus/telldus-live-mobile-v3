
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
	prepareInfoFromTriggerData,
} from '../../../Lib/eventUtils';

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

	hour?: string,
	minute?: string,
};

const TriggerBlock: Object = memo<Object>((props: Props): Object => {
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
		hour,
		minute,
		isFirst,
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

			minute,
			hour,
		});
	}, [client, device, edge, hour, intl, method, minute, offset, scale, sensor, sunStatus, type, value, valueType]);

	return (
		<BlockItem
			label={label}
			leftIcon={leftIcon}
			isLast={isLast}
			seperatorText={'or'}
			isFirst={isFirst}/>
	);
});

export default TriggerBlock;

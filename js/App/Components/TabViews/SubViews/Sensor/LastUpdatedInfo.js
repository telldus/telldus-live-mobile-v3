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
import { RawIntlProvider } from 'react-intl';

import {
	FormattedRelative,
} from '../../../../../BaseComponents';

import {
	formatSensorLastUpdate,
} from '../../../../Lib/SensorUtils';

import {
	useRelativeIntl,
} from '../../../../Hooks/App';

const LastUpdatedInfo = (props: Object): Object => {
	const {
		textStyle,
		gatewayTimezone,
		value,
		numeric,
		updateIntervalInSeconds,
		timestamp,
	} = props;

	const intl = useRelativeIntl(gatewayTimezone);
	function formatSensorLastUpdateFunc(time: string): string {
		return formatSensorLastUpdate(time, intl, timestamp, gatewayTimezone);
	}

	return (
		<RawIntlProvider value={intl}>
			<FormattedRelative
				value={value}
				numeric={numeric}
				updateIntervalInSeconds={updateIntervalInSeconds}
				formatterFunction={formatSensorLastUpdateFunc}
				textStyle={textStyle}/>
		</RawIntlProvider>
	);
};

export default LastUpdatedInfo;

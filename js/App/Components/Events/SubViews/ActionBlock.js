
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

// import i18n from '../../../Translations/common';


type Props = {
	type: string,
	isLast: boolean,
	isFirst: boolean,

	deviceId?: string,
	method?: string,

	seperatorText: string,

	to?: string,

	address?: string,

	phoneId?: string,

	url?: string,
};

const prepareInfoFromTriggerData = (type: string, {
	formatMessage,
	formatDate,
	formatTime,
	device,
	method,
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
						label: `Open ${name}.`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `Close ${name}.`,
					leftIcon: TURNOFF,
				};
			}
			default: {
				if (method === 1) {
					return {
						label: `Turn ${name} on.`,
						leftIcon: TURNON,
					};
				}
				return {
					label: `Turn ${name} off`,
					leftIcon: TURNOFF,
				};
			}
		}
	} else if (type === 'sms') {
		const {
			to,
		} = others;
		return {
			label: `Send SMS to ${to}.`,
			leftIcon: 'sms',
		};
	} else if (type === 'email') {
		const {
			address,
		} = others;
		return {
			label: `Send email to ${address}`,
			leftIcon: 'email',
		};
	} else if (type === 'push') {
		const {
			phoneId,
		} = others;
		return {
			label: `Send push notification to ${phoneId}.`,
			leftIcon: 'push',
		};
	} else if (type === 'url') {
		const {
			url,
		} = others;
		return {
			label: `Call url: ${url}`,
			leftIcon: 'httprequest',
		};
	}
	return {
		label: 'Device not found',
		leftIcon: 'device-alt',
	};
};

const ActionBlock = memo<Object>((props: Props): Object => {
	const {
		deviceId,
		method,
		type,
		isLast,
		seperatorText,
		isFirst,
		to,
		address,
		phoneId,
		url,
	} = props;
	const intl = useIntl();

	const { byId } = useSelector((state: Object): Object => state.devices);
	const device = byId[deviceId];
	const {
		label,
		leftIcon,
	} = useMemo((): Object => {
		return prepareInfoFromTriggerData(type, {
			...intl,
			device,
			method,

			to,
			address,
			phoneId,
			url,
		});
	}, [address, device, intl, method, phoneId, to, type, url]);

	return (
		<BlockItem
			label={label}
			leftIcon={leftIcon}
			isLast={isLast}
			seperatorText={seperatorText}
			isFirst={isFirst}/>
	);
});

export default ActionBlock;

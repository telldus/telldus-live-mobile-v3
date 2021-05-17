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

import React, {
	memo,
	useCallback,
} from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import EmptyTabTemplate from './EmptyTabTemplate';

import i18n from '../../../../Translations/common';

import {
	navigate,
} from '../../../../Lib/NavigationService';

type Props = {
};

const NoDevices = (props: Props): Object => {

	const { byId } = useSelector((state: Object): Object => state.gateways);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const onPress = useCallback(() => {
		const gatewaysLen = Object.keys(byId).length;
		const singleGateway = gatewaysLen === 1;
		if (singleGateway) {
			navigate('AddDevice', {
				gateway: byId[Object.keys(byId)[0]],
				singleGateway,
				screen: 'SelectDeviceType',
				params: {
					gateway: byId[Object.keys(byId)[0]],
					singleGateway,
				},
			});
		} else {
			navigate('AddDevice', {
				screen: 'SelectLocation',
			});
		}
	}, [byId]);

	return (
		<EmptyTabTemplate
			onPress={onPress}
			bottonLabel={formatMessage(i18n.iconAddPhraseOneD)}
			headerText={formatMessage(i18n.messageNoDeviceTitle)}
			bodyText={formatMessage(i18n.messageNoDeviceContentAddZ)}
			isLoading={false}
			icon={'outlet'}/>
	);
};

export default (memo<Object>(NoDevices): Object);

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
	useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import EmptyTabTemplate from './EmptyTabTemplate';

import {
	addNewGateway,
} from '../../../../Actions/Gateways';
import {
	showToast,
} from '../../../../Actions/App';

import i18n from '../../../../Translations/common';

import {
	navigate,
} from '../../../../Lib/NavigationService';

type Props = {
	disabled?: boolean,
	onPress?: Function,
};

const NoGateways = (props: Props): Object => {
	const {
		disabled,
		onPress,
	} = props;

	const [ isLoading, setIsLoading ] = useState(false);

	const dispatch = useDispatch();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const _onPress = useCallback(() => {
		setIsLoading(true);
		dispatch(addNewGateway())
			.then((response: Object) => {
				if (response.client) {
					setIsLoading(false);
					navigate(
						'AddLocation',
						{ clients: response.client },
						'AddLocation');
				} else {
					throw response;
				}
			}).catch((err: any) => {
				setIsLoading(false);
				dispatch(showToast(err.message || formatMessage(i18n.unknownError)));
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<EmptyTabTemplate
			onPress={isLoading || disabled ? undefined : onPress || _onPress}
			bottonLabel={formatMessage(i18n.gatewayAdd)}
			headerText={formatMessage(i18n.messageNoGatewayTitle)}
			bodyText={formatMessage(i18n.messageNoGatewayContent)}
			isLoading={isLoading || disabled}
			icon={'location'}/>
	);
};

export default (memo<Object>(NoGateways): Object);

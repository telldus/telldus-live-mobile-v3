
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

import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	SettingsRow,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const AutoRenewalBlock = (props: Object): Object => {
	const {
		style,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		navigation,
	} = props;

	const intl = useIntl();
	const { formatDate, formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {}, subscriptions = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	function onPressManageSubscription() {
		navigation.navigate({
			routeName: 'ManageSubscriptionScreen',
			key: 'ManageSubscriptionScreen',
		});
	}

	let isAutoRenew = false;
	Object.keys(subscriptions).map((key: string) => {
		const {
			product,
			status,
		} = subscriptions[key];
		isAutoRenew = product === 'premium' && status === 'active';
	});

	const value = isAutoRenew ? formatMessage(i18n.labelActive) : formatDate(new Date(pro * 1000));

	const {
		upgradeSyle,
	} = getStyle(layout);

	return (
		<SettingsRow
			type={'text'}
			edit={false}
			inLineEditActive={false}
			label={isAutoRenew ? formatMessage(i18n.automaticRenewal) : formatMessage(i18n.validUntil)}
			value={value}
			appLayout={layout}
			iconValueRight={isAutoRenew ?
				<IconTelldus icon={'settings'} style={upgradeSyle}/>
				:
				null
			}
			onPress={false}
			onPressIconValueRight={isAutoRenew ?
				onPressManageSubscription
				:
				null
			}
			intl={intl}
			style={style}
			contentCoverStyle={contentCoverStyle}
			valueCoverStyle={valueCoverStyle}
			textFieldStyle={textFieldStyle}
			labelTextStyle={labelTextStyle}/>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	return {
		upgradeSyle: {
			color: Theme.Core.brandSecondary,
			fontSize: deviceWidth * 0.04,
		},
		cartIconStyle: {
			fontSize: Math.floor(deviceWidth * 0.045) * 1.3,
			color: Theme.Core.brandSecondary,
		},
	};
};

export default AutoRenewalBlock;


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
	useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
	Platform,
} from 'react-native';

import {
	SettingsRow,
	IconTelldus,
	Text,
} from '../../../../BaseComponents';

import {
	premiumAboutToExpire,
	isAutoRenew as isAutoRenewMeth,
} from '../../../Lib/appUtils';

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
		enablePurchase,
	} = props;

	const intl = useIntl();
	const { formatDate, formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {}, subscriptions = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;

	const onPressManageSubscription = useCallback(() => {
		navigation.navigate('ManageSubscriptionScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressUpgrade = useCallback(() => {
		navigation.navigate('PremiumUpgradeScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let isAutoRenew = isAutoRenewMeth(subscriptions);

	const premAboutExpire = premiumAboutToExpire(subscriptions, pro);
	const value = isAutoRenew ? formatMessage(i18n.labelActive) : formatDate(new Date(pro * 1000));

	const {
		upgradeSyle,
	} = getStyle(layout);

	const valueTextStyle = premAboutExpire ? {
		color: Theme.Core.locationOffline,
		fontWeight: 'bold',
	} : {};

	const isNotiOS = Platform.OS !== 'ios';

	return (
		<SettingsRow
			type={'text'}
			edit={false}
			inLineEditActive={false}
			label={isAutoRenew ? formatMessage(i18n.automaticRenewal) : formatMessage(i18n.validUntil)}
			value={value}
			valueTextStyle={valueTextStyle}
			appLayout={layout}
			iconValueRight={!enablePurchase ?
				undefined
				:
				isAutoRenew ?
					<IconTelldus
						level={37}
						icon={'settings'}
						style={upgradeSyle}/>
					:
					(enablePurchase && isNotiOS) ?
						<Text
							level={37}
							style={upgradeSyle}>{formatMessage(i18n.renew)}</Text>
						:
						undefined
			}
			onPress={false}
			onPressRHS={!enablePurchase ?
				undefined
				:
				isAutoRenew ?
					onPressManageSubscription
					:
					isNotiOS ?
						onPressUpgrade
						:
						undefined
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

	const {
		fontSizeFactorFour,
	} = Theme.Core;

	return {
		upgradeSyle: {
			fontSize: deviceWidth * fontSizeFactorFour,
		},
	};
};

export default (React.memo<Object>(AutoRenewalBlock): Object);

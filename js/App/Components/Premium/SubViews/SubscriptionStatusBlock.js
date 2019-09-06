
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
import moment from 'moment';

import {
	SettingsRow,
	Text,
	View,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const SubscriptionStatusBlock = (props: Object): Object => {
	const {
		style,
		contentCoverStyle,
		valueCoverStyle,
		textFieldStyle,
		labelTextStyle,
		navigation,
	} = props;

	const intl = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);
	const { userProfile = {} } = useSelector((state: Object): Object => state.user);
	const { pro } = userProfile;
	const accStatus = moment().unix() > pro ? 'Basic' : 'Premium';

	function onPressUpgrade() {
		navigation.navigate({
			routeName: 'PremiumUpgradeScreen',
			key: 'PremiumUpgradeScreen',
		});
	}

	const {
		upgradeSyle,
		labelStyle,
		coverStyle,
	} = getStyle(layout);

	return (
		<View style={coverStyle}>
			<Text style={labelStyle}> Subscription </Text>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={false}
				label={'Subscription'}
				value={accStatus}
				appLayout={layout}
				iconValueRight={<Text style={upgradeSyle}> Upgrade </Text>}
				onPress={false}
				onPressIconValueRight={onPressUpgrade}
				intl={intl}
				style={style}
				contentCoverStyle={contentCoverStyle}
				valueCoverStyle={valueCoverStyle}
				textFieldStyle={textFieldStyle}
				labelTextStyle={labelTextStyle}/>
		</View>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		coverStyle: {
			marginTop: padding,
		},
		upgradeSyle: {
			color: Theme.Core.brandSecondary,
			fontSize: deviceWidth * 0.04,
		},
		labelStyle: {
			color: '#b5b5b5',
			fontSize: Math.floor(deviceWidth * 0.045),
		},
	};
};

export default SubscriptionStatusBlock;

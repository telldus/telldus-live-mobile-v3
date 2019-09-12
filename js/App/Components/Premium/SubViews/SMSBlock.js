
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
	Text,
	View,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const SMSBlock = (props: Object): Object => {
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
	const { credits = 0 } = userProfile;

	function onPressViewHistory() {
		navigation.navigate({
			routeName: 'SMSHistoryScreen',
			key: 'SMSHistoryScreen',
		});
	}

	const {
		coverStyle,
		linkTextStyle,
		iconStyle,
	} = getStyle(layout);

	return (
        <>
		<View style={coverStyle}>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={false}
				label={'SMS Credits'}
				value={`${credits}`}
				appLayout={layout}
				iconValueRight={<IconTelldus icon="cart" style={iconStyle}/>}
				onPress={false}
				intl={intl}
				style={style}
				contentCoverStyle={contentCoverStyle}
				valueCoverStyle={valueCoverStyle}
				textFieldStyle={textFieldStyle}
				labelTextStyle={labelTextStyle}/>
		</View>
        <Text style={linkTextStyle} onPress={onPressViewHistory}> View SMS history </Text>
        </>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;
	const fontSize = deviceWidth * 0.04;

	return {
		coverStyle: {
			marginTop: padding,
		},
		iconStyle: {
			color: Theme.Core.brandSecondary,
			fontSize: Math.floor(deviceWidth * 0.045) * 1.3,
		},
		linkTextStyle: {
			marginTop: padding / 2,
			alignSelf: 'center',
			fontSize: fontSize * 0.9,
			color: Theme.Core.brandSecondary,
			textAlignVertical: 'center',
			textAlign: 'center',
			padding: 5,
		},
	};
};

export default SMSBlock;

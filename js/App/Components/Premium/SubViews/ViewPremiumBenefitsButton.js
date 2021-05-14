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
	TouchableButton,
	Text,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const ViewPremiumBenefitsButton = (props: Object): Object => {
	const {
		buttonAccessibleProp = true,
		navigation,
		linkTextStyle,
		button = true,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const {
		buttonStyle,
		textStyle,
	} = getStyles(layout);

	const onPress = useCallback(() => {
		navigation.navigate('PremiumBenefitsScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{ button ? <TouchableButton
				onPress={onPress}
				text={formatMessage(i18n.viewBenefitsPremium)}
				accessibilityLabel={formatMessage(i18n.viewBenefitsPremium)}
				accessible={buttonAccessibleProp}
				style={buttonStyle}
			/>
				:
				<Text
					level={36}
					onPress={onPress}
					style={[textStyle, linkTextStyle]}>
					{formatMessage(i18n.viewBenefitsPremiumTwo)}
				</Text>
			}
		</>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
			width: deviceWidth * 0.7,
			maxWidth: width - (padding * 2),
		},
		textStyle: {
			fontSize,
			padding: 5,
			alignSelf: 'center',
			textAlign: 'center',
		},
	};
};

export default (React.memo<Object>(ViewPremiumBenefitsButton): Object);

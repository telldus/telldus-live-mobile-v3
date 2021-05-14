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
} from 'react';
import {
	useIntl,
} from 'react-intl';
import { useSelector } from 'react-redux';

import View from './View';
import Text from './Text';
import IconTelldus from './IconTelldus';

import Theme from '../App/Theme';

type Props = {
	icon: string,
	tintColor?: string,
	label: any,
	accessibilityLabel?: Object,
	focused?: boolean,
};

const TabBar = memo<Object>((props: Props): Object => {

	let {
		icon,
		tintColor,
		label = '',
		accessibilityLabel,
		focused,
	} = props;

	const intl = useIntl();
	accessibilityLabel = typeof accessibilityLabel === 'string' ? accessibilityLabel : intl.formatMessage(accessibilityLabel);

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		iconSize,
		container,
		labelStyle,
	} = getStyles({
		layout,
		tintColor,
	});

	label = typeof label === 'string' ? label : intl.formatMessage(label);

	const level = focused ? 34 : 39;

	return (
		<View style={container} accessibilityLabel={accessibilityLabel}>
			<IconTelldus
				icon={icon}
				size={iconSize}
				color={tintColor}
				level={level}/>
			<Text
				level={level}
				style={labelStyle}>
				{label}
			</Text>
		</View>
	);
});

const getStyles = ({
	layout,
	tintColor,
}: Object): Object => {
	const { width, height } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		fontSizeFactorFive,
		fontSizeFactorTwo,
	} = Theme.Core;

	const iconSize = Math.floor(deviceWidth * fontSizeFactorFive);
	const fontSize = Math.floor(deviceWidth * fontSizeFactorTwo);

	return {
		container: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
		},
		iconSize,
		labelStyle: {
			fontSize,
			paddingLeft: 5 + (fontSize * 0.2),
			color: tintColor,
		},
	};
};

export default (TabBar: Object);

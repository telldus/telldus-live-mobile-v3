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
	useSelector,
} from 'react-redux';

import {
	Text,
	TouchableButton,
	IconTelldus,
	ThemedScrollView,
} from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

type Props = {
    onPress: Function,
    bottonLabel: string,
    headerText: string,
	bodyText: string,
	isLoading: boolean,
	icon: string,
};

const EmptyTabTemplate = (props: Props): Object => {

	const {
		onPress,
		bottonLabel,
		headerText,
		bodyText,
		isLoading,
		icon,
	} = props;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		containerStyle,
		headerStyle,
		bodyStyle,
		buttonStyle,
		iconStyle,
	} = getStyles(layout);

	return (
		<ThemedScrollView
			level={3}
			contentContainerStyle={containerStyle}
			style={{
				flex: 1,
			}}>
			{!!icon && <IconTelldus
				level={23}
				icon={icon}
				style={iconStyle}/>}
			{!!headerText && <Text
				level={4}
				style={headerStyle}>
				{headerText}
			</Text>
			}
			{!!bodyText && <Text
				level={26}
				style={bodyStyle}>
				{bodyText}
			</Text>
			}
			{!!bottonLabel && <TouchableButton
				onPress={onPress}
				text={bottonLabel}
				accessible={true}
				style={buttonStyle}
				disabled={!onPress}
				showThrobber={isLoading}/>
			}
		</ThemedScrollView>
	);
};

const getStyles = (appLayout: Object): Object => {

	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeH = Math.floor(deviceWidth * 0.07);
	const fontSizeB = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		containerStyle: {
			flexGrow: 1,
			alignItems: 'center',
			justifyContent: 'center',
			padding: padding * 2,
		},
		headerStyle: {
			fontSize: fontSizeH,
			textAlign: 'center',
			fontWeight: '500',
		},
		bodyStyle: {
			fontSize: fontSizeB,
			marginVertical: 15,
			textAlign: 'center',
		},
		buttonStyle: {
			maxWidth: width * 0.9,
			width: width * 0.8,
		},
		iconStyle: {
			fontSize: Math.floor(deviceWidth * 0.12),
			marginBottom: 15,
		},
	};
};

export default (memo<Object>(EmptyTabTemplate): Object);

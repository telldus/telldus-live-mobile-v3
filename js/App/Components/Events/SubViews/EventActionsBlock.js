
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
	useCallback,
	useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
	StyleSheet,
} from 'react-native';
// import { useIntl } from 'react-intl';

import {
	View,
	Text,
	TouchableButton,
} from '../../../../BaseComponents';
import ActionBlock from './ActionBlock';

import Theme from '../../../Theme';

// import i18n from '../../../Translations/common';


type Props = {
	navigation: Object,
	disable: boolean,
	route: Object,
	isEdit: boolean,
};

const EventActionsBlock: Object = memo<Object>((props: Props): Object => {
	const {
		navigation,
		disable,
		route,
		isEdit,
	} = props;
	const {
		params = {},
	} = route;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		titleContainerStyle,
		containerStyle,
		titleStyle,
		bodyContainerStyle,
	} = getStyle(layout);

	const {
		action,
	} = useSelector((state: Object): Object => state.event) || {};

	const onPress = useCallback(() => {
		navigation.navigate('SelectActionType', {
			...params,
		});
	}, [navigation, params]);

	const actions = useMemo((): Array<Object> => {
		return action.map((t: Object, i: number): Object => {
			return (
				<ActionBlock
					key={i}
					{...t}
					isLast={i === action.length - 1}
					isFirst={i === 0}
					seperatorText={'and'}/>
			);
		});
	}, [action]);

	return (
		<View
			style={containerStyle}>
			<View
				level={2}
				style={titleContainerStyle}>
				<Text
					style={titleStyle}>
					Actions
				</Text>
			</View>
			{!!actions && actions}
			<View
				style={bodyContainerStyle}>
				{isEdit && <TouchableButton
					text={'Add actions'}
					onPress={onPress}
					accessible={true}
					disabled={disable}
				/>}
			</View>
		</View>
	);
});

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorTwo,
		paddingFactor,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;

	return {
		containerStyle: {
			flex: 1,
			marginTop: padding,
		},
		titleContainerStyle: {
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: Theme.Core.rowTextColor,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: Theme.Core.rowTextColor,
			paddingVertical: 3,
			marginBottom: padding / 2,
		},
		titleStyle: {
			fontSize: deviceWidth * fontSizeFactorTwo,
			marginLeft: padding,
		},
		bodyContainerStyle: {
			marginHorizontal: padding,
		},
	};
};

export default EventActionsBlock;

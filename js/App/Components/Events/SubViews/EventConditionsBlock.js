
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
import groupBy from 'lodash/groupBy';
// import { useIntl } from 'react-intl';

import {
	View,
	Text,
	TouchableButton,
} from '../../../../BaseComponents';
import ConditionBlock from './ConditionBlock';

import Theme from '../../../Theme';

// import i18n from '../../../Translations/common';


type Props = {
	navigation: Object,
	disable: boolean,
	route: Object,
	isEdit: boolean,
};

const EventConditionsBlock = memo<Object>((props: Props): Object => {
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
		condition,
	} = useSelector((state: Object): Object => state.event) || {};
	const onPress = useCallback(() => {
		navigation.navigate('SelectConditionType', {
			...params,
		});
	}, [navigation, params]);

	const conditions = useMemo((): Array<Object> => {
		const grouped = groupBy(condition, (c: Object): boolean => c.group);
		let pG, seperatorText = 'and';
		return Object.keys(grouped).map((g: string, gi: number): Array<Object> => {
			return grouped[g].map((data: Object, i: number): Object => {
				if (pG !== g) {
					seperatorText = 'or';
				} else {
					seperatorText = 'and';
				}
				pG = g;
				return (
					<ConditionBlock
						key={i}
						{...data}
						isLast={gi === Object.keys(grouped).length - 1 && i === grouped[g].length - 1}
						isFirst={gi === 0 && i === 0}
						seperatorText={seperatorText}
					/>
				);
			});
		});
	}, [condition]);

	return (
		<View
			style={containerStyle}>
			<View
				level={2}
				style={titleContainerStyle}>
				<Text
					style={titleStyle}>
                Conditions
				</Text>
			</View>
			{!!conditions && conditions}
			<View
				style={bodyContainerStyle}>
				{isEdit && <TouchableButton
					text={'Add condition'}
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

export default EventConditionsBlock;

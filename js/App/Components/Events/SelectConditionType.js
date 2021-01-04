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
	useEffect,
	useCallback,
	useMemo,
} from 'react';
// import { useIntl } from 'react-intl';

import {
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	TypeBlock,
} from './SubViews';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';

// import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const TYPES = [
	{
		h1: 'Device',
		h2: 'Only execute the actions of this event if a device is either on or off',
		screenName: 'DeviceCondition',
		icon: 'device-alt',
	},
	{
		h1: 'Sensor',
		h2: 'Only execute the actions of this event if a sensor is under or over a specific value',
		screenName: 'DeviceCondition',
		icon: 'sensor',
	},
	{
		h1: 'Sun time',
		h2: 'Only execute the actions of this event if the sun is either up or down',
		screenName: 'DeviceCondition',
		icon: 'sunrise',
	},
	{
		h1: 'Time',
		h2: 'Only execute the actions of this event if the current time is within an interval',
		screenName: 'DeviceCondition',
		icon: 'time',
	},
	{
		h1: 'Week day',
		h2: 'Only execute the actions of this event if the current day of week is a specific day',
		screenName: 'DeviceCondition',
		icon: 'day',
	},
];

const SelectConditionType = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		appLayout,
		onDidMount,
	} = props;

	const {
		colors,
	} = useAppTheme();

	// const intl = useIntl();
	// const {
	// 	formatMessage,
	// } = intl;

	useEffect(() => {
		onDidMount('Condition', 'Select type of condition'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressNext = useCallback((index: number) => {
		const {
			screenName,
		} = TYPES[index];
		navigation.navigate(screenName);
	}, [navigation]);

	const {
		container,
		contentContainerStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	const types = useMemo((): Array<Object> => {
		return TYPES.map((t: Object, i: number): Object => {
			return (
				<TypeBlock
					key={i}
					onPress={onPressNext}
					h1={t.h1}
					h2={t.h2}
					index={i}
					icon={t.icon}/>
			);
		});
	}, [onPressNext]);

	return (
		<ThemedScrollView
			level={2}
			style={container}
			contentContainerStyle={contentContainerStyle}>
			{types}
		</ThemedScrollView>
	);
});

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
		},
	};
};

export default SelectConditionType;

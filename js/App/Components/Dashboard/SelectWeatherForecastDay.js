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
	useCallback,
	useEffect,
	useState,
	useMemo,
} from 'react';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	ThemedScrollView,
	FloatingButton,
} from '../../../BaseComponents';

import {
	getSupportedWeatherProviders,
} from '../../Lib/thirdPartyUtils';

import {
	SelectForecastTimeDD,
} from './SubViews';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const SelectWeatherForecastDay = memo<Object>((props: Object): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;

	const {
		formatMessage,
	} = useIntl();

	const {
		selectedType,
		id,
		latitude,
		longitude,
		uniqueId,
	} = route.params || {};

	const [ selectedIndex, setSelectedIndex ] = useState(0);

	const { layout } = useSelector((state: Object): Object => state.app);

	useEffect(() => {
		onDidMount(formatMessage(i18n.selectForecast), formatMessage(i18n.selectForecastToDisp));
	}, [formatMessage, onDidMount]);

	let items = useMemo((): Object => {
		const {
			supportedDays,
		} = getSupportedWeatherProviders(formatMessage)[selectedType];
		return Object.keys(supportedDays).map((key: string): Object => {
			return {
				key,
				value: supportedDays[key].label,
			};
		});
	}, [formatMessage, selectedType]);

	const {
		container,
		body,
	} = getStyles({layout});

	const onPressNext = useCallback((params: Object) => {
		const {
			value: _value,
			key: timeKey,
		} = items[selectedIndex];
		navigation.navigate('SelectWeatherAttributes', {
			selectedType,
			uniqueId,
			id,
			time: _value,
			timeKey,
			latitude,
			longitude,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items, selectedIndex, selectedType, uniqueId, id, latitude, longitude]);

	const _onValueChange = useCallback((_value: string, itemIndex: number, data: Array<any>) => {
		setSelectedIndex(itemIndex);
	}, []);

	const value = items[selectedIndex].value;

	return (
		<View style={{flex: 1}}>
			<ThemedScrollView
				level={3}
				style={container}>
				<View
					level={3}
					style={body}>
					<SelectForecastTimeDD
						items={items}
						value={value}
						onValueChange={_onValueChange}/>
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={onPressNext}
				imageSource={{uri: 'right_arrow_key'}}/>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
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
		body: {
			flex: 1,
			paddingVertical: padding * 1.5,
			alignItems: 'center',
		},
	};
};

export default (SelectWeatherForecastDay: Object);

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
	useRef,
	useCallback,
} from 'react';
import {
	TouchableOpacity,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import { useIntl } from 'react-intl';
import * as RNLocalize from 'react-native-localize';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import {
	useAppTheme,
} from '../../../Hooks/Theme';
import capitalize from '../../../Lib/capitalize';
import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const FenceCalloutWithMarker = React.memo<Object>((props: Object): Object => {
	const {
		onPress,
		fence,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
		formatTime,
	} = intl;
	const hour12 = !RNLocalize.uses24HourClock();
	const markerRef = useRef(null);

	const {
		colorScheme,
	} = useAppTheme();

	const {
		extras = {},
		...others
	} = fence;
	const {
		radius,
		latitude,
		longitude,
		title,
		isAlwaysActive,
		fromHr = 0,
		fromMin = 0,
		toHr = 0,
		toMin = 0,
	} = extras;

	const { layout } = useSelector((state: Object): Object => state.app);

	const _onPress = useCallback(() => {
		const _fence = {
			...extras,
			...others,
			radius: radius / 1000,
		};
		if (markerRef && markerRef.current && markerRef.current.showCallout) {
			markerRef.current.hideCallout();
		}
		onPress(_fence);
	}, [extras, onPress, others, radius]);

	const dateT = `01/01/2017 ${toHr}:${toMin}`;
	const timestampT = Date.parse(dateT);
	const dateF = `01/01/2017 ${fromHr}:${fromMin}`;
	const timestampF = Date.parse(dateF);

	const {
		container,
		titleStyle,
		editIcon,
		infoStyle,
	} = getStyles(layout);

	return (
		<MapView.Marker.Animated
			ref={markerRef}
			image={{uri: colorScheme === 'dark' ? 'marker_white' : 'marker'}}
			coordinate={{ latitude, longitude }}>
			<MapView.Callout
				onPress={_onPress}>
				<TouchableOpacity
					style={container}>
					<View>
						<Text
							level={23}
							style={titleStyle}>
							{title}
						</Text>
						<Text
							level={4}
							style={infoStyle}>
							{isAlwaysActive ?
								capitalize(formatMessage(i18n.alwaysActive))
								:
								`${capitalize(formatMessage(i18n.labelActive))} ${formatTime(timestampF, {
									hour12,
								})}-${formatTime(timestampT, {
									hour12,
								})}`
							}
						</Text>
					</View>
					<Icon
						style={editIcon}
						name="mode-edit"/>
				</TouchableOpacity>
			</MapView.Callout>
		</MapView.Marker.Animated>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		eulaContentColor,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = deviceWidth * fontSizeFactorEight;

	return {
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			padding: 5,
		},
		titleStyle: {
			fontSize,
		},
		infoStyle: {
			fontSize: fontSize * 0.9,
		},
		editIcon: {
			color: eulaContentColor,
			fontSize,
			marginLeft: 8,
		},
	};
};

export default (FenceCalloutWithMarker: Object);

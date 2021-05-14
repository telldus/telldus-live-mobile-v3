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
	useMemo,
	useCallback,
	Fragment,
} from 'react';
import {
	Platform,
} from 'react-native';
import { useIntl } from 'react-intl';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	CommonActions,
} from '@react-navigation/native';

import {
	View,
	TwoStepFooter,
	Text,
	ThemedScrollView,
	HeaderText,
	SubHeaderText,
	NavigationHeaderPoster,
} from '../../../BaseComponents';
import GeoFenceScreenConfigs from './GeoFenceScreenConfigs';

import {
	changeConsentLocationData,
} from '../../Actions/App';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

const InAppDisclosureScreen = memo<Object>((props: Object): Object => {
	const {
		navigation,
	} = props;
	const {
		goBack,
		dispatch: _dispatch,
	} = navigation;

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		colors,
	} = useAppTheme();

	const {
		scrollViewStyle,
		footersCoverStyle,
		f2Style,
		headerTextStyle,
		subHeaderTextStyle,
		contentContainerStyle,
		contentStyle,
	} = getStyles({
		layout,
		colors,
	});

	const dispatch = useDispatch();

	const onPressF2 = useCallback(() => {
		dispatch(changeConsentLocationData({
			consentLocationData: false,
		}));
		goBack();
	}, [goBack, dispatch]);

	const onPressF3 = useCallback(() => {
		dispatch(changeConsentLocationData({
			consentLocationData: true,
		}));
		let _routes = [
				{
					name: 'Dashboard',
				},
				{
					name: 'Devices',
				},
				{
					name: 'Sensors',
				},
				{
					name: 'Scheduler',
				},
			], index = 0;
		if (Platform.OS === 'ios') {
			_routes.push({
				name: 'MoreOptionsTab',
			});
			index = 4;
		}

		let routes = [
			{
				name: 'Tabs',
				state: {
					index,
					routes: _routes,
				},
			},
			{
				name: 'GeoFenceNavigator',
				state: {
					index: 0,
					routes: GeoFenceScreenConfigs.map(({name}: Object): string => name),
				},
			},
		];

		const resetAction = CommonActions.reset({
			index: 1,
			routes,
		});
		_dispatch(resetAction);
	}, [_dispatch, dispatch]);

	const intl = useIntl();
	const { formatMessage } = intl;

	const content = useMemo((): Array<Object> => {
		const data = [
			{
				h: i18n.inAppConsentH1,
				b: i18n.inAppConsentB1,
			},
			{
				h: i18n.inAppConsentH2,
				b: i18n.inAppConsentB2,
			},
			{
				h: i18n.inAppConsentH3,
				b: i18n.inAppConsentB3,
			},
		];
		return data.map(({h, b}: Object, index: number): Object =>
			<Fragment
				key={`${index}`}>
				<SubHeaderText
					text={`${index + 1}. ${formatMessage(h)}`}
					textStyle={subHeaderTextStyle}/>
				<Text
					level={26}
					style={contentStyle}>
					{formatMessage(b)}
				</Text>
			</Fragment>
		);
	}, [formatMessage, subHeaderTextStyle, contentStyle]);

	const handleBackPress = useCallback((): boolean => {
		return true;
	}, []);

	return (
		<View
			level={3}
			style={{flex: 1}}>
			<NavigationHeaderPoster
				h1={formatMessage(i18n.inAppConsentTitle)}
				align={'center'}
				scrollableH1={false}
				navigation={navigation}
				showLeftIcon={false}
				appLayout={layout}
				handleBackPress={handleBackPress}/>
			<ThemedScrollView
				style={scrollViewStyle}
				contentContainerStyle={contentContainerStyle}
				level={3}>
				<HeaderText
					text={formatMessage(i18n.inAppConsentHeading)}
					textStyle={headerTextStyle}/>
				{content}
			</ThemedScrollView>
			<TwoStepFooter
				f2={formatMessage(i18n.disAllow)}
				f3={formatMessage(i18n.iAccept)}
				onPressF2={onPressF2}
				onPressF3={onPressF3}
				footersCoverStyle={footersCoverStyle}
				f2Style={f2Style}
			/>
		</View>
	);
});

const getStyles = ({
	layout,
	colors,
}: Object): Object => {
	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		textTwo,
	} = colors;

	const {
		paddingFactor,
		getFooterHeight,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const footerHeight = getFooterHeight(deviceWidth) / 2;

	return {
		scrollViewStyle: {
			flex: 1,
			marginBottom: footerHeight,
		},
		contentContainerStyle: {
			marginHorizontal: padding * 2,
			marginTop: padding * 2,
		},
		footersCoverStyle: {
			height: footerHeight,
		},
		f2Style: {
			color: textTwo,
		},
		headerTextStyle: {
			marginBottom: padding,
		},
		subHeaderTextStyle: {
			marginBottom: padding,
		},
		contentStyle: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			marginBottom: padding,
		},
	};
};

export default (InAppDisclosureScreen: Object);

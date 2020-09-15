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
	useMemo,
} from 'react';
import {
	ScrollView,
} from 'react-native';
import {
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	RippleButton,
	Text,
	IconTelldus,
	PosterWithText,
	View,
	ThemedMaterialIcon,
} from '../../../BaseComponents';

import capitalize from '../../Lib/capitalize';
import {
	useCampaignAction,
	useSwitchOrAddAccountAction,
} from '../../Hooks/App';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
    navigation: Object,
};

const MoreOptionsTab = (props: Props): Object => {
	const {
		navigation,
	} = props;

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { firebaseRemoteConfig = {} } = useSelector((state: Object): Object => state.user);

	const {
		geoFenceFeature = JSON.stringify({enable: false}),
	} = firebaseRemoteConfig;

	const { enable: enableGeoFenceFeature } = JSON.parse(geoFenceFeature);

	const {
		themeInApp,
	} = defaultSettings;

	const {
		outerCoverStyle,
		contentContainerStyle,
		rowCoverStyle,
		iconStyle,
		labelStyle,
	} = getStyles(layout);

	const {
		navigateToCampaign,
	} = useCampaignAction();

	const {
		performAddOrSwitch,
	} = useSwitchOrAddAccountAction();

	const settings = useMemo((): Array<Object> => {

		const onOpenSetting = (tabName: string) => {
			navigation.navigate('Profile', {
				screen: tabName,
			});
		};

		const settingsItems = [
			{
				icon: 'phone',
				text: capitalize(formatMessage(i18n.appSettigs)),
				onPress: () => {
					onOpenSetting('AppTab');
				},
				enable: true,
			},
			{
				icon: 'user',
				text: capitalize(formatMessage(i18n.userProfile)),
				onPress: () => {
					onOpenSetting('ProfileTab');
				},
				enable: true,
			},
			{
				iconComponent: <ThemedMaterialIcon
					style={iconStyle}
					name={'group-add'}
					level={23}/>,
				text: capitalize(formatMessage(i18n.switchOrAddAccount)),
				onPress: performAddOrSwitch,
				enable: true,
			},
			{
				icon: 'location',
				text: capitalize(formatMessage(i18n.manageGateways)),
				onPress: () => {
					navigation.navigate('Gateways');
				},
				enable: true,
			},
			{
				icon: 'campaign',
				text: capitalize(formatMessage(i18n.labelExclusiveOffers)),
				onPress: navigateToCampaign,
				enable: true,
			},
			{
				iconComponent: <ThemedMaterialIcon
					style={iconStyle}
					name={'location-on'}
					level={23}/>,
				text: capitalize(formatMessage(i18n.Geofencing)),
				onPress: () => {
					navigation.navigate('GeoFenceNavigator');
				},
				enable: enableGeoFenceFeature,
			},
			{
				icon: 'faq',
				text: capitalize(formatMessage(i18n.labelHelpAndSupport)),
				onPress: () => {
					onOpenSetting('SupportTab');
				},
				enable: true,
			},
		];

		let components = [];
		settingsItems.map(({
			icon,
			iconComponent,
			text,
			onPress,
			enable,
		}: Object, i: number): Object => {
			if (enable) {
				components.push(
					<RippleButton
						level={2}
						style={rowCoverStyle} onPress={onPress} key={`${i}`}>
						{!!icon && <IconTelldus
							level={23}
							style={iconStyle}
							icon={icon}/>}
						{!!iconComponent && iconComponent}
						<Text
							level={23}
							style={labelStyle}>
							{!!text && text}
						</Text>
					</RippleButton>
				);
			}
		});
		return components;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		layout,
		enableGeoFenceFeature,
		themeInApp,
	]);

	return (
		<View style={outerCoverStyle} level={3}>
			<PosterWithText
				appLayout={layout}
				align={'right'}
				showBackButton={false}
				h1={formatMessage(i18n.more)}
				h2={capitalize(formatMessage(i18n.featuresAndSettings))}/>
			<ScrollView
				style={outerCoverStyle}
				contentContainerStyle={contentContainerStyle}>
				{settings}
			</ScrollView>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = Math.floor(deviceWidth * 0.045);

	return {
		outerCoverStyle: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingTop: padding,
			paddingBottom: padding * 2,
		},
		rowCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			marginHorizontal: padding,
			marginTop: padding / 2,
			padding,
			...shadow,
			borderRadius: 2,
		},
		iconStyle: {
			fontSize: fontSizeText * 1.2,
			marginRight: 15,
			textAlign: 'left',
		},
		labelStyle: {
			fontSize: fontSizeText,
		},
	};
};

export default memo<Object>(MoreOptionsTab);

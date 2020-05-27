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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	RippleButton,
	Text,
	IconTelldus,
	FormattedMessage,
	PosterWithText,
	View,
} from '../../../BaseComponents';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';
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

	const { layout } = useSelector((state: Object): Object => state.app);
	const { firebaseRemoteConfig = {} } = useSelector((state: Object): Object => state.user);

	const {
		geoFenceFeature = JSON.stringify({enable: false}),
	} = firebaseRemoteConfig;

	const { enable: enableGeoFenceFeature } = JSON.parse(geoFenceFeature);

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
				textIntl: i18n.appSettigs,
				onPress: () => {
					onOpenSetting('AppTab');
				},
				enable: true,
			},
			{
				icon: 'user',
				textIntl: i18n.userProfile,
				onPress: () => {
					onOpenSetting('ProfileTab');
				},
				enable: true,
			},
			{
				iconComponent: <MaterialIcons
					style={iconStyle}
					name={'group-add'}/>,
				text: capitalizeFirstLetterOfEachWord(formatMessage(i18n.switchOrAddAccount)),
				onPress: performAddOrSwitch,
				enable: true,
			},
			{
				icon: 'location',
				text: capitalizeFirstLetterOfEachWord(formatMessage(i18n.manageGateways)),
				onPress: () => {
					navigation.navigate('Gateways');
				},
				enable: true,
			},
			{
				icon: 'campaign',
				text: capitalizeFirstLetterOfEachWord(formatMessage(i18n.labelExclusiveOffers)),
				onPress: navigateToCampaign,
				enable: true,
			},
			{
				iconComponent: <MaterialIcons
					style={iconStyle}
					name={'location-on'}/>,
				textIntl: i18n.geoFenceSettings,
				onPress: () => {
					navigation.navigate('GeoFenceNavigator');
				},
				enable: enableGeoFenceFeature,
			},
			{
				icon: 'faq',
				textIntl: i18n.labelHelpAndSupport,
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
			textIntl,
			onPress,
			enable,
		}: Object, i: number): Object => {
			if (enable) {
				components.push(
					<RippleButton style={rowCoverStyle} onPress={onPress} key={`${i}`}>
						{!!icon && <IconTelldus style={iconStyle} icon={icon}/>}
						{!!iconComponent && iconComponent}
						<Text style={labelStyle}>
							{!!text && text}
							{!!textIntl && <FormattedMessage {...textIntl} style={labelStyle}/>}
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
	]);

	return (
		<View style={outerCoverStyle}>
			<PosterWithText
				appLayout={layout}
				align={'right'}
				showBackButton={false}
				h1={formatMessage(i18n.more)}
				h2={formatMessage(i18n.featuresAndSettings)}/>
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
		appBackground,
		paddingFactor,
		brandSecondary,
		shadow,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = Math.floor(deviceWidth * 0.045);

	return {
		outerCoverStyle: {
			flex: 1,
			backgroundColor: appBackground,
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
			backgroundColor: '#fff',
			...shadow,
			borderRadius: 2,
		},
		iconStyle: {
			fontSize: fontSizeText * 1.2,
			color: brandSecondary,
			marginRight: 15,
			textAlign: 'left',
		},
		labelStyle: {
			fontSize: fontSizeText,
			color: brandSecondary,
		},
	};
};

export default memo<Object>(MoreOptionsTab);

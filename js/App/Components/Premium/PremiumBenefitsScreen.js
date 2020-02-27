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

import React, { useState } from 'react';
import Swiper from 'react-native-swiper';
import {
	ScrollView,
	Image,
	TouchableOpacity,
	Platform,
	Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import {
	UpgradePremiumButton,
} from './SubViews';

import {
	capitalizeFirstLetterOfEachWord,
} from '../../Lib/appUtils';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

const PremiumBenefitsScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	let swiperRef = React.createRef();

	const [ selectedIndex, setSelectedIndex ] = useState(0);
	const { layout } = useSelector((state: Object): Object => state.app);
	const {
		container,
		body,
		containerStyle,
		cover,
		title,
		bodyText,
		buttonWrapperStyle,
		iconStyle,
		buttonStyleN,
		buttonStyleP,
		labelCover,
		labelIcon,
		labelText,
		labelsContainer,
		moreText,
		swiperStyle,
	} = getStyles(layout);

	const {
		formatMessage,
	} = useIntl();

	const benefits = [
		{
			title: formatMessage(i18n.labelSensorHistory),
			icon: 'sensorhistory',
			body: formatMessage(i18n.sensorHistoryDescription),
		},
		{
			title: formatMessage(i18n.labelSMSNotif),
			icon: 'sms',
			body: formatMessage(i18n.smsNotifDescription),
		},
		{
			title: formatMessage(i18n.labelExclusiveOffers),
			icon: 'campaign',
			body: formatMessage(i18n.exclusiveOffersDescription),
		},
		{
			title: formatMessage(i18n.labelAndroidWidgets),
			icon: 'buttononoff',
			body: formatMessage(i18n.androidWidgetsDescription),
		},
		{
			title: 'If this then that',
			icon: 'ifttt',
			body: formatMessage(i18n.ifttDescription),
		},
		{
			title: capitalizeFirstLetterOfEachWord(formatMessage(i18n.cloudBackup)),
			icon: 'backup',
			body: formatMessage(i18n.cloudBackupDescription),
		},
	];

	function onIndexChanged(index: number) {
		setSelectedIndex(index);
	}

	const screens = benefits.map((screen: Object): Object => {
		return (
			<View style={cover} pointerEvents="box-none">
				<IconTelldus icon={screen.icon} style={iconStyle}/>
				<Text style={title}>{screen.title}</Text>
				<Text style={bodyText}>{screen.body}</Text>
			</View>
		);
	});

	const screenLabels = benefits.map((screen: Object, i: number): Object => {
		function onChangeSelection() {
			if (swiperRef.current && i !== selectedIndex) {
				swiperRef.current.scrollBy(i - selectedIndex);
			}
		}

		const color = selectedIndex === i ? Theme.Core.brandSecondary : Theme.Core.rowTextColor;
		return (
			<TouchableOpacity onPress={onChangeSelection}>
				<View style={labelCover}>
					<IconTelldus icon={screen.icon} style={[labelIcon, {color}]}/>
					<Text style={[labelText, {color}]}>{screen.title}</Text>
				</View>
			</TouchableOpacity>
		);
	});

	function onPressMore() {
		let url = 'https://live.telldus.com/profile/premium';
		Linking.canOpenURL(url)
			.then((supported: boolean): any => {
				if (!supported) {
					return;
				}
				return Linking.openURL(url);
			})
			.catch((err: any) => {
				const message = err.message;
				this.showDialogue(message);
			});
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={capitalizeFirstLetterOfEachWord('Premium access')}
				h2={formatMessage(i18n.getMoreFeaturesAndBenefits)}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body}>
					<Swiper
						ref={swiperRef}
						containerStyle={containerStyle}
						style={Platform.OS === 'android' ? swiperStyle : {}}
						showsButtons={true}
						loop={false}
						loadMinimal={true}
						index={0}
						loadMinimalSize={1}
						showsPagination={false}
						removeClippedSubviews={false}
						buttonWrapperStyle={buttonWrapperStyle}
						onIndexChanged={onIndexChanged}
						nextButton={<Image source={{uri: 'right_arrow_key'}} style={buttonStyleN}/>}
						prevButton={<Image source={{uri: 'left_arrow_key'}} style={buttonStyleP}/>}>
						{screens}
					</Swiper>
					<View style={labelsContainer}>
						{screenLabels}
					</View>
					<Text style={moreText} onPress={onPressMore}>...{formatMessage(i18n.labelMuchMore)}</Text>
				</View>
				<UpgradePremiumButton
					navigation={navigation}/>
			</ScrollView>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.04);
	const fontSizeIcon = Math.floor(deviceWidth * 0.27);

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#fff',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			paddingBottom: padding * 2,
		},
		containerStyle: {
			width: '100%',
			height: deviceWidth * 0.72,
			alignItems: 'center',
			justifyContent: 'center',
		},
		swiperStyle: {
			width: '100%',
			height: '100%',
		},
		cover: {
			flex: 1,
			padding: padding * 2,
			alignItems: 'center',
			justifyContent: 'center',
		},
		buttonWrapperStyle: {
			top: -(deviceWidth * 0.18),
		},
		buttonStyleP: {
			height: fontSize * 1.6,
			width: fontSize * 1.2,
			tintColor: Theme.Core.rowTextColor,
			margin: 10,
		},
		buttonStyleN: {
			height: fontSize * 1.6,
			width: fontSize * 1.2,
			tintColor: Theme.Core.rowTextColor,
			margin: 10,
		},
		iconStyle: {
			fontSize: fontSizeIcon,
			color: Theme.Core.brandSecondary,
		},
		title: {
			fontSize: fontSize * 1.6,
			color: Theme.Core.eulaContentColor,
		},
		bodyText: {
			fontSize,
			color: Theme.Core.eulaContentColor,
			marginTop: 10,
			textAlign: 'center',
		},
		labelsContainer: {
			alignSelf: 'center',
			flexDirection: 'row',
			flexWrap: 'wrap',
			alignItems: 'center',
			justifyContent: 'center',
			paddingRight: padding * 2,
		},
		labelCover: {
			alignItems: 'center',
			justifyContent: 'center',
			marginLeft: padding * 2,
			width: deviceWidth * 0.22,
			marginTop: padding * 2,
		},
		labelIcon: {
			fontSize: fontSize * 4,
			alignSelf: 'center',
		},
		labelText: {
			textAlign: 'center',
			fontSize: fontSize * 0.7,
			flexWrap: 'wrap',
		},
		moreText: {
			alignSelf: 'center',
			textAlign: 'center',
			fontSize: fontSize * 1.4,
			color: Theme.Core.brandSecondary,
			marginTop: padding * 2,
		},
	};
};
export default React.memo<Object>(PremiumBenefitsScreen);

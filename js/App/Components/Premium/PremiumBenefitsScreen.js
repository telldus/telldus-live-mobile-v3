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
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
} from '../../../BaseComponents';
import {
	UpgradePremiumButton,
} from './SubViews';

import Theme from '../../Theme';

const PremiumBenefitsScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	let swiperRef = React.createRef();

	const [ selectedIndex, setSelectedIndex ] = useState(0);
	const { app: {layout} } = useSelector((state: Object): Object => state);
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
	} = getStyles(layout);

	const benefits = [
		{
			title: 'Sensor History',
			icon: 'sensorhistory',
			body: 'Get access to exteded sensor history with Telldus Live! Premium.' +
			' Track your historical data in charts to see trends in temperature, energy ' +
			'consumption and more!',
		},
		{
			title: 'SMS Notifications',
			icon: 'sms',
			body: 'Send automated SMS and emails when something triggers in your Telldus Live! account.' +
			' Maybe a safety system for the fridge temperature or a reminder to water your plants?',
		},
		{
			title: 'Exclusive offers',
			icon: 'campaign',
			body: 'Get access to Premium exclusive offers and campaigns! As a premium user you get the chance ' +
			'to expand your smart home with new things at awesome prices. This way you can actually save money ' +
			'from your Premium subscription!',
		},
		{
			title: 'Android widgets',
			icon: 'buttononoff',
			body: 'Get access to your most used devices and sensors directly on your home screen! Works with all sensors ' +
			'On/Off devices, dimmable devices and even groups. Available for all Premium users with Android devices to enjoy.',
		},
		{
			title: 'If this then that',
			icon: 'ifttt',
			body: 'IFTTT is a service where you can connect your Telldus Live! account to a lot of other things. You can for example ' +
			'use the location in your phone to automatically turn off the lights when you leave your home. The possibilities are endless!',
		},
		{
			title: 'Early access',
			icon: 'bulb',
			body: 'Be first with the newest cool features! As a Premium user you get early access to new features which means you can try it out ' +
			' before everyone else.',
		},
	];

	function onIndexChanged(index: number) {
		setSelectedIndex(index);
	}

	const screens = benefits.map((screen: Object): Object => {
		return (
			<View style={cover}>
				<IconTelldus icon={screen.icon} style={iconStyle}/>
				<Text style={title}>{screen.title}</Text>
				<Text style={bodyText}>{screen.body}</Text>
			</View>
		);
	});

	const screenLabels = benefits.map((screen: Object, i: number): Object => {
		function onChangeSelection() {
			swiperRef.current.scrollBy(i - selectedIndex);
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


	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={'Premium access'} h2={'Get more features & benefits'}
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
					<Text style={moreText}>...and much more!</Text>
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
			height: deviceWidth * 0.72,
			alignItems: 'center',
			justifyContent: 'center',
		},
		cover: {
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
		},
		buttonStyleN: {
			height: fontSize * 1.6,
			width: fontSize * 1.2,
			tintColor: Theme.Core.rowTextColor,
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
			color: Theme.Core.eulaContentColor,
			marginTop: padding * 2,
		},
	};
};
export default PremiumBenefitsScreen;

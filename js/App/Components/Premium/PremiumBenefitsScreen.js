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

import React from 'react';
import Swiper from 'react-native-swiper';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
} from '../../../BaseComponents';
import {
	UpgradePremiumButton,
} from './SubViews';

import Theme from '../../Theme';

const PremiumBenefitsScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;

	const { app: {layout} } = useSelector((state: Object): Object => state);

	const {
		container,
		body,
		containerStyle,
		cover,
		title,
		bodyText,
		buttonWrapperStyle,
	} = getStyles(layout);

	const benefits = [
		{
			title: 'Sensor History',
			icon: '',
			body: 'Get access to exteded sensor history with Telldus Live! Premium.' +
			' Track your historical data in charts to see trends in temperature, energy ' +
			'consumption and more!',
		},
		{
			title: 'SMS Notifications',
			icon: '',
			body: 'Send automated SMS and emails when something triggers in your Telldus Live! account.' +
			' Maybe a safety system for the fridge temperature or a reminder to water your plants?',
		},
		{
			title: 'Exclusive offers',
			icon: '',
			body: 'Get access to Premium exclusive offers and campaigns! As a premium user you get the chance ' +
			'to expand your smart home with new things at awesome prices. This way you can actually save money ' +
			'from your Premium subscription!',
		},
		{
			title: 'Android widgets',
			icon: '',
			body: 'Get access to your most used devices and sensors directly on your home screen! Works with all sensors ' +
			'On/Off devices, dimmable devices and even groups. Available for all Premium users with Android devices to enjoy.',
		},
		{
			title: 'If this then that',
			icon: '',
			body: 'IFTTT is a service where you can connect your Telldus Live! account to a lot of other things. You can for example ' +
			'use the location in your phone to automatically turn off the lights when you leave your home. The possibilities are endless!',
		},
		{
			title: 'Early access',
			icon: '',
			body: 'Be first with the newest cool features! As a Premium user you get early access to new features which means you can try it out ' +
			' before everyone else.',
		},
	];
	const screens = benefits.map((screen: Object): Object => {
		return (
			<View style={cover}>
				<Text style={title}>{screen.title}</Text>
				<Text style={bodyText}>{screen.body}</Text>
			</View>
		);
	});


	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={'Change password'} h2={'Enter new password below'}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body}>
					<Swiper
						containerStyle={containerStyle}
						showsButtons={false}
						loop={false}
						loadMinimal={true}
						loadMinimalSize={1}
						showsPagination={false}
						removeClippedSubviews={false}
						buttonWrapperStyle={buttonWrapperStyle}>
						{screens}
					</Swiper>
				</View>
				<UpgradePremiumButton/>
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

	return {
		container: {
			flex: 1,
			backgroundColor: Theme.Core.appBackground,
		},
		body: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		containerStyle: {
			flex: 0,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'green',
		},
		cover: {
			padding: padding * 2,
			alignItems: 'center',
			justifyContent: 'center',
			...Theme.Core.shadow,
			marginHorizontal: padding,
			marginVertical: padding * 2,
			backgroundColor: '#fff',
		},
		buttonWrapperStyle: {
			top: -80,
		},
		title: {
			fontSize: fontSize * 1.2,
		},
		bodyText: {
			fontSize,
		},
	};
};
export default PremiumBenefitsScreen;

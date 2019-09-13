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
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
	View,
	NavigationHeaderPoster,
	Text,
	IconTelldus,
	TouchableButton,
} from '../../../BaseComponents';

import {
	cancelSubscription,
} from '../../Actions/User';
import {
	showToast,
} from '../../Actions/App';
import {
	getUserProfile,
} from '../../Actions/Login';

import Theme from '../../Theme';

const ManageSubscriptionScreen = (props: Object): Object => {
	const { navigation, screenProps } = props;
	const { toggleDialogueBox } = screenProps;
	const {layout} = useSelector((state: Object): Object => state.app);
	const { userProfile = {}} = useSelector((state: Object): Object => state.user);
	const { credits } = userProfile;
	const {
		container,
		body,
		headerCover,
		iconStyle,
		titleStyleOne,
		titleStyleTwo,
		buttonStyle,
		contentOne,
		contentTwo,
	} = getStyles(layout);

	const dispatch = useDispatch();
	function onConfirm() {
		dispatch(cancelSubscription('premium')).then((response: Object) => {
			if (response && response.status === 'success') {
				dispatch(getUserProfile());
				navigation.goBack();
			} else {
				dispatch(showToast('Sorry something went wrong. Please try again later'));
				dispatch(getUserProfile());
			}
		}).catch((err: Object) => {
			if (err.message === 'b9e1223e-4ea4-4cdf-97f7-0e23292ef40e') {
				dispatch(showToast('User is not subscripbed to any recurring payment'));
			} else if (err.message === '91dedfc0-809d-4335-a1c6-2b5da68d0ad8') {
				dispatch(showToast('Sorry, the subscription is not cancelable'));
			} else {
				dispatch(showToast(err.message || 'Sorry something went wrong. Please try again later'));
			}
			dispatch(getUserProfile());
		});
	}

	function onPress() {
		const header = 'Cancel automatic renewal?';
		const text = 'If you cancel automatic renewal of your Premium ' +
		'subscription you will still have Premium Access for the remaining period ' +
		'that you have paid for. However, you will have to renew manually before that ' +
		'period runs out to avoid losing functionality and sensor history. Please confirm ' +
		'if you still want to cancel.';
		toggleDialogueBox({
			show: true,
			showHeader: true,
			header,
			text, // TODO: translate
			showPositive: true,
			showNegative: true,
			positiveText: 'CONFIRM',
			closeOnPressPositive: true,
			closeOnPressNegative: true,
			onPressPositive: onConfirm,
		});
	}

	return (
		<View style={container}>
			<NavigationHeaderPoster
				h1={'Premium Access'} h2={'Manage Subscription'}
				align={'right'}
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}
				{...screenProps}/>
			<ScrollView style={{flex: 1}} contentContainerStyle={{ flexGrow: 1 }}>
				<View style={body} >
					<View style={headerCover}>
						<IconTelldus icon={'premium'} style={iconStyle}/>
						<Text style={titleStyleOne}>
							{'Premium'.toUpperCase()}
						</Text>
						<Text style={titleStyleTwo}>
							{' Subscription'.toUpperCase()}
						</Text>
					</View>
					<Text style={contentOne}>
						You have an automatically renewed Premium subscription and {credits} SMS credits.
					</Text>
					<Text style={contentTwo}>
						Your subscription is automatically renewed annually.
					</Text>
				</View>
				<TouchableButton
					onPress={onPress}
					text={'Cancel automatic renewal'}
					accessibilityLabel={'Cancel automatic renewal'}
					accessible={true}
					style={buttonStyle}
				/>
			</ScrollView>
		</View>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * 0.045);

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
			padding: padding * 2,
		},
		headerCover: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		titleStyleOne: {
			fontSize: fontSize * 1.2,
			color: '#000',
			fontWeight: 'bold',
			marginLeft: 5,
		},
		titleStyleTwo: {
			fontSize: fontSize * 1.2,
			color: Theme.Core.eulaContentColor,
		},
		iconStyle: {
			fontSize: fontSize * 1.8,
			color: Theme.Core.twine,
		},
		buttonStyle: {
			marginVertical: fontSize / 2,
			paddingHorizontal: 10,
			width: deviceWidth * 0.7,
			maxWidth: width - (padding * 2),
		},
		contentOne: {
			fontSize: fontSize * 0.8,
			color: '#000',
			fontWeight: 'bold',
			textAlign: 'center',
			marginTop: padding * 2,
		},
		contentTwo: {
			fontSize: fontSize * 0.8,
			color: Theme.Core.eulaContentColor,
			marginTop: padding * 2,
			textAlign: 'center',
		},
	};
};

export default ManageSubscriptionScreen;

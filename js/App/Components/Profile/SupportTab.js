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

import React, { useEffect, useState } from 'react';
import { Linking, TouchableOpacity, LayoutAnimation } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
const forge = require('node-forge');
import * as RNLocalize from 'react-native-localize';
let dayjs = require('dayjs');

import {
	View,
	Text,
	TouchableButton,
	IconTelldus,
	ThemedScrollView,
} from '../../../BaseComponents';
import {
	HelpAndSupportBlock,
	ContactSupportBlock,
} from './SubViews';
import {
	twitterAuth,
} from '../../../Config';
import Theme from '../../Theme';
import LayoutAnimations from '../../Lib/LayoutAnimations';
import {
	getSupportTweets,
} from '../../Actions/App';

import i18n from '../../Translations/common';

const prepareTweetsForList = (data: Array<Object>): Array<Object> => {
	let newData = [];
	data.map((tweet: Object) => {
		const daysDiff = dayjs().diff(new Date(tweet.created_at), 'day');
		if (daysDiff <= 2) {
			newData.push({
				created_at: new Date(tweet.created_at),
				text: tweet.text,
				link: `https://twitter.com/telldus_status/status/${tweet.id_str}`,
			});
		}
	});
	return newData;
};

const SupportTab: Object = React.memo<Object>((props: Object): Object => {
	const { navigation } = props;
	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		formatDate,
		formatTime,
		formatMessage,
	} = useIntl();
	const hour12 = !RNLocalize.uses24HourClock();

	const {
		container,
		body,
		buttonStyle,
		tweetCoverStyle,
		tweetTextCover,
		statusIconStyle,
		tweetDateStyle,
		tweetTextStyle,
		padding,
	} = getStyles(layout);

	const [listInfo, setListInfo] = useState({
		isLoading: true,
		listData: [],
	});
	const {
		listData,
	} = listInfo;

	const dispatch = useDispatch();
	useEffect(() => {
		setListInfo({
			listData,
			isLoading: true,
		});
		const { consumer_key, consumer_secret } = twitterAuth; // TODO: RFC 1738 encode both key and secret(right now with/without it is same)
		const keySecret = forge.util.encode64(`${consumer_key}:${consumer_secret}`);
		dispatch(getSupportTweets(keySecret, 10)).then((response: Object) => {
			LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
			setListInfo({
				listData: prepareTweetsForList(response),
				isLoading: false,
			});
		}).catch(() => {
			setListInfo({
				listData,
				isLoading: false,
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function onPress() {
		navigation.navigate('RequestSupportScreen');
	}

	function openLink(url: string) {
		Linking.canOpenURL(url).then((supported: boolean): any => {
			if (!supported) {
			  console.log(`Can't handle url: ${url}`);
			} else {
			  return Linking.openURL(url);
			}
		  }).catch((err: Object) => {
			  console.error('An error occurred', err);
		  });
	}

	const tweets = listData.map((item: Object, i: number): Object => {
		const { created_at, text, link } = item;

		function onPressTweet() {
			openLink(link);
		}

		return (
			<TouchableOpacity onPress={onPressTweet} key={`${i}`}>
				<View
					level={2}
					style={[tweetCoverStyle, {
						marginTop: i === 0 ? padding : padding / 2,
					}]}>
					<IconTelldus icon={text.includes('#ok') ? 'checkmark' : 'info'} style={[
						statusIconStyle, {
							color: text.includes('#ok') ? Theme.Core.brandSuccess : Theme.Core.brandDanger,
						}]}/>
					<View style={tweetTextCover}>
						<Text>
							<Text
								level={42}
								style={tweetDateStyle}>
								{formatDate(created_at)}
							</Text>
							<Text style={Theme.Styles.hiddenText}>
								{'.'}
							</Text>
							<Text
								level={42}
								style={tweetDateStyle}>
								{formatTime(created_at, {
									hour12,
								})}
							</Text>
						</Text>
						<Text
							level={4}
							style={tweetTextStyle}>
							{text}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	});

	return (
		<ThemedScrollView
			level={3}
			style={container}>
			<View
				level={3}
				style={body}>
				{
					tweets
				}
				<HelpAndSupportBlock/>
				<ContactSupportBlock/>
				<TouchableButton
					onPress={onPress}
					text={i18n.labelContactSupport}
					accessibilityLabel={formatMessage(i18n.labelContactSupport)}
					accessible={true}
					style={buttonStyle}
				/>
			</View>
		</ThemedScrollView>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		padding,
		container: {
			flex: 1,
		},
		body: {
			flex: 1,
			padding,
		},
		buttonStyle: {
			marginTop: padding * 2,
			marginBottom: padding,
			paddingHorizontal: 10,
			width: deviceWidth * 0.7,
			maxWidth: width - (padding * 2),
		},
		tweetCoverStyle: {
			flexDirection: 'row',
			...Theme.Core.shadow,
			padding: padding * 2,
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		statusIconStyle: {
			fontSize: fontSize * 3,
			justifyContent: 'center',
			alignItems: 'center',
			marginRight: padding * 2,
		},
		tweetTextStyle: {
			fontSize: fontSize * 0.8,
		},
		tweetTextCover: {
			flex: 1,
		},
		tweetDateStyle: {
			fontSize: fontSize * 0.9,
		},
	};
};

export default (SupportTab: Object);

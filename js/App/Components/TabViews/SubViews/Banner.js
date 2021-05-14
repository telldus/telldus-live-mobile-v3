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
} from 'react';
import {
	useSelector,
} from 'react-redux';
import {
	Linking,
	Platform,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	View,
	Text,
	RippleButton,
	Image,
	IconTelldus,
	EmptyView,
} from '../../../../BaseComponents';

import {
	getDrawerWidth,
} from '../../../Lib';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

const Banner = memo<Object>((props: Object): Object => {

	const isAndroid = Platform.OS === 'android';

	const intl = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);
	const { firebaseRemoteConfig = {} } = useSelector((state: Object): Object => state.user);

	const {
		appDrawerBanner = JSON.stringify({}),
	} = firebaseRemoteConfig;
	const _appDrawerBanner = appDrawerBanner === '' ? {} : JSON.parse(appDrawerBanner);
	const {
		image,
		link,
	} = _appDrawerBanner || {};

	const {
		bannerCoverStyle,
		bannerHeaderStyle,
		bannerTextStyle,
		bannerIconStyle,
		bannerTouchableStyle,
		bannerImageWidth: bImageWidth,
		bannerImageStyle,
	} = getStyles({
		layout,
		isAndroid,
	});

	const [
		imageDim,
		setImageDim,
	] = useState({
		bannerImageWidth: 0,
		bannerImageHeight: 0,
	});
	const {
		bannerImageWidth,
		bannerImageHeight,
	} = imageDim;

	useEffect(() => {
		if (!image) {
			return;
		}

		let _bannerImageWidth = bImageWidth;
		let _bannerImageHeight = bImageWidth * 0.3;
		Image.getSize(image, (w: number, h: number) => {
			if (w && h) {
				const ratio = w / h;
				_bannerImageHeight = _bannerImageWidth / ratio;
			}
			setImageDim({
				bannerImageWidth: _bannerImageWidth,
				bannerImageHeight: _bannerImageHeight,
			});
		}, () => {
			setImageDim({
				bannerImageWidth: _bannerImageWidth,
				bannerImageHeight: _bannerImageHeight,
			});
		});
	}, [bImageWidth, image]);

	const onPress = useCallback(() => {
		if (!link) {
			return;
		}
		Linking.canOpenURL(link)
			.then((supported: boolean): any => {
				if (!supported) {
					console.error('Error open link', link);
				} else {
					return Linking.openURL(link);
				}
			})
			.catch((err: any) => {
				console.error(err);
			});
	}, [link]);

	if (!image) {
		return <EmptyView/>;
	}

	if (!bannerImageWidth || !bannerImageHeight) {
		return <EmptyView/>;
	}

	return (
		<View
			level={2}
			style={bannerCoverStyle}>
			<View
				level={13}
				style={bannerHeaderStyle}>
				{!isAndroid && <IconTelldus
					style={bannerIconStyle}
					icon={'gift'}/>
				}
				<Text
					style={bannerTextStyle}>
					{intl.formatMessage(i18n.selectedOfferForU)}
				</Text>
			</View>
			<RippleButton
				style={bannerTouchableStyle}
				onPress={onPress}>
				<Image
					style={[bannerImageStyle, {
						width: bannerImageWidth,
						height: bannerImageHeight,
					}]}
					source={{uri: image}}
					resizeMode={'contain'}/>
			</RippleButton>
		</View>
	);
});

const getStyles = ({
	layout,
	isAndroid,
}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		shadow,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = Math.floor(deviceWidth * fontSizeFactorEight);

	const drawerWidth = getDrawerWidth(deviceWidth);

	return {
		bannerImageWidth: isAndroid ? drawerWidth : (width - (padding * 2)),
		bannerCoverStyle: {
			borderRadius: 2,
			...shadow,
			marginHorizontal: isAndroid ? 0 : padding,
			marginTop: padding / 2,
			marginBottom: padding,
		},
		bannerHeaderStyle: {
			flexDirection: 'row',
			padding,
			alignItems: 'center',
			borderTopLeftRadius: 2,
			borderTopRightRadius: 2,
		},
		bannerTextStyle: {
			fontSize: fontSizeText,
			color: '#fff',
			marginLeft: 15,
		},
		bannerIconStyle: {
			fontSize: fontSizeText * 1.2,
			textAlign: 'left',
			color: '#fff',
		},
		bannerTouchableStyle: {
			flex: 0,
			borderBottomLeftRadius: 2,
			borderBottomRightRadius: 2,
		},
		bannerImageStyle: {
			borderBottomLeftRadius: 2,
			borderBottomRightRadius: 2,
		},
	};
};

export default (Banner: Object);

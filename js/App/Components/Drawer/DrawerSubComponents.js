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
const gravatar = require('gravatar-api');
import {
	Linking,
	Image,
} from 'react-native';

import {
	FormattedMessage,
	Text,
	View,
	CachedImage,
	IconTelldus,
	RippleButton,
	EmptyView,
} from '../../../BaseComponents';

import i18n from '../../Translations/common';

const NavigationHeader = ({ firstName, lastName, email, styles, onPress, textSwitchAccount }: Object): Object => {

	let options = {
		email,
		parameters: { 'size': '200', 'd': 'mm' },
		secure: true,
	};
	let avatar = gravatar.imageUrl(options);

	return (
		<RippleButton
			level={16}
			style={styles.navigationHeader}
			onPress={onPress}>
			<View style={{
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
			}}>
				<CachedImage
					resizeMode={'cover'}
					useQueryParamsInCacheKey={true}
					sourceImg={avatar}
					style={styles.navigationHeaderImage}/>
				<View>
					<View style={styles.navigationHeaderTextCover}>
						<Text
							numberOfLines={1}
							level={23}
							style={styles.navigationHeaderText}>
							{firstName}
						</Text>
						{lastName ?
							<Text
								numberOfLines={1}
								level={23}
								style={styles.navigationHeaderText}>
								{` ${lastName}`}
							</Text>
							:
							null
						}
					</View>
					<Text
						level={28}
						style={styles.switchOrAdd}>
						{textSwitchAccount}
					</Text>
				</View>
			</View>
		</RippleButton>
	);
};

const DrawerSubHeader = ({styles, textIntl}: Object): Object => (
	<View
		level={13}
		style={styles.navigationTitle}>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...textIntl} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsLink = ({styles, textIntl, text, iconName, iconComponent, onPressLink}: Object): Object => (
	<RippleButton style={styles.linkCoverStyle} onPress={onPressLink}>
		{!!iconName && <IconTelldus
			level={23}
			style={styles.linkIconStyle}
			icon={iconName}/>}
		{!!iconComponent && iconComponent}
		<Text level={27} style={styles.linkLabelStyle}>
			{!!text && text}
			{!!textIntl && <FormattedMessage {...textIntl} style={styles.linkLabelStyle}/>}
		</Text>
	</RippleButton>
);

const SettingsButton = ({ onPress, styles }: Object): Object => (
	<RippleButton
		style={styles.settingsCover}
		onPress={onPress}>
		<IconTelldus icon={'settings'} size={styles.settingsIconSize} accessible={false} importantForAccessibility={'no'} level={9} style={styles.settingsIconStyle}/>
		<Text style={styles.settingsText}><FormattedMessage {...i18n.settingsHeader} style={styles.settingsText} /></Text>
	</RippleButton>
);

const TestIapLink = ({styles, appDrawerBanner}: Object): Object => {
	const {
		image,
		link,
	} = appDrawerBanner ? appDrawerBanner : {};

	const onPress = React.useCallback(() => {
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

	if (!link) {
		return <EmptyView/>;
	}

	return (
		<RippleButton
			style={styles.iapTestCoverStyle}
			onPress={onPress}>
			<Image
				style={styles.iapTestImageStyle}
				source={{uri: image}}
				resizeMode={'contain'}/>
		</RippleButton>
	);
};

module.exports = {
	SettingsButton,
	DrawerSubHeader,
	NavigationHeader,
	SettingsLink,
	TestIapLink,
};

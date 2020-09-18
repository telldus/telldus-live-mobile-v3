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
	FormattedMessage,
	Text,
	View,
	CachedImage,
	IconTelldus,
	RippleButton,
} from '../../../BaseComponents';

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

module.exports = {
	DrawerSubHeader,
	NavigationHeader,
	SettingsLink,
};

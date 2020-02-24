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
	Icon,
	CachedImage,
	IconTelldus,
	RippleButton,
} from '../../../BaseComponents';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

const AddLocation = ({onPress, styles}: Object): Object => {
	return (
		<RippleButton
			style={styles.addNewLocationContainer}
			onPress={onPress}>
			<Icon name="plus-circle" size={styles.iconAddLocSize} color="#e26901"/>
			<FormattedMessage {...i18n.addNewLocation} style={styles.addNewLocationText}/>
		</RippleButton>
	);
};

const NavigationHeader = ({ firstName, lastName, email, styles }: Object): Object => {

	let options = {
		email,
		parameters: { 'size': '200', 'd': 'mm' },
		secure: true,
	};
	let avatar = gravatar.imageUrl(options);

	return (
		<View style={styles.navigationHeader}>
			<View style={{
				flex: 0,
				flexDirection: 'row',
				alignItems: 'center',
			}}>
				<CachedImage
					resizeMode={'cover'}
					useQueryParamsInCacheKey={true}
					sourceImg={avatar}
					style={styles.navigationHeaderImage}/>
				<View style={styles.navigationHeaderTextCover}>
					<Text numberOfLines={1} style={styles.navigationHeaderText}>
						{firstName}
					</Text>
					{lastName ?
						<Text numberOfLines={1} style={styles.navigationHeaderText}>
							{` ${lastName}`}
						</Text>
						:
						null
					}
				</View>
			</View>
		</View>
	);
};

const ConnectedLocations = ({styles}: Object): Object => (
	<View style={styles.navigationTitle}>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = ({ onPress, styles }: Object): Object => (
	<RippleButton
		style={styles.settingsCover}
		onPress={onPress}>
		<IconTelldus icon={'settings'} size={styles.settingsIconSize} accessible={false} importantForAccessibility={'no'} color={Theme.Core.brandPrimary} style={styles.settingsIconStyle}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</RippleButton>
);

module.exports = {
	SettingsButton,
	ConnectedLocations,
	NavigationHeader,
	AddLocation,
};

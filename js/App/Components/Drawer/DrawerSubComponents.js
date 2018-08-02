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
import Ripple from 'react-native-material-ripple';
import { defineMessages } from 'react-intl';

import { FormattedMessage, Text, View, Icon, Image, IconTelldus } from '../../../BaseComponents';
import Theme from '../../Theme';

import i18n from '../../Translations/common';
const messages = defineMessages({
	connectedLocations: {
		id: 'settings.connectedLocations',
		defaultMessage: 'Connected Locations',
	},
	addNewLocation: {
		id: 'settings.addNewLocation',
		defaultMessage: 'Add New Location',
	},
});

const AddLocation = ({onPress, styles}: Object): Object => {
	return (
		<Ripple
			rippleColor={Theme.Core.rippleColor}
			rippleOpacity={Theme.Core.rippleOpacity}
			rippleDuration={Theme.Core.rippleDuration}
			style={styles.addNewLocationContainer}
			onPress={onPress}>
			<Icon name="plus-circle" size={styles.iconAddLocSize} color="#e26901"/>
			<FormattedMessage {...messages.addNewLocation} style={styles.addNewLocationText}/>
		</Ripple>
	);
};

const NavigationHeader = ({ firstName, lastName, styles }: Object): Object => {
	return (
		<View style={styles.navigationHeader}>
			<Image style={styles.navigationHeaderImage}
		       source={require('../TabViews/img/telldus.png')}
		       resizeMode={'contain'}/>
			<View style={styles.navigationHeaderTextCover}>
				<Text numberOfLines={1} style={styles.navigationHeaderText}>
					{firstName}
				</Text>
				{lastName ?
					<Text numberOfLines={1} style={styles.navigationHeaderText}>
						{lastName}
					</Text>
					:
					null
				}
			</View>
		</View>
	);
};

const ConnectedLocations = ({styles}: Object): Object => (
	<View style={styles.navigationTitle}>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...messages.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = ({ onPress, styles }: Object): Object => (
	<Ripple
		rippleColor={Theme.Core.rippleColor}
		rippleOpacity={Theme.Core.rippleOpacity}
		rippleDuration={Theme.Core.rippleDuration}
		style={styles.settingsCover}
		onPress={onPress}>
		<IconTelldus icon={'settings'} size={styles.settingsIconSize} color={Theme.Core.brandPrimary} style={styles.settingsIconStyle}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</Ripple>
);

module.exports = {
	SettingsButton,
	ConnectedLocations,
	NavigationHeader,
	AddLocation,
};

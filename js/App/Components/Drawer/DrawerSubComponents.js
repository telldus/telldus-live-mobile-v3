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
import {
	Linking,
} from 'react-native';

import {
	FormattedMessage,
	Text,
	View,
	Icon,
	Image,
	IconTelldus,
	RippleButton,
	EmptyView,
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

const NavigationHeader = ({ firstName, lastName, styles }: Object): Object => {
	return (
		<View style={styles.navigationHeader}>
			<Image style={styles.navigationHeaderImage}
		       source={{uri: 'telldus'}}
		       resizeMode={'contain'}/>
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
	ConnectedLocations,
	NavigationHeader,
	AddLocation,
	TestIapLink,
};

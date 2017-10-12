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
 * @providesModule Drawer
 */

// @flow

'use strict';

import React from 'react';
import {TouchableOpacity} from 'react-native';
import { defineMessages } from 'react-intl';
import i18n from '../../Translations/common';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import {View, Text, Image, StyleSheet, FormattedMessage} from 'BaseComponents';

const messages = defineMessages({
	connectedLocations: {
		id: 'settings.connectedLocations',
		defaultMessage: 'Connected Locations',
	},
});

const Gateway = (props: Object): React$Element<any> => {
	let locationSrc;
	if (!props.online) {
		locationSrc = require('../TabViews/img/tabIcons/location-red.png');
	} else if (!props.websocketOnline) {
		locationSrc = require('../TabViews/img/tabIcons/location-orange.png');
	} else {
		locationSrc = require('../TabViews/img/tabIcons/location-green.png');
	}
	return (
		<View style={styles.gatewayContainer}>
			<Image style={styles.gatewayIcon} source={locationSrc}/>
			<Text style={styles.gateway} ellipsizeMode="middle" numberOfLines={1}>{props.name}</Text>
		</View>
	);
};

const NavigationHeader = (props: Object): React$Element<any> => (
	<View style={styles.navigationHeader}>
		<Image style={styles.navigationHeaderImage}
		       source={require('../TabViews/img/telldus.png')}
		       resizeMode={'contain'}/>
		<View style={styles.navigationHeaderTextCover}>
			<Text numberOfLines={1} style={styles.navigationHeaderText}>
				{props.firstName}
			</Text>
			{props.lastName ?
				<Text numberOfLines={1} style={styles.navigationHeaderText}>
					{props.lastName}
				</Text>
				:
				null
			}
		</View>
	</View>
);

const ConnectedLocations = (): React$Element<any> => (
	<View style={styles.navigationTitle}>
		<Image source={require('../TabViews/img/tabIcons/router.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...messages.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = (Props: Object): React$Element<any> => (
	<TouchableOpacity onPress={Props.onPress} style={styles.navigationTitle}>
		<Image source={require('../TabViews/img/tabIcons/gear.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</TouchableOpacity>
);

const Drawer = (props: Object): React$Element<any> => {
	return (
		<View style={{
			flex: 1,
			backgroundColor: 'rgba(26,53,92,255)',
			marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		}}>
			<NavigationHeader firstName={props.userProfile.firstname} lastName={props.userProfile.lastname}/>
			<View style={{
				flex: 1,
				backgroundColor: 'white',
			}}>
				<ConnectedLocations />
				{props.gateways.allIds.map((id: number, index: number): React$Element<any> => {
					return (<Gateway {...props.gateways.byId[id]} key={index}/>);
				})}
				<SettingsButton onPress={props.openSetting}/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	navigationHeader: {
		height: 60,
		marginTop: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		marginBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	navigationHeaderImage: {
		width: 55,
		height: 57,
		padding: 5,
	},
	navigationHeaderText: {
		color: '#e26901',
		fontSize: 22,
		marginLeft: 10,
		marginTop: 4,
		zIndex: 3,
		alignItems: 'flex-end',
	},
	navigationHeaderTextCover: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		height: 64,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
	},
	navigationTitle: {
		flexDirection: 'row',
		height: 30,
		marginLeft: 10,
		marginTop: 20,
		marginBottom: 10,
	},
	navigationTextTitle: {
		color: 'rgba(26,53,92,255)',
		fontSize: 18,
		marginLeft: 10,
	},
	navigationTitleImage: {
		width: 28,
		height: 28,
	},
	settingsButton: {
		padding: 6,
		minWidth: 100,
	},
	settingsText: {
		color: 'white',
		fontSize: 18,
	},
	gatewayContainer: {
		marginLeft: 10,
		height: 20,
		flexDirection: 'row',
		marginTop: 10,
		marginBottom: 10,
	},
	gateway: {
		fontSize: 14,
		color: 'rgba(110,110,110,255)',
		marginLeft: 10,
		maxWidth: 220,
	},
	gatewayIcon: {
		width: 20,
		height: 20,
	},
});

export default Drawer;

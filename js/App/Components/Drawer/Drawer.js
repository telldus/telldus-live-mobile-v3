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
import { TouchableOpacity, ScrollView } from 'react-native';
import { defineMessages } from 'react-intl';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import { FormattedMessage, Text, View, Icon, Image } from '../../../BaseComponents';
import Gateway from './Gateway';
import i18n from '../../Translations/common';
import { hasStatusBar } from '../../Lib';

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

const AddLocation = ({onPress, styles}) => {
	return (
		<View style={styles.addNewLocationContainer}>
			<TouchableOpacity onPress={onPress} style={styles.addNewLocationCover}>
				<Icon name="plus-circle" size={20} color="#e26901"/>
				<FormattedMessage {...messages.addNewLocation} style={styles.addNewLocationText}/>
			</TouchableOpacity>
		</View>
	);
};

const NavigationHeader = ({ firstName, lastName, styles }) => {
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

const ConnectedLocations = ({styles}) => (
	<View style={styles.navigationTitle}>
		<Image source={require('../TabViews/img/tabIcons/router.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...messages.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = ({ onPress, styles }) => (
	<TouchableOpacity onPress={onPress} style={styles.navigationTitle}>
		<Image source={require('../TabViews/img/tabIcons/gear.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</TouchableOpacity>
);

type Props = {
	gateways: Object,
	userProfile: Function,
	onOpenSetting: Function,
	addNewLocation: Function,
	appLayout: Object,
	onPressGateway: () => void,
};

export default class Drawer extends View<Props, null> {
	props: Props;
	render(): Object {
		let { gateways, userProfile, onOpenSetting, addNewLocation, appLayout, onPressGateway } = this.props;
		let styles = this.getStyles(appLayout);

		return (
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{flexGrow: 1}}>
				<NavigationHeader firstName={userProfile.firstname} appLayout={appLayout} lastName={userProfile.lastname} styles={styles}/>
				<View style={{
					flex: 1,
					backgroundColor: 'white',
				}}>
					<ConnectedLocations styles={styles}/>
					{gateways.allIds.map((id, index) => {
						return (<Gateway gateway={gateways.byId[id]} key={index} styles={styles} onPressGateway={onPressGateway}/>);
					})}
					<AddLocation onPress={addNewLocation} styles={styles}/>
					<SettingsButton onPress={onOpenSetting} styles={styles}/>
				</View>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;
		let deviceHeight = isPortrait ? height : width;

		return {
			navigationHeader: {
				height: deviceHeight * 0.197,
				width: isPortrait ? width * 0.6 : height * 0.6,
				minWidth: 250,
				backgroundColor: 'rgba(26,53,92,255)',
				marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
				paddingBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'flex-end',
				paddingLeft: 10,
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
			addNewLocationCover: {
				flexDirection: 'row',
			},
			addNewLocationContainer: {
				borderBottomWidth: 1,
				borderBottomColor: '#eeeeef',
				marginLeft: 10,
				marginRight: 10,
				marginTop: 10,
				height: 40,
				justifyContent: 'flex-start',
			},
			addNewLocationText: {
				fontSize: 14,
				color: '#e26901',
				marginLeft: 10,
			},
		};
	}
}

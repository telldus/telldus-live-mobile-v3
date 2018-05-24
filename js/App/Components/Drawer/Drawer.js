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

import { FormattedMessage, Text, View, Icon, Image, IconTelldus } from '../../../BaseComponents';
import Gateway from './Gateway';
import i18n from '../../Translations/common';
import { hasStatusBar, getDrawerWidth } from '../../Lib';
import Theme from '../../Theme';

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
		<View style={styles.addNewLocationContainer}>
			<TouchableOpacity onPress={onPress} style={styles.addNewLocationCover}>
				<Icon name="plus-circle" size={styles.iconAddLocSize} color="#e26901"/>
				<FormattedMessage {...messages.addNewLocation} style={styles.addNewLocationText}/>
			</TouchableOpacity>
		</View>
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
	<TouchableOpacity onPress={onPress} style={[styles.navigationTitle, {marginLeft: 12}]}>
		<IconTelldus icon={'settings'} size={styles.settingsIconSize} color={Theme.Core.brandPrimary} style={styles.settingsIconStyle}/>
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
					{gateways.allIds.map((id: number, index: number): Object => {
						return (<Gateway gateway={gateways.byId[id]} key={index} appLayout={appLayout} onPressGateway={onPressGateway}/>);
					})}
					<AddLocation onPress={addNewLocation} styles={styles}/>
					<SettingsButton onPress={onOpenSetting} styles={styles}/>
				</View>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const deviceWidth = isPortrait ? width : height;
		const drawerWidth = getDrawerWidth(deviceWidth);

		const fontSizeHeader = Math.floor(drawerWidth * 0.072);
		const fontSizeRow = Math.floor(drawerWidth * 0.062);
		const fontSizeAddLocText = Math.floor(drawerWidth * 0.049);

		const ImageWidth = Math.floor(drawerWidth * 0.18);
		const ImageHeight = Math.floor(drawerWidth * 0.186);

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
				width: ImageWidth,
				height: ImageHeight,
				padding: 5,
			},
			navigationHeaderText: {
				color: '#e26901',
				fontSize: fontSizeHeader,
				marginLeft: 10,
				zIndex: 3,
				textAlignVertical: 'bottom',
			},
			navigationHeaderTextCover: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
				justifyContent: 'flex-start',
				alignItems: 'flex-end',
			},
			navigationTitle: {
				flexDirection: 'row',
				marginVertical: 5 + (fontSizeRow * 0.5),
				marginLeft: 10,
				alignItems: 'center',
			},
			iconAddLocSize: fontSizeAddLocText * 1.2,
			settingsIconSize: fontSizeRow * 1.6,
			navigationTextTitle: {
				color: 'rgba(26,53,92,255)',
				fontSize: fontSizeRow,
				marginLeft: 10,
			},
			settingsButton: {
				padding: 6,
				minWidth: 100,
			},
			settingsText: {
				color: 'white',
				fontSize: fontSizeRow,
			},
			addNewLocationCover: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			addNewLocationContainer: {
				borderBottomWidth: 1,
				borderBottomColor: '#eeeeef',
				marginLeft: 16,
				marginRight: 10,
				marginVertical: 5 + (fontSizeAddLocText * 0.5),
				justifyContent: 'flex-start',
			},
			addNewLocationText: {
				fontSize: fontSizeAddLocText,
				color: '#e26901',
				marginLeft: 10,
			},
		};
	}
}

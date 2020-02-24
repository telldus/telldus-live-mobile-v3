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
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import { View } from '../../../BaseComponents';
import Gateway from './Gateway';
import {
	SettingsButton,
	ConnectedLocations,
	NavigationHeader,
	AddLocation,
} from './DrawerSubComponents';

import { getUserProfile as getUserProfileSelector } from '../../Reducers/User';
import { hasStatusBar, getDrawerWidth, shouldUpdate } from '../../Lib';

import Theme from '../../Theme';

type Props = {
	gateways: Object,
	appLayout: Object,
	isOpen: boolean,

	userProfile: Function,
	onOpenSetting: Function,
	addNewLocation: Function,
	onPressGateway: () => void,
	dispatch: Function,
};

class Drawer extends View<Props, null> {
	props: Props;

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, [
			'gateways',
			'userProfile',
			'isOpen',
			'appLayout',
		]);
	}

	render(): Object {
		const {
			gateways,
			userProfile,
			onOpenSetting,
			addNewLocation,
			appLayout,
			onPressGateway,
			dispatch,
		} = this.props;
		const styles = this.getStyles(appLayout);

		return (
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{flexGrow: 1}}>
				<NavigationHeader
					firstName={userProfile.firstname}
					email={userProfile.email}
					appLayout={appLayout}
					lastName={userProfile.lastname}
					styles={styles}/>
				<View style={{
					flex: 1,
					backgroundColor: 'white',
				}}>
					<ConnectedLocations styles={styles}/>
					{gateways.allIds.map((id: number, index: number): Object => {
						return (<Gateway
							gateway={gateways.byId[id]}
							key={index} appLayout={appLayout}
							onPressGateway={onPressGateway}
							dispatch={dispatch}/>);
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

		const {
			paddingFactor,
		} = Theme.Core;

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * paddingFactor;

		const drawerWidth = getDrawerWidth(deviceWidth);

		const fontSizeHeader = Math.floor(drawerWidth * 0.072);
		const fontSizeHeaderTwo = Math.floor(drawerWidth * 0.045);
		const fontSizeRow = Math.floor(drawerWidth * 0.062);
		const fontSizeAddLocText = Math.floor(drawerWidth * 0.049);

		const ImageSize = Math.floor(drawerWidth * 0.18);

		return {
			navigationHeader: {
				paddingVertical: padding * 2,
				width: drawerWidth,
				minWidth: 250,
				backgroundColor: 'rgba(26,53,92,255)',
				marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
				paddingBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: 15,
			},
			navigationHeaderImage: {
				width: ImageSize,
				height: ImageSize,
				borderRadius: ImageSize / 2,
			},
			navigationHeaderText: {
				color: '#e26901',
				fontSize: fontSizeHeader,
				zIndex: 3,
				textAlignVertical: 'center',
			},
			navigationHeaderTextCover: {
				flexDirection: 'row',
				flexWrap: 'wrap',
				justifyContent: 'flex-start',
				alignItems: 'flex-end',
				paddingLeft: 10,
			},
			navigationTitle: {
				flexDirection: 'row',
				marginVertical: 5 + (fontSizeRow * 0.5),
				marginLeft: 10,
				alignItems: 'center',
			},
			switchOrAdd: {
				color: '#fff',
				fontSize: fontSizeHeaderTwo,
				zIndex: 3,
				textAlignVertical: 'center',
				marginLeft: 10,
			},
			settingsCover: {
				flexDirection: 'row',
				paddingVertical: 5 + (fontSizeRow * 0.5),
				marginLeft: 12,
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
			addNewLocationContainer: {
				flexDirection: 'row',
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

function mapStateToProps(store: Object): Object {

	return {
		gateways: store.gateways,
		userProfile: getUserProfileSelector(store),
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

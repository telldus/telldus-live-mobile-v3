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
import { ScrollView, Image } from 'react-native';
import { connect } from 'react-redux';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { createSelector } from 'reselect';
const isEqual = require('react-fast-compare');

import { View } from '../../../BaseComponents';
import Gateway from './Gateway';
import {
	SettingsButton,
	ConnectedLocations,
	NavigationHeader,
	AddLocation,
	TestIapLink,
} from './DrawerSubComponents';

import { parseGatewaysForListView } from '../../Reducers/Gateways';
import { getUserProfile as getUserProfileSelector } from '../../Reducers/User';
import { hasStatusBar, getDrawerWidth, shouldUpdate } from '../../Lib';

type Props = {
gateways: Array<Object>,
appLayout: Object,
isOpen: boolean,
appDrawerBanner?: Object,

userProfile: Function,
onOpenSetting: Function,
addNewLocation: Function,
onPressGateway: () => void,
dispatch: Function,
};

type State = {
	hasStatusBar: boolean,
	iapTestImageWidth: number,
	iapTestImageheight: number,
};

class Drawer extends View<Props, State> {
props: Props;
state: State;

_hasStatusBar: () => void;

constructor(props: Props) {
	super(props);
	this.state = {
		hasStatusBar: false,
		iapTestImageWidth: 0,
		iapTestImageheight: 0,
	};

	this._hasStatusBar();
	this.setBannerImageDimensions();
}

_hasStatusBar = async () => {
	const _hasStatusBar = await hasStatusBar();
	this.setState({
		hasStatusBar: _hasStatusBar,
	});
}

setBannerImageDimensions = () => {
	const {
		appLayout,
	} = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const drawerWidth = getDrawerWidth(deviceWidth);

	let iapTestImageWidth = drawerWidth - 25;
	let iapTestImageheight = iapTestImageWidth * 0.3;
	const {
		appDrawerBanner,
	} = this.props;
	const {
		image,
	} = appDrawerBanner ? appDrawerBanner : {};
	if (image) {
		Image.getSize(image, (w: number, h: number) => {
			if (w && h) {
				const ratio = w / h;
				iapTestImageheight = iapTestImageWidth / ratio;
			}
			this.setState({
				iapTestImageWidth,
				iapTestImageheight,
			});
		}, () => {
			this.setState({
				iapTestImageWidth,
				iapTestImageheight,
			});
		});
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.state, nextState) || shouldUpdate(this.props, nextProps, [
		'gateways',
		'userProfile',
		'appDrawerBanner',
		'appLayout']);
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
		appDrawerBanner,
	} = this.props;
	const styles = this.getStyles(appLayout);

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
				{gateways.map((gateway: number, index: number): Object => {
					return (<Gateway
						gateway={gateway}
						key={index}
						appLayout={appLayout}
						onPressGateway={onPressGateway}
						dispatch={dispatch}/>);
				})}
				<AddLocation onPress={addNewLocation} styles={styles}/>
				<SettingsButton onPress={onOpenSetting} styles={styles}/>
				<TestIapLink
					appDrawerBanner={appDrawerBanner}
					styles={styles}/>
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
			width: drawerWidth,
			minWidth: 250,
			backgroundColor: 'rgba(26,53,92,255)',
			marginTop: this.state.hasStatusBar ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
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
			zIndex: 3,
			textAlignVertical: 'bottom',
		},
		navigationHeaderTextCover: {
			flex: 1,
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
		settingsCover: {
			flexDirection: 'row',
			paddingVertical: 5 + (fontSizeRow * 0.5),
			marginLeft: 15,
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
		iapTestCoverStyle: {
			flexDirection: 'row',
			marginBottom: 5 + (fontSizeRow * 0.5),
			marginLeft: 15,
			alignItems: 'center',
		},
		iapTestImageStyle: {
			width: this.state.iapTestImageWidth,
			height: this.state.iapTestImageheight,
		},
	};
}
}

const getRows = createSelector(
	[
		({ gateways }: Object): Object => gateways,
	],
	(gateways: Object): Array<any> => parseGatewaysForListView(gateways)
);

function mapStateToProps(store: Object): Object {
	const {
		appDrawerBanner,
	} = store.user;

	return {
		gateways: getRows(store),
		userProfile: getUserProfileSelector(store),
		appDrawerBanner,
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	RippleButton,
	Text,
} from '../../../BaseComponents';
import Gateway from './Gateway';
import {
	SettingsButton,
	DrawerSubHeader,
	NavigationHeader,
	AddLocation,
	SettingsLink,
} from './DrawerSubComponents';

import { getUserProfile as getUserProfileSelector } from '../../Reducers/User';
import {
	hasStatusBar,
	getDrawerWidth,
	shouldUpdate,
	navigate,
	getPremiumAccounts,
} from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	gateways: Object,
	appLayout: Object,
	isOpen: boolean,
	hasAPremAccount: boolean,
	enableGeoFenceFeature: boolean,

	userProfile: Function,
	onOpenSetting: Function,
	addNewLocation: Function,
	onPressGateway: () => void,
	dispatch: Function,
	closeDrawer: Function,
	showSwitchAccountActionSheet: () => void,
	intl: Object,
	toggleDialogueBox: (Object) => void,
};

type State = {
	hasStatusBar: boolean,
};

class Drawer extends View<Props, State> {
props: Props;
state: State;

_hasStatusBar: () => void;

constructor(props: Props) {
	super(props);

	this.state = {
		hasStatusBar: false,
	};

	const {
		onOpenSetting,
	} = props;

	this.SETTINGS = [
		{
			icon: 'phone',
			text: i18n.appSettigs,
			onPressLink: () => {
				onOpenSetting('AppTab');
			},
		},
		{
			icon: 'user',
			text: i18n.userProfile,
			onPressLink: () => {
				onOpenSetting('ProfileTab');
			},
		},
		{
			icon: 'faq',
			text: i18n.labelHelpAndSupport,
			onPressLink: () => {
				onOpenSetting('SupportTab');
			},
		},
	];

	this._hasStatusBar();
}

	_hasStatusBar = async () => {
		const _hasStatusBar = await hasStatusBar();
		this.setState({
			hasStatusBar: _hasStatusBar,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, [
			'gateways',
			'userProfile',
			'isOpen',
			'appLayout',
			'hasAPremAccount',
			'enableGeoFenceFeature',
		]);
	}

	onPressGeoFence = () => {
		const {
			closeDrawer,
		} = this.props;

		closeDrawer();
		navigate('GeoFenceNavigator', {}, 'GeoFenceNavigator');
	}

	showPurchacePremiumDialogue = () => {
		const {
			toggleDialogueBox,
			intl,
		} = this.props;

		const {
			formatMessage,
		} = intl;

		toggleDialogueBox({
			show: true,
			showHeader: true,
			imageHeader: true,
			header: formatMessage(i18n.upgradeToPremium),
			text: 'This is a premium feature. Please buy any of our premium package to enjoy this feature.',
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.upgrade).toUpperCase(),
			onPressPositive: () => {
				navigate('PremiumUpgradeScreen', {}, 'PremiumUpgradeScreen');
			},
			closeOnPressPositive: true,
			timeoutToCallPositive: 200,
		});
	}

	_showSwitchAccountActionSheet = () => {
		const {
			showSwitchAccountActionSheet,
			hasAPremAccount,
		} = this.props;

		if (hasAPremAccount) {
			showSwitchAccountActionSheet();
		} else {
			this.showPurchacePremiumDialogue();
		}
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
			enableGeoFenceFeature,
		} = this.props;
		const {
			drawerSubHeader,
			...styles
		 } = this.getStyles(appLayout);

		const settingLinks = this.SETTINGS.map((s: Object, index: number): Object => {
			return <SettingsLink
				key={index}
				styles={styles}
				textIntl={s.text}
				iconName={s.icon}
				onPressLink={s.onPressLink}/>;
		});

		return (
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{flexGrow: 1}}>
				<NavigationHeader
					firstName={userProfile.firstname}
					email={userProfile.email}
					appLayout={appLayout}
					lastName={userProfile.lastname}
					styles={styles}
					onPress={this._showSwitchAccountActionSheet}/>
				<View style={{
					flex: 1,
					backgroundColor: 'white',
				}}>
					<View style={styles.settingsLinkCover}>
						<DrawerSubHeader
							textIntl={i18n.settingsHeader}
							styles={drawerSubHeader}/>
						{settingLinks}
					</View>
					{enableGeoFenceFeature && (
						<View style={styles.settingsLinkCover}>
							<DrawerSubHeader
								textIntl={'GeoFence'}
								styles={drawerSubHeader}/>
							<RippleButton style={styles.linkCoverStyle} onPress={this.onPressGeoFence}>
								<MaterialIcons style={styles.linkIconStyle} name={'location-on'}/>
								<Text style={styles.linkLabelStyle}>
			GeoFence Settings
								</Text>
							</RippleButton>
						</View>
					)}
					<DrawerSubHeader
						textIntl={i18n.locationsLayoutTitle}
						styles={{
							...drawerSubHeader,
							navigationTitle: {
								...drawerSubHeader.navigationTitle,
								marginBottom: 0,
							},
						}}/>
					{gateways.allIds.map((id: number, index: number): Object => {
						return (<Gateway
							gateway={gateways.byId[id]}
							key={index}
							appLayout={appLayout}
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
			brandSecondary,
			eulaContentColor,
			brandPrimary,
		} = Theme.Core;

		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * paddingFactor;

		const drawerWidth = getDrawerWidth(deviceWidth);

		const fontSizeHeader = Math.floor(drawerWidth * 0.072);
		const fontSizeHeaderTwo = Math.floor(drawerWidth * 0.045);
		const fontSizeRow = Math.floor(drawerWidth * 0.062);
		const fontSizeAddLocText = Math.floor(drawerWidth * 0.049);

		const fontSizeSettingsIcon = Math.floor(drawerWidth * 0.07);

		const ImageSize = Math.floor(drawerWidth * 0.18);

		return {
			navigationHeader: {
				paddingVertical: padding * 2,
				width: drawerWidth,
				minWidth: 250,
				backgroundColor: brandPrimary,
				marginTop: this.state.hasStatusBar ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
				paddingBottom: this.state.hasStatusBar ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
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
				color: brandSecondary,
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
			drawerSubHeader: {
				navigationTitle: {
					flexDirection: 'row',
					marginBottom: padding,
					paddingVertical: padding / 2,
					paddingLeft: 10,
					alignItems: 'center',
					backgroundColor: brandSecondary,
				},
				navigationTextTitle: {
					color: '#fff',
					fontSize: fontSizeRow,
					marginLeft: 10,
				},
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
			settingsButton: {
				padding: 6,
				minWidth: 100,
			},
			settingsText: {
				color: brandPrimary,
				fontSize: fontSizeRow,
				marginLeft: 10,
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
				color: brandSecondary,
				marginLeft: 10,
			},
			settingsLinkCover: {
				marginBottom: padding * 0.9,
			},
			linkCoverStyle: {
				flexDirection: 'row',
				paddingHorizontal: 10,
				alignItems: 'center',
				paddingVertical: padding * 0.9,
			},
			linkIconStyle: {
				fontSize: fontSizeSettingsIcon,
				color: brandSecondary,
				marginRight: 8,
				marginLeft: 10,
			},
			linkLabelStyle: {
				fontSize: fontSizeAddLocText,
				color: eulaContentColor,
			},
		};
	}
}

function mapStateToProps(store: Object): Object {

	const { accounts = {}, firebaseRemoteConfig = {} } = store.user;

	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	const { geoFenceFeature = JSON.stringify({enable: false}) } = firebaseRemoteConfig;
	const { enable } = JSON.parse(geoFenceFeature);

	return {
		gateways: store.gateways,
		userProfile: getUserProfileSelector(store),
		hasAPremAccount,
		enableGeoFenceFeature: enable,
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

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
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
const isEqual = require('react-fast-compare');

import {
	View,
	RippleButton,
	Text,
	Icon,
	ThemedMaterialIcon,
	IconTelldus,
} from '../../../BaseComponents';
import Gateway from './Gateway';
import {
	DrawerSubHeader,
	NavigationHeader,
	SettingsLink,
} from './DrawerSubComponents';
import Banner from '../TabViews/SubViews/Banner';

import { parseGatewaysForListView } from '../../Reducers/Gateways';
import { getUserProfile as getUserProfileSelector } from '../../Reducers/User';
import {
	getDrawerWidth,
	shouldUpdate,
	navigate,
	getPremiumAccounts,
	capitalize,
	hasStatusBar,
} from '../../Lib';
import {
	eventReset,
} from '../../Actions/Event';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

import {
	deployStore,
	TEST_ACCOUNTS,
} from '../../../Config';

type Props = {
	gateways: Array<Object>,
	appLayout: Object,
	isOpen: boolean,
	hasAPremAccount: boolean,
	enableGeoFenceFeature: boolean,
	consentLocationData: boolean,

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

isHuaweiBuild: boolean;

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

	this.isHuaweiBuild = deployStore === 'huawei';
}

_hasStatusBar = async () => {
	const _hasStatusBar = await hasStatusBar();
	this.setState({
		hasStatusBar: _hasStatusBar,
	});
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.state, nextState) || shouldUpdate(this.props, nextProps, [
		'gateways',
		'userProfile',
		'isOpen',
		'appLayout',
		'hasAPremAccount',
		'enableGeoFenceFeature',
		'consentLocationData',
	]);
}

	onPressGeoFence = () => {
		const {
			closeDrawer,
			consentLocationData,
		} = this.props;

		closeDrawer();
		let screen = 'AddEditGeoFence';
		if (!consentLocationData) {
			screen = 'InAppDisclosureScreen';
		}
		navigate('GeoFenceNavigator', {
			screen,
		});
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
			text: formatMessage(i18n.infoWhenAccessPremFromBasic),
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.upgrade),
			onPressPositive: () => {
				this.props.closeDrawer();
				navigate('PremiumUpgradeScreen');
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

	manageEvents = () => {
		const {
			closeDrawer,
			dispatch,
		} = this.props;
		closeDrawer();
		dispatch(eventReset());
		navigate('EventsNavigator', {
			screen: 'EventsList',
		});
	}

	render(): Object {
		const {
			gateways,
			userProfile = {},
			addNewLocation,
			appLayout,
			onPressGateway,
			dispatch,
			enableGeoFenceFeature,
			intl,
		} = this.props;
		const {
			drawerSubHeader,
			premIconStyle,
			...styles
		} = this.getStyles(appLayout);

		const {
			formatMessage,
		} = intl;

		const settingLinks = this.SETTINGS.map((s: Object, index: number): Object => {
			return <SettingsLink
				key={index}
				styles={styles}
				textIntl={s.text}
				iconName={s.icon}
				onPressLink={s.onPressLink}/>;
		});

		const {
			firstname,
			lastname,
			email,
			uuid,
		} = userProfile;
		const enableGeoFence = !this.isHuaweiBuild && (enableGeoFenceFeature || (TEST_ACCOUNTS.indexOf(uuid) !== -1)); // NOTE: Always show geofence option for test accounts

		return (
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{flexGrow: 1}}>
				<NavigationHeader
					firstName={firstname}
					email={email}
					appLayout={appLayout}
					lastName={lastname}
					styles={styles}
					textSwitchAccount={formatMessage(i18n.switchOrAddAccount)}
					onPress={this._showSwitchAccountActionSheet}/>
				<View
					level={17}
					style={{
						flex: 1,
					}}>
					<View style={styles.settingsLinkCover}>
						<DrawerSubHeader
							textIntl={i18n.settingsHeader}
							styles={drawerSubHeader}/>
						{settingLinks}
					</View>
					{enableGeoFence && (
						<View style={styles.settingsLinkCover}>
							<DrawerSubHeader
								textIntl={i18n.geoFence}
								styles={drawerSubHeader}/>
							<RippleButton style={styles.linkCoverStyle} onPress={this.onPressGeoFence}>
								<ThemedMaterialIcon
									level={23}
									style={{
										...styles.linkIconStyle,
										paddingRight: 3, // NOTE: Need extra padding to match with Telldus Icons
									}}
									name={'location-on'}/>
								<Text
									level={27}
									style={styles.linkLabelStyle}>
									{formatMessage(i18n.manageGeoFence)}
								</Text>
								<IconTelldus
									icon={'premium'}
									style={premIconStyle}/>
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
					{gateways.map((gateway: Object, index: number): Object => {
						return <Gateway
							gateway={gateway}
							key={index}
							appLayout={appLayout}
							onPressGateway={onPressGateway}
							dispatch={dispatch}/>;
					})}
					<SettingsLink
						styles={{
							...styles,
							linkCoverStyle: styles.linkCoverStyleAddNewGateway,
						}}
						text={capitalize(formatMessage(i18n.addNewGatway))}
						iconComponent={<Icon
							level={23}
							style={{
								...styles.linkIconStyle,
								paddingRight: 3, // NOTE: Need extra padding to match with Telldus Icons
							}}
							name={'plus-circle'}/>}
						onPressLink={addNewLocation}/>
					<SettingsLink
						styles={{
							...styles,
							linkCoverStyle: styles.linkCoverStyleAddNewGateway,
						}}
						text={capitalize('Manage events')}
						iconComponent={<Icon
							level={23}
							style={{
								...styles.linkIconStyle,
								paddingRight: 3, // NOTE: Need extra padding to match with Telldus Icons
							}}
							name={'plus-circle'}/>}
						onPressLink={this.manageEvents}/>
					<Banner/>
				</View>
			</ScrollView>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const {
			paddingFactor,
			brandPrimary,
			twine,
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
				marginTop: this.state.hasStatusBar ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
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
				},
				navigationTextTitle: {
					color: '#fff',
					fontSize: fontSizeRow,
					marginLeft: 10,
				},
			},
			switchOrAdd: {
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
				marginLeft: 16,
				marginRight: 10,
				marginVertical: 5 + (fontSizeAddLocText * 0.5),
				justifyContent: 'flex-start',
				marginBottom: 5,
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
			linkCoverStyleAddNewGateway: {
				flexDirection: 'row',
				paddingHorizontal: 10,
				alignItems: 'center',
				paddingVertical: padding * 1.5,
			},
			linkIconStyle: {
				fontSize: fontSizeSettingsIcon,
				marginRight: 8,
				marginLeft: 10,
				textAlign: 'left',
			},
			linkLabelStyle: {
				fontSize: fontSizeAddLocText,
			},
			iapTestCoverStyle: {
				flexDirection: 'row',
				marginBottom: 5 + (fontSizeRow * 0.5),
				marginLeft: 15,
				alignItems: 'center',
			},
			premIconStyle: {
				color: twine,
				fontSize: fontSizeAddLocText * 1.2,
				marginLeft: 5,
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

	const { accounts = {}, firebaseRemoteConfig = {} } = store.user;

	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	const {
		geoFenceFeature = JSON.stringify({enable: false}),
	} = firebaseRemoteConfig;

	const { enable } = JSON.parse(geoFenceFeature);

	const { defaultSettings = {} } = store.app;
	const {
		consentLocationData = false,
	} = defaultSettings;

	return {
		gateways: getRows(store),
		userProfile: getUserProfileSelector(store),
		hasAPremAccount,
		enableGeoFenceFeature: enable,
		consentLocationData,
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(Drawer): Object);

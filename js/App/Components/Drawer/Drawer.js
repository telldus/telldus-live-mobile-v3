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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createSelector } from 'reselect';
const isEqual = require('react-fast-compare');

import {
	View,
	RippleButton,
	Text,
	Icon,
} from '../../../BaseComponents';
import Gateway from './Gateway';
import {
	DrawerSubHeader,
	NavigationHeader,
	SettingsLink,
	TestIapLink,
} from './DrawerSubComponents';

import { parseGatewaysForListView } from '../../Reducers/Gateways';
import { getUserProfile as getUserProfileSelector } from '../../Reducers/User';
import {
	getDrawerWidth,
	shouldUpdate,
	navigate,
	getPremiumAccounts,
	capitalize,
} from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	gateways: Array<Object>,
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
	appDrawerBanner?: Object,
};

type State = {
	iapTestImageWidth: number,
	iapTestImageheight: number,
};

class Drawer extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	this.state = {
		iapTestImageWidth: 0,
		iapTestImageheight: 0,
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

}

componentDidMount() {
	this.setBannerImageDimensions();
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return !isEqual(this.state, nextState) || shouldUpdate(this.props, nextProps, [
		'gateways',
		'userProfile',
		'isOpen',
		'appLayout',
		'hasAPremAccount',
		'enableGeoFenceFeature',
		'appDrawerBanner',
	]);
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	if (!isEqual(this.props.appDrawerBanner, prevProps.appDrawerBanner)) {
		this.setBannerImageDimensions();
	}
}

	onPressGeoFence = () => {
		const {
			closeDrawer,
		} = this.props;

		closeDrawer();
		navigate('GeoFenceNavigator');
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
			positiveText: formatMessage(i18n.upgrade).toUpperCase(),
			onPressPositive: () => {
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

	render(): Object {
		const {
			gateways,
			userProfile,
			addNewLocation,
			appLayout,
			onPressGateway,
			dispatch,
			enableGeoFenceFeature,
			appDrawerBanner,
			intl,
		} = this.props;
		const {
			drawerSubHeader,
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
					textSwitchAccount={formatMessage(i18n.switchOrAddAccount)}
					onPress={this._showSwitchAccountActionSheet}/>
				<View
					level={3}
					style={{
						flex: 1,
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
								textIntl={i18n.geoFence}
								styles={drawerSubHeader}/>
							<RippleButton style={styles.linkCoverStyle} onPress={this.onPressGeoFence}>
								<MaterialIcons
									style={{
										...styles.linkIconStyle,
										paddingRight: 3, // NOTE: Need extra padding to match with Telldus Icons
									}}
									name={'location-on'}/>
								<Text
									level={5}
									style={styles.linkLabelStyle}>
									{formatMessage(i18n.Geofencing)}
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
					{gateways.map((gateway: number, index: number): Object => {
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
							style={{
								...styles.linkIconStyle,
								paddingRight: 3, // NOTE: Need extra padding to match with Telldus Icons
							}}
							name={'plus-circle'}/>}
						onPressLink={addNewLocation}/>
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

		const {
			paddingFactor,
			brandSecondary,
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
				marginTop: 0,
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
				marginLeft: 16,
				marginRight: 10,
				marginVertical: 5 + (fontSizeAddLocText * 0.5),
				justifyContent: 'flex-start',
				marginBottom: 5,
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
			linkCoverStyleAddNewGateway: {
				flexDirection: 'row',
				paddingHorizontal: 10,
				alignItems: 'center',
				paddingVertical: padding * 1.5,
			},
			linkIconStyle: {
				fontSize: fontSizeSettingsIcon,
				color: brandSecondary,
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

	const { accounts = {}, firebaseRemoteConfig = {} } = store.user;

	const premAccounts = getPremiumAccounts(accounts);
	const hasAPremAccount = Object.keys(premAccounts).length > 0;

	const {
		geoFenceFeature = JSON.stringify({enable: false}),
		appDrawerBanner = JSON.stringify({}),
	} = firebaseRemoteConfig;

	const { enable } = JSON.parse(geoFenceFeature);

	return {
		gateways: getRows(store),
		userProfile: getUserProfileSelector(store),
		hasAPremAccount,
		enableGeoFenceFeature: enable,
		appDrawerBanner: appDrawerBanner === '' ? {} : JSON.parse(appDrawerBanner),
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

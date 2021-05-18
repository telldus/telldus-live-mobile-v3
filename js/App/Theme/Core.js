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
 */

// @flow

'use strict';

import { Platform } from 'react-native';

const titleFontSize: number = (Platform.OS === 'ios' ) ? 17 : 19;
const subTitleFontSize: number = (Platform.OS === 'ios' ) ? 12 : 14;
const toolbarHeight: number = (Platform.OS === 'ios' ) ? 64 : 56;
const radioBtnSize: number = (Platform.OS === 'ios') ? 25 : 23;
const toolbarIconSize: number = (Platform.OS === 'ios' ) ? 20 : 22;

export default {
	brandPrimary: '#1b365d',
	brandSecondary: '#e26901',
	brandTertiary: '#202020',
	brandInfo: '#5bc0de',
	brandSuccess: '#5cb85c',
	brandDanger: '#d9534f',
	brandWarning: '#f0ad4e',
	brandSidebar: '#252932',
	brandRGB: '#21A296',
	iPhoneXbg: '#eae7f0',
	iconFamily: 'Ionicons',
	twine: '#C4A362',
	get fonts(): Object {
		return {
			telldusIconFont: 'telldusicons',
			robotoLight: 'Roboto-Light',
			robotoMedium: 'Roboto-Medium',
			robotoRegular: 'Roboto-Regular',
			sfnsDisplay: 'SFNS Display',
			suisseIntlRegular: 'SuisseIntl',
		};
	},

	inverseTextColor: '#ffffff',
	fadedInverseTextColor: '#C3D1E6',
	textColor: '#000000',
	inactiveGray: '#bdbdbd',
	inactiveSwitch: '#999999',
	inactiveSwitchBackground: '#cccccc',
	textDisabled: '#f5f5f5',
	inputBaseColor: '#ffffff80',

	sunriseColor: '#ffa726',
	sunsetColor: '#ef5350',
	get timeColor(): string {
		return this.brandSecondary;
	},

	get navBarTopPadding(): number {
		return (Platform.OS === 'ios') ? 0 : 10;
	},
	getFooterHeight: (deviceWidth: number): number => {
		let footerHeight = Math.floor(deviceWidth * 0.26);
		return footerHeight > 100 ? 100 : footerHeight;
	},

	grayPrimary: '#2E2E2E',
	screenBGDark: '#121212',
	brandSecondaryShadeOne: '#FFA450',
	colorOffActiveBg: '#607D8B',
	inactiveBG: '#424242',

	textColorLabel: '#E4E4E4',
	textColorValue: '#ABABAB',

	appBackground: '#eeeeee',
	sectionTextColor: '#8e8e93',
	rowTextColor: '#8e8e93',
	eulaContentColor: '#555555',
	inactiveTintColor: '#A59F9A',
	gatewayInactive: '#a2a2a2',
	angleTintColor: '#A59F9A90',
	angledRowBorderColor: '#BBB',
	darkBG: '#403829',

	baseColorPreloginScreen: '#ffffff',

	rippleColor: '#efefef',
	rippleOpacity: 0.9,
	rippleDuration: 600,

	offlineColor: '#b5b5b5',

	subtitleColor: '#8e8e93',
	textDark: '#4C4C4C',
	subHeader: '#777777',

	rowHeight: 60,

	buttonRowKey: '  **buttonRow**  ',
	GeoFenceDevicesHeaderKey: '  **devicesHeader**  ',
	GeoFenceJobsHeaderKey: '  **jobsHeader**  ',
	GeoFenceEventsHeaderKey: '  **eventsHeader**  ',

	maxSizeRowTextOne: 24,
	maxSizeRowTextTwo: 18,

	buttonWidth: 60,
	maxSizeFloatingButton: 80,
	maxSizeTextButton: 26,

	fontSizeBase: 12,
	titleFontSize,
	subTitleFontSize,

	inputFontSize: 15,
	inputLineHeight: 24,

	locationOnline: '#9CCC65',
	locationOffline: '#F44336',
	locationNoLiveUpdates: '#FF9800',
	darkRed: '#990000',
	red: '#D32F2E',

	get fontSizeH1(): number {
		return this.fontSizeBase * 1.8;
	},
	get fontSizeH2(): number {
		return this.fontSizeBase * 1.6;
	},
	get fontSizeH3(): number {
		return this.fontSizeBase * 1.4;
	},
	get btnTextSize(): number {
		return this.fontSizeBase * 1.1;
	},
	get btnTextSizeLarge(): number {
		return this.fontSizeBase * 1.5;
	},
	get btnTextSizeSmall(): number {
		return this.fontSizeBase * 0.8;
	},
	get iconSizeLarge(): number {
		return this.iconFontSize * 1.5;
	},
	get iconSizeSmall(): number {
		return this.iconFontSize * 0.6;
	},

	/**
	 * Common factor using which screen's margin from device's edges is set. Also inter-component space is
	 * is 50% of calculated screen margin.
	 *
	 * Screen margin in the app is calculated by multiplying the 'paddingFactor' with 'width'(portrait) and
	 * height(landscape) from 'appLayout'.
	 */
	get paddingFactor(): number {
		return 0.027777;
	},

	get headerHeightFactor(): Object {
		return {
			port: 0.05,
			land: 0.08,
		};
	},

	get androidLandMarginLeftFactor(): number {
		return 0.0635;
	},
	get androidLandTabbarHeightFactor(): number {
		return 0.13;
	},

	get editBoxPaddingFactor(): number {
		return 0.05;
	},

	buttonPadding: 6,

	borderRadiusBase: 2,
	borderRadiusRow: 3,

	get borderRadiusLarge(): number {
		return this.fontSizeBase * 3.8;
	},

	footerHeight: 55,
	toolbarHeight,
	get toolbarDefaultBg(): string {
		return this.brandPrimary;
	},
	toolbarInverseBg: '#222',

	iosToolbarBtnColor: '#007aff',

	toolbarTextColor: '#fff',

	checkboxBgColor: '#039BE5',
	checkboxTickColor: '#fff',

	checkboxSize: 23,

	radioColor: '#7e7e7e',
	radioBtnSize,

	tabBgColor: '#F8F8F8',
	tabTextColor: '#fff',

	btnDisabledBg: '#b5b5b5',
	btnDisabledClr: '#f1f1f1',

	cardDefaultBg: '#fff',

	get btnPrimaryBg(): string {
		return this.brandSecondary;
	},
	get btnSecondaryBg(): string {
		return this.brandTertiary;
	},
	get btnPrimaryColor(): string {
		return this.inverseTextColor;
	},
	get btnSuccessBg(): string {
		return this.brandSuccess;
	},
	get btnSuccessColor(): string {
		return this.inverseTextColor;
	},
	get btnDangerBg(): string {
		return this.brandDanger;
	},
	get btnDangerColor(): string {
		return this.inverseTextColor;
	},
	get btnInfoBg(): string {
		return this.brandInfo;
	},
	get btnInfoColor(): string {
		return this.inverseTextColor;
	},
	get btnWarningBg(): string {
		return this.brandWarning;
	},
	get btnWarningColor(): string {
		return this.inverseTextColor;
	},

	borderWidth: 0,
	iconMargin: 7,

	get inputColor(): string {
		return this.textColor;
	},
	get inputColorPlaceholder(): string {
		return '#575757';
	},
	inputBorderColor: '#D9D5DC',
	inputHeightBase: 40,
	inputGroupMarginBottom: 10,
	inputPaddingLeft: 5,
	get inputPaddingLeftIcon(): number {
		return this.inputPaddingLeft * 8;
	},

	dropdownBg: '#000',
	dropdownLinkColor: '#414142',

	jumbotronPadding: 30,
	jumbotronBg: '#C9C9CE',

	contentPadding: 10,

	listBorderColor: '#ddd',
	listDividerBg: '#ddd',
	listItemPadding: 9,
	listNoteColor: '#808080',
	listNoteSize: 13,

	get iconFontSize(): number {
		return this.fontSizeBase;
	},

	badgeColor: '#fff',
	badgeBg: '#ED1727',

	toolbarIconSize,

	toolbarInputColor: '#CECDD2',

	defaultSpinnerColor: '#45D56E',
	inverseSpinnerColor: '#1A191B',

	defaultProgressColor: '#E4202D',
	inverseProgressColor: '#1A191B',

	get shadow(): Object {
		return {
			elevation: 2,
			shadowColor: '#000',
			shadowRadius: 2,
			shadowOpacity: 0.23,
			shadowOffset: {
				width: 0,
				height: 1,
			},
		};
	},

	get headerButtonHorizontalPadding(): number {
		return 15;
	},
	get headerButtonIconSizeFactor(): number {
		return 0.06;
	},
	get floatingButtonSizeFactor(): number {
		return 0.134666667;
	},
	get floatingButtonOffsetFactor(): Object {
		return {
			right: 0.034666667,
			bottom: 0.046666667,
		};
	},
	get fontSizeFactorOne(): number {
		return 0.047;
	},
	get fontSizeFactorTwo(): number {
		return 0.0333;
	},
	get fontSizeFactorThree(): number {
		return 0.039;
	},
	get fontSizeFactorFour(): number {
		return 0.04;
	},
	get fontSizeFactorFive(): number {
		return 0.05;
	},
	get fontSizeFactorSix(): number {
		return 0.025;
	},
	get fontSizeFactorSeven(): number {// Poster with text
		return 0.047;
	},
	get fontSizeFactorEight(): number {
		return 0.045;
	},
	get fontSizeFactorNine(): number {
		return 0.16;
	},
	get fontSizeFactorTen(): number {
		return 0.035;
	},
	get fontSizeFactorEleven(): number {
		return 0.038;
	},
	get fontSizeFactorTwelve(): number {
		return 0.042;
	},
};

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

import Core from './Core';

import { CONSTANTS } from 'live-shared-data';
const {
	LIGHT_THEME_KEY,
	DARK_THEME_KEY,
} = CONSTANTS;

const common = {
	get primary() {
		return '#80919E';
	},
	get secondary() {
		return '#9C7D69';
	},
	get danger() {
		return Core.brandDanger;
	},
	get warning() {
		return Core.brandWarning;
	},
	get success() {
		return Core.brandSuccess;
	},
};

export default {
	[LIGHT_THEME_KEY]: {
		...common,
		get safeAreaBG() {
			return '#000000';
		},
		get text() {
			return Core.inactiveTintColor;
		},
		get textTwo() {
			return Core.subHeader;
		},
		get textThree() {
			return '#000';
		},
		get textFour() {
			return Core.textDark;
		},
		get textFive() {
			return Core.eulaContentColor;
		},
		get textSix() {
			return Core.rowTextColor;
		},
		get textSeven() {
			return Core.rowTextColor;
		},
		get textEight() {
			return Core.eulaContentColor;
		},
		get textNine() {
			return Core.eulaContentColor;
		},
		get textTen() {
			return '#fff';
		},
		get textInsideBrandSecondary() {
			return '#fff';
		},
		get textInsideBrandPrimary() {
			return '#fff';
		},
		get border() {
			return '#C9C9CE';
		},
		get background() {
			return '#f5f5f5';
		},
		get card() {
			return '#f5f5f5';
		},
		get screenBackground() {
			return Core.appBackground;
		},
		get backgroundColorOne() {
			return '#000';
		},
		get activeTintOne() {
			return '#000';
		},
		get inActiveTintOne() {
			return Core.inactiveTintColor;
		},
		get inActiveTintTwo() {
			return Core.inactiveGray;
		},
		get thumbColorActiveSwitch() {
			return '#000000';
		},
		get thumbColorInActiveSwitch() {
			return Core.inactiveSwitch;
		},
		get trackColorActiveSwitch() {
			return '#ccc';
		},
		get trackColorInActiveSwitch() {
			return Core.inactiveSwitchBackground;
		},
		get colorBlockDisabled() {
			return '#f5f5f5';
		},
		get headerOneColorBlockEnabled() {
			return '#9C7D69';
		},
		get headerOneColorBlockDisabled() {
			return '#999999';
		},
		get iconOneColorBlockEnabled() {
			return '#80919E';
		},
		get iconOneColorBlockDisabled() {
			return '#bdbdbd';
		},
		get iconOneSubColorBlock() {
			return '#80919E';
		},
		get iconTwoColorBlock() {
			return '#BDBDBD';
		},
		get iconTwoColorBlockDisabled() {
			return '#ffffff';
		},
		get infoOneColorBlockEnabled() {
			return Core.rowTextColor;
		},
		get infoOneColorBlockDisabled() {
			return Core.rowTextColor;
		},
		get headerIconColorBlock() {
			return '#9C7D69';
		},
		get colorTimeExpired() {
			return '#990000';
		},
		get footerPrimary() {
			return '#9C7D69';
		},
		get footerSecondary() {
			return '#fff';
		},
		get imageTintOne() {
			return Core.rowTextColor;
		},
		get backgroundOneButtonEnabled() {
			return '#9C7D69';
		},
		get backgroundOneButtonDisabled() {
			return '#b5b5b5';
		},
		get colorOneButtonTextEnabled() {
			return '#ffffff';
		},
		get colorButtonTextEnabledPreLogin() {
			return '#000000';
		},
		get colorOneButtonTextDisabled() {
			return '#f5f5f5';
		},
		get colorTwoButtonTextEnabled() {
			return '#000000';
		},
		get colorOneThrobberButton() {
			return '#ffffff';
		},
		get checkBoxIconActiveOne() {
			return '#9C7D69';
		},
		get checkBoxIconInactiveOne() {
			return 'transparent';
		},
		get checkBoxIconBGActiveOne() {
			return '#ffffff';
		},
		get checkBoxIconBGInactiveOne() {
			return 'transparent';
		},
		get checkBoxIconBorderActiveOne() {
			return '#9C7D69';
		},
		get checkBoxIconBorderInactiveOne() {
			return '#ffffff';
		},
		get checkBoxTextActiveOne() {
			return '#ffffff';
		},
		get modalOverlay() {
			return '#000';
		},
		get ShadeOne() {
			return Core.appBackground;
		},
		get ShadeTwo() {
			return Core.btnDisabledBg;
		},
		get ShadeThree() {
			return Core.rowTextColor;
		},
		get posterBG() {
			return '#9C7D69';
		},
		get textInsidePoster() {
			return '#ffffff';
		},
		get headerIconColor() {
			return '#ffffff';
		},
		get colorOnActiveBg() {
			return '#9C7D69';
		},
		get colorOffActiveBg() {
			return '#80919E';
		},
		get colorOnInActiveBg() {
			return '#eeeeee';
		},
		get colorOffInActiveBg() {
			return '#eeeeee';
		},
		get colorOnActiveIcon() {
			return '#FFFFFF';
		},
		get colorOffActiveIcon() {
			return '#FFFFFF';
		},
		get colorOnInActiveIcon() {
			return '#9C7D69';
		},
		get colorOffInActiveIcon() {
			return '#80919E';
		},
		get inAppBrandSecondary() {
			return '#9C7D69';
		},
		get inAppBrandPrimary() {
			return '#80919E';
		},
		get buttonSeparatorColor() {
			return '#dddddd';
		},
		get dimL1Color() {
			return '#EEA567';
		},
		get dimL2Color() {
			return '#EA8F41';
		},
		get sunriseColor() {
			return '#ffa726';
		},
		get sunsetColor() {
			return '#ef5350';
		},
		get timeColor() {
			return '#9C7D69';
		},
		get drawerBg() {
			return '#000000';
		},
		get drawerBottomBg() {
			return Core.appBackground;
		},
		get dialogueBoxNegativeTextColor() {
			return '#6B6969';
		},
		get lightDrandSecDarkWhite() {
			return '#9C7D69';
		},
		get badgeColor() {
			return '#ED1727';
		},
		get statusGreen() {
			return '#9CCC65';
		},
		get statusOrange() {
			return '#FF9800';
		},
		get statusRed() {
			return '#F44336';
		},
		get headerBG() {
			return '#000000';
		},
		get headerLogoColor() {
			return '#ffffff';
		},
		get sensorValueBGColor() {
			return '#000000';
		},
		get itemIconBGColor() {
			return 'transparent';
		},
		get itemIconBGColorOffline() {
			return 'transparent';
		},
		get baseColor() {
			return '#000000';
		},
		get baseColorTwo() {
			return '#000000';
		},
		get baseColorThree() {
			return '#333333';
		},
		get buttonBGColor() {
			return '#ffffff';
		},
		get buttonBGColorTwo() {
			return '#000000';
		},
		get buttonBGColorPrelogin() {
			return '#ffffff';
		},
		get textOnLevelThreeView() {
			return '#000000';
		},
		get iconOnSettingsBlock() {
			return '#000000';
		},
		get viewInsideLevelTwoView() {
			return '#eeeeee';
		},
		get moreItemsIndicatorColor() {
			return '#CCCCCC';
		},
		get moreItemsIndicatorSelectedColor() {
			return '#ffffff';
		},
		get baseColorFour() {
			return '#333333';
		},
		get baseColorFive() {
			return '#4F4F4F';
		},
		get baseColorSix() {
			return '#333333';
		},
		get baseColorSeven() {
			return '#000000';
		},
		get textColorInactive() {
			return Core.inactiveTintColor;
		},
		get iconColorInsidePoster() {
			return '#4F4F4F';
		},
	},

	[DARK_THEME_KEY]: {
		...common,
		get safeAreaBG() {
			return Core.grayPrimary;
		},
		get text() {
			return Core.textColorLabel;
		},
		get textTwo() {
			return Core.textColorValue;
		},
		get textThree() {
			return Core.textColorLabel;
		},
		get textFour() {
			return Core.textColorValue;
		},
		get textFive() {
			return '#fff';
		},
		get textSix() {
			return '#fff';
		},
		get textSeven() {
			return Core.textColorValue;
		},
		get textEight() {
			return Core.textColorValue;
		},
		get textNine() {
			return Core.textColorLabel;
		},
		get textTen() {
			return Core.textColorValue;
		},
		get textInsideBrandSecondary() {
			return '#fff';
		},
		get textInsideBrandPrimary() {
			return '#fff';
		},
		get border() {
			return Core.grayPrimary;
		},
		get background() {
			return '#000';
		},
		get card() {
			return Core.grayPrimary;
		},
		get screenBackground() {
			return Core.screenBGDark;
		},
		get backgroundColorOne() {
			return '#777777';
		},
		get activeTintOne() {
			return '#ffffff';
		},
		get inActiveTintOne() {
			return Core.inactiveTintColor;
		},
		get inActiveTintTwo() {
			return Core.inactiveGray;
		},
		get thumbColorActiveSwitch() {
			return '#ffffff';
		},
		get thumbColorInActiveSwitch() {
			return Core.inactiveSwitch;
		},
		get trackColorActiveSwitch() {
			return '#ccc';
		},
		get trackColorInActiveSwitch() {
			return '#fff';
		},
		get colorBlockDisabled() {
			return '#202020';
		},
		get headerOneColorBlockEnabled() {
			return Core.brandSecondaryShadeOne;
		},
		get headerOneColorBlockDisabled() {
			return '#666666';
		},
		get iconOneColorBlockEnabled() {
			return '#ABABAB';
		},
		get iconOneColorBlockDisabled() {
			return '#666666';
		},
		get iconOneSubColorBlock() {
			return '#ffffff';
		},
		get iconTwoColorBlock() {
			return '#ABABAB';
		},
		get iconTwoColorBlockDisabled() {
			return '#666666';
		},
		get infoOneColorBlockEnabled() {
			return '#ABABAB';
		},
		get infoOneColorBlockDisabled() {
			return '#666666';
		},
		get headerIconColorBlock() {
			return Core.brandSecondaryShadeOne;
		},
		get colorTimeExpired() {
			return '#EF9A9A';
		},
		get footerPrimary() {
			return Core.brandSecondaryShadeOne;
		},
		get footerSecondary() {
			return '#000';
		},
		get imageTintOne() {
			return '#fff';
		},
		get backgroundOneButtonEnabled() {
			return Core.brandSecondaryShadeOne;
		},
		get backgroundOneButtonDisabled() {
			return '#b5b5b5';
		},
		get colorOneButtonTextEnabled() {
			return '#ffffff';
		},
		get colorButtonTextEnabledPreLogin() {
			return '#000000';
		},
		get colorOneButtonTextDisabled() {
			return '#f5f5f5';
		},
		get colorTwoButtonTextEnabled() {
			return '#ffffff';
		},
		get colorOneThrobberButton() {
			return '#ffffff';
		},
		get checkBoxIconActiveOne() {
			return '#000000';
		},
		get checkBoxIconInactiveOne() {
			return 'transparent';
		},
		get checkBoxIconBGActiveOne() {
			return '#ffffff';
		},
		get checkBoxIconBGInactiveOne() {
			return 'transparent';
		},
		get checkBoxIconBorderActiveOne() {
			return '#ffffff';
		},
		get checkBoxIconBorderInactiveOne() {
			return '#ffffff';
		},
		get checkBoxTextActiveOne() {
			return '#ffffff';
		},
		get modalOverlay() {
			return '#000';
		},
		get ShadeOne() {
			return '#000';
		},
		get ShadeTwo() {
			return Core.screenBGDark;
		},
		get ShadeThree() {
			return Core.textColorValue;
		},
		get posterBG() {
			return Core.brandSecondaryShadeOne;
		},
		get textInsidePoster() {
			return '#ffffff';
		},
		get headerIconColor() {
			return Core.textColorLabel;
		},
		get colorOnActiveBg() {
			return '#9C7D69';
		},
		get colorOffActiveBg() {
			return '#80919E';
		},
		get colorOnInActiveBg() {
			return '#424242';
		},
		get colorOffInActiveBg() {
			return '#424242';
		},
		get colorOnActiveIcon() {
			return '#FFFFFF';
		},
		get colorOffActiveIcon() {
			return '#FFFFFF';
		},
		get colorOnInActiveIcon() {
			return '#9C7D69';
		},
		get colorOffInActiveIcon() {
			return '#80919E';
		},
		get inAppBrandSecondary() {
			return '#9C7D69';
		},
		get inAppBrandPrimary() {
			return '#80919E';
		},
		get buttonSeparatorColor() {
			return Core.grayPrimary;
		},
		get dimL1Color() {
			return '#EEA567';
		},
		get dimL2Color() {
			return '#EA8F41';
		},
		get sunriseColor() {
			return '#ffa726'; // TODO: Confirm with Johannes
		},
		get sunsetColor() {
			return '#ef5350'; // TODO: Confirm with Johannes
		},
		get timeColor() {
			return '#9C7D69';
		},
		get drawerBg() {
			return '#424242';
		},
		get drawerBottomBg() {
			return '#424242';
		},
		get dialogueBoxNegativeTextColor() {
			return '#6B6969';
		},
		get lightDrandSecDarkWhite() {
			return '#FFFFFF';
		},
		get badgeColor() {
			return '#ED1727';
		},
		get statusGreen() {
			return '#C5E1A5';
		},
		get statusOrange() {
			return '#9C7D69';
		},
		get statusRed() {
			return '#EF5350';
		},
		get headerBG() {
			return Core.grayPrimary;
		},
		get headerLogoColor() {
			return '#ffffff';
		},
		get sensorValueBGColor() {
			return '#80919E';
		},
		get itemIconBGColor() {
			return '#80919E';
		},
		get itemIconBGColorOffline() {
			return Core.offlineColor;
		},
		get baseColor() {
			return '#ffffff';
		},
		get baseColorTwo() {
			return Core.rowTextColor;
		},
		get baseColorThree() {
			return '#ffffff';
		},
		get buttonBGColor() {
			return '#9C7D69';
		},
		get textOnLevelThreeView() {
			return '#ffffff';
		},
		get buttonBGColorTwo() {
			return '#424242';
		},
		get buttonBGColorPrelogin() {
			return '#ffffff';
		},
		get iconOnSettingsBlock() {
			return '#ffffff';
		},
		get viewInsideLevelTwoView() {
			return '#424242';
		},
		get moreItemsIndicatorColor() {
			return '#CCCCCC';
		},
		get moreItemsIndicatorSelectedColor() {
			return '#ffffff';
		},
		get baseColorFour() {
			return '#ffffff';
		},
		get baseColorFive() {
			return '#ffffff';
		},
		get baseColorSix() {
			return '#E4E4E4';
		},
		get baseColorSeven() {
			return '#E4E4E4';
		},
		get textColorInactive() {
			return '#CCCCCC';
		},
		get iconColorInsidePoster() {
			return '#4F4F4F';
		},
	},
};

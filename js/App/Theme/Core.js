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

import Color from 'color';

import { Platform } from 'react-native';

export default {
	brandPrimary: '#1b365d',
	brandSecondary: '#e26901',
	brandTertiary: '#202020',
	brandInfo: '#5bc0de',
	brandSuccess: '#5cb85c',
	brandDanger: '#d9534f',
	brandWarning: '#f0ad4e',
	brandSidebar: '#252932',
	iconFamily: 'Ionicons',
	iPhoneXbg: '#eae7f0',
	get fonts() {
		return {
			telldusIconFont: 'telldusicons',
			robotoLight: 'Roboto-Light',
			robotoMedium: 'Roboto-Medium',
			robotoRegular: 'Roboto-Regular',
			sfnsDisplay: 'SFNS Display',
		};
	},


	inverseTextColor: '#ffffff',
	fadedInverseTextColor: '#C3D1E6',
	textColor: '#000000',

	subtitleColor: '#8e8e93',

	fontSizeBase: 12,
	titleFontSize: (Platform.OS === 'ios' ) ? 17 : 19,
	subTitleFontSize: (Platform.OS === 'ios' ) ? 12 : 14,

	inputFontSize: 15,
	inputLineHeight: 24,

	locationOnline: '#9CCC65',
	locationOffline: '#F44336',
	locationNoLiveUpdates: '#FF9800',

	get fontSizeH1() {
		return this.fontSizeBase * 1.8;
	},
	get fontSizeH2() {
		return this.fontSizeBase * 1.6;
	},
	get fontSizeH3() {
		return this.fontSizeBase * 1.4;
	},
	get btnTextSize() {
		return this.fontSizeBase * 1.1;
	},
	get btnTextSizeLarge() {
		return this.fontSizeBase * 1.5;
	},
	get btnTextSizeSmall() {
		return this.fontSizeBase * 0.8;
	},
	get iconSizeLarge() {
		return this.iconFontSize * 1.5;
	},
	get iconSizeSmall() {
		return this.iconFontSize * 0.6;
	},

	buttonPadding: 6,

	borderRadiusBase: 2,

	borderRadiusRow: 3,

	get borderRadiusLarge() {
		return this.fontSizeBase * 3.8;
	},

	footerHeight: 55,
	toolbarHeight: (Platform.OS === 'ios' ) ? 64 : 56,
	get toolbarDefaultBg() {
		return this.brandPrimary;
	},
	toolbarInverseBg: '#222',

	iosToolbarBtnColor: '#007aff',

	toolbarTextColor: '#fff',

	checkboxBgColor: '#039BE5',
	checkboxTickColor: '#fff',

	checkboxSize: 23,

	radioColor: '#7e7e7e',
	radioBtnSize: (Platform.OS === 'ios') ? 25 : 23,

	tabBgColor: '#F8F8F8',
	tabTextColor: '#fff',

	btnDisabledBg: '#b5b5b5',
	btnDisabledClr: '#f1f1f1',

	cardDefaultBg: '#fff',

	get darkenHeader() {
		return Color(this.tabBgColor).darken(0.03).hexString();
	},
	get btnPrimaryBg() {
		return this.brandSecondary;
	},
	get btnSecondaryBg() {
		return this.brandTertiary;
	},
	get btnPrimaryColor() {
		return this.inverseTextColor;
	},
	get btnSuccessBg() {
		return this.brandSuccess;
	},
	get btnSuccessColor() {
		return this.inverseTextColor;
	},
	get btnDangerBg() {
		return this.brandDanger;
	},
	get btnDangerColor() {
		return this.inverseTextColor;
	},
	get btnInfoBg() {
		return this.brandInfo;
	},
	get btnInfoColor() {
		return this.inverseTextColor;
	},
	get btnWarningBg() {
		return this.brandWarning;
	},
	get btnWarningColor() {
		return this.inverseTextColor;
	},

	borderWidth: 0,
	iconMargin: 7,

	get inputColor() {
		return this.textColor;
	},
	get inputColorPlaceholder() {
		return '#575757';
	},
	inputBorderColor: '#D9D5DC',
	inputHeightBase: 40,
	inputGroupMarginBottom: 10,
	inputPaddingLeft: 5,
	get inputPaddingLeftIcon() {
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

	iconFontSize: this.fontSizeBase,

	badgeColor: '#fff',
	badgeBg: '#ED1727',

	toolbarIconSize: (Platform.OS === 'ios' ) ? 20 : 22,

	toolbarInputColor: '#CECDD2',

	defaultSpinnerColor: '#45D56E',
	inverseSpinnerColor: '#1A191B',

	defaultProgressColor: '#E4202D',
	inverseProgressColor: '#1A191B',

	get shadow() {
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

};

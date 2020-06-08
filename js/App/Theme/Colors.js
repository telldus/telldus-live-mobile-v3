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

const common = {
	get primary() {
		return Core.brandPrimary;
	},
	get secondary() {
		return Core.brandSecondary;
	},
	get danger() {
		return Core.brandDanger;
	},
	get warning() {
		return Core.brandWarning;
	},
	get badgeColor() {
		return '#ED1727';
	},
};

export default {
	Default: {
		...common,
		get text() {
			return '#A59F9A';
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
			return '#fff';
		},
		get card() {
			return '#fff';
		},
		get screenBackground() {
			return Core.appBackground;
		},
		get backgroundColorOne() {
			return '#000';
		},
		get activeTintOne() {
			return Core.brandSecondary;
		},
		get inActiveTintOne() {
			return Core.inactiveTintColor;
		},
		get thumbColorActiveSwitch() {
			return Core.brandSecondary;
		},
		get thumbColorInActiveSwitch() {
			return Core.inactiveSwitch;
		},
		get trackColorActiveSwitch() {
			return '#e2690150';
		},
		get trackColorInActiveSwitch() {
			return Core.inactiveSwitchBackground;
		},
		get colorBlockDisabled() {
			return '#f5f5f5';
		},
		get headerOneColorBlockEnabled() {
			return Core.brandSecondary;
		},
		get headerOneColorBlockDisabled() {
			return '#999999';
		},
		get iconOneColorBlockEnabled() {
			return '#1b365d';
		},
		get iconOneColorBlockDisabled() {
			return '#bdbdbd';
		},
		get iconTwoColorBlock() {
			return '#A59F9A90';
		},
		get infoOneColorBlockEnabled() {
			return Core.rowTextColor;
		},
		get infoOneColorBlockDisabled() {
			return Core.rowTextColor;
		},
		get headerIconColorBlock() {
			return Core.brandSecondary;
		},
		get colorTimeExpired() {
			return '#990000';
		},
		get footerPrimary() {
			return Core.brandSecondary;
		},
		get footerSecondary() {
			return '#fff';
		},
		get imageTintOne() {
			return Core.rowTextColor;
		},
		get backgroundOneButtonEnabled() {
			return Core.brandSecondary;
		},
		get backgroundOneButtonDisabled() {
			return '#b5b5b5';
		},
		get colorOneButtonTextEnabled() {
			return '#ffffff';
		},
		get colorOneButtonTextDisabled() {
			return '#f5f5f5';
		},
		get colorOneThrobberButton() {
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
	},

	Dark: {
		...common,
		get text() {
			return '#A59F9A';
		},
		get textTwo() {
			return '#fff';
		},
		get textThree() {
			return '#fff';
		},
		get textFour() {
			return '#fff';
		},
		get textFive() {
			return '#fff';
		},
		get textSix() {
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
			return '#000';
		},
		get card() {
			return '#000';
		},
		get screenBackground() {
			return '#777777';
		},
		get backgroundColorOne() {
			return '#777777';
		},
		get activeTintOne() {
			return Core.brandSecondary;
		},
		get inActiveTintOne() {
			return Core.inactiveTintColor;
		},
		get thumbColorActiveSwitch() {
			return Core.brandSecondary;
		},
		get thumbColorInActiveSwitch() {
			return Core.inactiveSwitch;
		},
		get trackColorActiveSwitch() {
			return '#e2690150';
		},
		get trackColorInActiveSwitch() {
			return '#fff';
		},
		get colorBlockDisabled() {
			return '#f5f5f5';
		},
		get headerOneColorBlockEnabled() {
			return Core.brandSecondary;
		},
		get headerOneColorBlockDisabled() {
			return '#999999';
		},
		get iconOneColorBlockEnabled() {
			return '#1b365d';
		},
		get iconOneColorBlockDisabled() {
			return '#bdbdbd';
		},
		get iconTwoColorBlock() {
			return '#A59F9A90';
		},
		get infoOneColorBlockEnabled() {
			return '#fff';
		},
		get infoOneColorBlockDisabled() {
			return Core.rowTextColor;
		},
		get headerIconColorBlock() {
			return Core.brandSecondary;
		},
		get colorTimeExpired() {
			return '#990000';
		},
		get footerPrimary() {
			return Core.brandSecondary;
		},
		get footerSecondary() {
			return '#000';
		},
		get imageTintOne() {
			return '#fff';
		},
		get backgroundOneButtonEnabled() {
			return Core.brandSecondary;
		},
		get backgroundOneButtonDisabled() {
			return '#b5b5b5';
		},
		get colorOneButtonTextEnabled() {
			return '#ffffff';
		},
		get colorOneButtonTextDisabled() {
			return '#f5f5f5';
		},
		get colorOneThrobberButton() {
			return '#ffffff';
		},
		get modalOverlay() {
			return '#000';
		},
		get ShadeOne() {
			return '#000';
		},
		get ShadeTwo() {
			return this.screenBackground;
		},
		get ShadeThree() {
			return this.textTwo;
		},
	},
};

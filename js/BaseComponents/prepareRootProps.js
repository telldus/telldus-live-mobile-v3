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

import CoreTheme from '../App/Theme/Core';
import computeProps from './computeProps';


const prepareRootPropsView = (props: Object = {}, defaultPropsOverride?: Object = {}): Object => {
	const backgroundColor = getBGColor(props);
	let defaultProps = {
		style: {
			backgroundColor,
		},
	};
	if (!props.style) {
		defaultProps = {
			style: {
				flex: 1,
				backgroundColor,
			},
		};
	} else if (Array.isArray(props.style)) {
		defaultProps = {
			style: [{
				backgroundColor,
			}],
		};
	}

	defaultProps = computeProps(defaultProps, defaultPropsOverride);

	return computeProps(props, defaultProps);

};

const getBGColor = (props: Object): ?string => {
	const {
		level,
		colors,
	} = props;

	if (!level) {
		return 'transparent';
	}
	switch (level) {
		case 1: {
			return colors.background;
		}
		case 2: {
			return colors.card;
		}
		case 3: {
			return colors.screenBackground;
		}
		case 4: {
			return colors.footerPrimary;
		}
		case 5: {
			return colors.footerSecondary;
		}
		case 6: {
			return colors.backgroundOneButtonEnabled;
		}
		case 7: {
			return colors.backgroundOneButtonDisabled;
		}
		case 8: {
			return colors.secondary;
		}
		case 9: {
			return colors.badgeColor;
		}
		case 10: {
			return colors.danger;
		}
		case 11: {
			return colors.safeAreaBG;
		}
		case 12: {
			return colors.headerIconColor;
		}
		case 13: {
			return colors.inAppBrandSecondary;
		}
		case 14: {
			return colors.inActiveTintTwo;
		}
		case 15: {
			return colors.inAppBrandPrimary;
		}
		case 16: {
			return colors.drawerBg;
		}
		case 17: {
			return colors.drawerBottomBg;
		}
		case 18: {
			return colors.textInsidePoster;
		}
		case 19: {
			return colors.headerBG;
		}
		case 20: {
			return colors.sensorValueBGColor;
		}
		case 21: {
			return colors.itemIconBGColor;
		}
		case 22: {
			return colors.buttonBGColor;
		}
		case 23: {
			return colors.buttonBGColorTwo;
		}
		default:
			return 'transparent';
	}
};

const prepareRootPropsText = (props: Object = {}, defaultPropsOverride?: Object = {}): Object => {
	const {
		style,
	} = props;

	let type = {
		color: getTextColor(props),
		backgroundColor: 'transparent',
		fontSize: CoreTheme.fontSizeBase,
	};

	let defaultProps = {
		style: type,
	};

	if (style && Array.isArray(style)) {
		defaultProps = {
			style: [type],
		};
	}

	defaultProps = computeProps(defaultProps, defaultPropsOverride);

	return computeProps(props, defaultProps);
};

const getTextColor = (props: Object): ?string => {
	const {
		level,
		colors,
	} = props;
	if (!level) {
		return;
	}
	switch (level) {
		case 1: {
			return colors.text;
		}
		case 2: {
			return colors.textTwo;
		}
		case 3: {
			return colors.textThree;
		}
		case 4: {
			return colors.textFour;
		}
		case 5: {
			return colors.textFive;
		}
		case 6: {
			return colors.textSix;
		}
		case 7: {
			return colors.headerOneColorBlockEnabled;
		}
		case 8: {
			return colors.colorTimeExpired;
		}
		case 9: {
			return colors.headerIconColorBlock;
		}
		case 10: {
			return colors.footerPrimary;
		}
		case 11: {
			return colors.footerSecondary;
		}
		case 12: {
			return colors.colorOneButtonTextEnabled;
		}
		case 13: {
			return colors.colorOneButtonTextDisabled;
		}
		case 14: {
			return colors.colorOneThrobberButton;
		}
		case 15: {
			return colors.secondary;
		}
		case 16: {
			return colors.textInsideBrandSecondary;
		}
		case 17: {
			return colors.textInsideBrandPrimary;
		}
		case 18: {
			return colors.infoOneColorBlockEnabled;
		}
		case 19: {
			return colors.infoOneColorBlockDisabled;
		}
		case 20: {
			return colors.iconOneSubColorBlock;
		}
		case 21: {
			return colors.iconTwoColorBlock;
		}
		case 22: {
			return colors.headerIconColor;
		}
		case 23: {
			return colors.inAppBrandSecondary;
		}
		case 24: {
			return colors.inAppBrandPrimary;
		}
		case 25: {
			return colors.textSeven;
		}
		case 26: {
			return colors.textEight;
		}
		case 27: {
			return colors.textNine;
		}
		case 28: {
			return colors.textTen;
		}
		case 29: {
			return colors.danger;
		}
		case 30: {
			return colors.success;
		}
		case 31: {
			return colors.statusGreen;
		}
		case 32: {
			return colors.statusRed;
		}
		case 33: {
			return colors.textInsidePoster;
		}
		case 34: {
			return colors.activeTintOne;
		}
		case 35: {
			return colors.colorTwoButtonTextEnabled;
		}
		case 36: {
			return colors.textOnLevelThreeView;
		}
		case 37: {
			return colors.iconOnSettingsBlock;
		}
		default:
			return;
	}
};

const prepareRootPropsImageView = (props: Object = {}, defaultPropsOverride?: Object = {}): Object => {
	const tintColor = getTintColor(props);
	let defaultProps = {
		style: {
			tintColor,
		},
	};
	if (!props.style) {
		defaultProps = {
			style: {
				tintColor,
			},
		};
	} else if (Array.isArray(props.style)) {
		defaultProps = {
			style: [{
				tintColor,
			}],
		};
	}

	defaultProps = computeProps(defaultProps, defaultPropsOverride);

	return computeProps(props, defaultProps);

};

const getTintColor = (props: Object): ?string => {
	const {
		level,
		colors,
	} = props;

	if (!level) {
		return;
	}
	switch (level) {
		case 1: {
			return colors.imageTintOne;
		}
		case 2: {
			return colors.secondary;
		}
		case 3: {
			return colors.iconTwoColorBlock;
		}
		case 4: {
			return colors.headerIconColor;
		}
		case 5: {
			return colors.inAppBrandSecondary;
		}
		default:
			return;
	}
};

const prepareRootPropsIcon = (props: Object, defaultPropsOverride?: Object = {}): Object => {

	let defaultProps = {
		color: getTextColor(props),
	};

	defaultProps = computeProps(defaultProps, defaultPropsOverride);

	return computeProps(props, defaultProps);
};

module.exports = {
	prepareRootPropsView,
	prepareRootPropsText,
	prepareRootPropsImageView,
	prepareRootPropsIcon,
};

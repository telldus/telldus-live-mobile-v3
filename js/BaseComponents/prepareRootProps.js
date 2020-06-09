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
		case 9: {
			return colors.activeTintOne;
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

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

import Theme from '../Theme';

const getLinkTextFontSize = (deviceWidth: number): number => {
	const {
		maxSizeTextButton,
		fontSizeFactorThree,
	} = Theme.Core;
	let infoFontSize = Math.floor(deviceWidth * fontSizeFactorThree);
	let maxFontSize = maxSizeTextButton - 2;
	return infoFontSize > maxFontSize ? maxFontSize : infoFontSize;
};

const getTextFieldTextFontSize = (deviceWidth: number): number => {
	const {
		maxSizeTextButton,
		fontSizeFactorFour,
	} = Theme.Core;
	let textFieldFontSize = Math.floor(deviceWidth * fontSizeFactorFour);
	let maxTextFieldFontSize = maxSizeTextButton - 4;
	return textFieldFontSize > maxTextFieldFontSize ? maxTextFieldFontSize : textFieldFontSize;
};

const getHeaderOneFontSize = (deviceWidth: number): number => {
	const {
		maxSizeTextButton,
		fontSizeFactorFive,
	} = Theme.Core;
	let headerFontSize = Math.floor(deviceWidth * fontSizeFactorFive);
	let maxFontSize = maxSizeTextButton + 4;
	return headerFontSize > maxFontSize ? maxFontSize : headerFontSize;
};

module.exports = {
	getLinkTextFontSize,
	getTextFieldTextFontSize,
	getHeaderOneFontSize,
};

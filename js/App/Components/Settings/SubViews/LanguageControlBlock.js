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
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import {
	DropDown,
} from '../../../../BaseComponents';

import { setAppLanguage } from '../../../Actions/App';
import {
	getLocale,
	getSupportedLanguages,
	getLanguageInfoFromLangCode,
	isDeviceLanguageAndHasChanged,
	isDeviceLanguage,
} from '../../../Lib/appUtils';

import i18n from '../../../Translations/common';

const LanguageControlBlock = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { layout, defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	let { language: languageProp = {} } = defaultSettings;

	const {
		dropDownContainerStyle,
		dropDownHeaderStyle,
		fontSize,
	} = getStyles(layout);

	const dispatch = useDispatch();
	function changeDeviceLanguage(value: string, itemIndex: number, data: Array<any>) {
		let language = data[itemIndex];
		if (isDeviceLanguage(language)) {
			const { value: cVal } = language;
			language = {
				...language,
				value: cVal.split('(')[0],
			};
		}
		dispatch(setAppLanguage({ ...language }));
	}

	const labelLanguage = formatMessage(i18n.labelLanguage);

	const LANGUAGES = getSupportedLanguages();
	let {value} = languageProp;
	const codeDevice = getLocale();
	let { nativeName } = getLanguageInfoFromLangCode(codeDevice) || {};
	let keyDevice = `${codeDevice}-device`;
	const deviceLang = {code: codeDevice, value: `${nativeName} (${formatMessage(i18n.labelDevicelanguage)})`, key: keyDevice};
	LANGUAGES.push(deviceLang);
	if (!languageProp.value || isDeviceLanguageAndHasChanged(languageProp)) {
		dispatch(setAppLanguage(deviceLang));
	}
	if (isDeviceLanguage(languageProp)) {
		const hasInfoText = value.indexOf('(') !== -1;
		if (!hasInfoText) {
			dispatch(setAppLanguage(deviceLang));
		}
	}

	return (
		<DropDown
			items={LANGUAGES}
			value={value}
			label={labelLanguage}
			onValueChange={changeDeviceLanguage}
			appLayout={layout}
			dropDownContainerStyle={dropDownContainerStyle}
			dropDownHeaderStyle={dropDownHeaderStyle}
			baseColor={'#000'}
			fontSize={fontSize}
			itemCount={LANGUAGES.length}
			accessibilityLabelPrefix={labelLanguage}
		/>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		dropDownContainerStyle: {
			marginBottom: fontSize / 2,
		},
		dropDownHeaderStyle: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: '#b5b5b5',
		},
		fontSize,
	};
};

export default LanguageControlBlock;

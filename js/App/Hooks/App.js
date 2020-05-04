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
import {
	createIntl,
	createIntlCache,
} from 'react-intl';
import { useSelector } from 'react-redux';
import * as RNLocalize from 'react-native-localize';
import { useIntl } from 'react-intl';

import {
	useDialogueBox,
} from './Dialoguebox';

import i18n from '../Translations/common';

let relativeIntls = {};

const useRelativeIntl = (gatewayTimezone?: string = RNLocalize.getTimeZone()): Object => {
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);

	if (relativeIntls[gatewayTimezone]) {
		return relativeIntls[gatewayTimezone];
	}

	let { language = {} } = defaultSettings;
	let locale = language.code;

	gatewayTimezone = gatewayTimezone;

	const cache = createIntlCache();
	relativeIntls[gatewayTimezone] = createIntl({
		locale,
		timeZone: gatewayTimezone,
	}, cache);

	return relativeIntls[gatewayTimezone];
};

const useNoInternetDialogue = (): Object => {

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	return {
		showDialogue: (dialogueHeaderIntl: string) => {
			toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.contentCannotAccessInfo),
				header: formatMessage(dialogueHeaderIntl),
				showPositive: true,
			});
		},
	};
};

module.exports = {
	useRelativeIntl,
	useNoInternetDialogue,
};

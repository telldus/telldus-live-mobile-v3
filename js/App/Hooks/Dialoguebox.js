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
	useCallback,
} from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	toggleDialogueBoxState,
} from '../Actions/Modal';

import i18n from '../Translations/common';

type DialogueData = {
    show: boolean,
    showHeader?: boolean,
    imageHeader?: boolean,
    text: string,
	backdropOpacity?: number,
	showIconOnHeader?: boolean,
	header?: string,
	onPressHeader?: () => void,
	onPressHeaderIcon?: () => void,
	entryDuration?: number,
	exitDuration?: number,
	showPositive: boolean,
	showNegative: boolean,
	positiveText?: string,
	negativeText?: string,
	onPressPositive?: () => void,
	onPressNegative?: () => void,
	accessibilityLabel?: string,
	style?: Array<any> | Object,
	backdropColor?: string,
	capitalizeHeader?: boolean,
	negTextColor?: string,
	posTextColor?: string,
};

/**
 *
 * Use this hook to control root 'DialogueBox' from components(functional) which does not have
 * access to 'screenProps.toggleDialogueBox'.
 *
 */
const useDialogueBox = (): Object => {
	const dispatch = useDispatch();
	return {
		toggleDialogueBoxState: useCallback((dialogueData: DialogueData) => {
			const {
				show,
				...others
			} = dialogueData;
			if (show) {
				dispatch(toggleDialogueBoxState({
					...others,
					openModal: true,
				}));
			} else {
				dispatch(toggleDialogueBoxState({
					...others,
					openModal: false,
				}));
			}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	};
};

const useNoPremiumDialogue = (): Object => {

	const {
		toggleDialogueBoxState: _toggleDialogueBoxState,
	} = useDialogueBox();

	const intl = useIntl();
	const {
		formatMessage,
	} = intl;

	return {
		showDialogue: (dialogueHeaderIntl: string) => {
			_toggleDialogueBoxState({
				show: true,
				showHeader: true,
				imageHeader: true,
				text: formatMessage(i18n.infoWhenAccessPremFromBasic),
				header: formatMessage(dialogueHeaderIntl),
				showPositive: true,
			});
		},
	};
};

module.exports = {
	useDialogueBox,
	useNoPremiumDialogue,
};

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

import React from 'react';
import {
	TouchableOpacity,
} from 'react-native';
import { useIntl } from 'react-intl';

import {
	ThemedMaterialIcon,
} from '../../../../BaseComponents';

import {
	useDialogueBox,
} from '../../../Hooks/Dialoguebox';

import i18n from '../../../Translations/common';

const InfoActionQueuedOnWakeUp = (props: Object): Object => {
	const {
		iconStyle,
	} = props;

	const {
		toggleDialogueBoxState,
	} = useDialogueBox();
	const {
		formatMessage,
	} = useIntl();

	const onPress = React.useCallback(() => {
		toggleDialogueBoxState({
			show: true,
			showHeader: true,
			text: formatMessage(i18n.settingInQueueInfo),
			header: formatMessage(i18n.settingInQueueHeader),
			showPositive: true,
			positiveText: null,
			showNegative: false,
		});
	}, [formatMessage, toggleDialogueBoxState]);

	return (
		<TouchableOpacity
			onPress={onPress}>
			<ThemedMaterialIcon
				name="info"
				style={iconStyle}/>
		</TouchableOpacity>
	);
};

export default (React.memo<Object>(InfoActionQueuedOnWakeUp): Object);


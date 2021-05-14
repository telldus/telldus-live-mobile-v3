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
	useNetInfo,
} from '@react-native-community/netinfo';

import {
	Text,
} from '../../../../BaseComponents';

import {
	useNoInternetDialogue,
} from '../../../Hooks/App';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';
import { toggleVisibilityEula } from '../../../Actions/User';

const EulaLink = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);

	const netInfo = useNetInfo();

	const {
		showDialogue,
	} = useNoInternetDialogue();

	const {
		buttonResubmit,
	} = getStyles(layout);

	const dispatch = useDispatch();
	function onPressEula() {
		if (!netInfo.isConnected) {
			showDialogue(i18n.eula);
			return;
		}
		dispatch(toggleVisibilityEula(true));
	}

	return (
		<Text
			level={36}
			onPress={onPressEula}
			style={buttonResubmit}>
			{formatMessage(i18n.eula)}
		</Text>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		fontSizeFactorEight,
	} = Theme.Core;
	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		buttonResubmit: {
			fontSize,
			alignSelf: 'center',
			paddingVertical: 5,
			marginBottom: fontSize / 2,
		},
	};
};

export default (React.memo<Object>(EulaLink): Object);

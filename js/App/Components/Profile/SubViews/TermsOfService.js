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
import {
	Linking,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
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

const TermsOfService = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);

	const netInfo = useNetInfo();

	const {
		showDialogue,
	} = useNoInternetDialogue();

	const {
		buttonResubmit,
	} = getStyles(layout);

	function onPressPP() {
		if (netInfo.isConnected === null || !netInfo.isConnected) {
			showDialogue(i18n.privacyPolicy);
			return;
		}
		const url = 'https://telld.us/eula';
		Linking.canOpenURL(url).then((supported: boolean): any => {
			if (!supported) {
			  console.log(`Can't handle url: ${url}`);
			} else {
			  return Linking.openURL(url);
			}
		  }).catch((err: Object) => {
			  console.error('An error occurred', err);
		  });
	}

	return (
		<Text
			level={36}
			onPress={onPressPP}
			style={buttonResubmit}>
			{formatMessage(i18n.termsOfService)}
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
		},
	};
};

export default (React.memo<Object>(TermsOfService): Object);

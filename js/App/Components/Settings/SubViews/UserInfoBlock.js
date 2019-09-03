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
import { useSelector } from 'react-redux';
import firebase from 'react-native-firebase';

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';

const UserInfoBlock = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { app: {layout}, user: {userProfile: {email}} } = useSelector((state: Object): Object => state);

	const {
		fontSize,
	} = getStyles(layout);

	const testCrash = () => {
		firebase.crashlytics().crash();
	};

	const titleUserInfo = `${formatMessage(i18n.titleUserInfo)}:`;
	const labelLoggedUser = formatMessage(i18n.labelLoggedUser);

	return (
		<TitledInfoBlock
			title={titleUserInfo}
			label={labelLoggedUser}
			value={email}
			fontSize={fontSize}
			onPress={email === 'developer@telldus.com' ? testCrash : null}
		/>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const fontSize = Math.floor(deviceWidth * 0.045);

	return {
		fontSize,
	};
};

export default UserInfoBlock;

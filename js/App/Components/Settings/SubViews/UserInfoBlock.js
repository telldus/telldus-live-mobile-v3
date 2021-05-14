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

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

import {
	deployStore,
} from '../../../../Config';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

const UserInfoBlock = (props: Object): Object => {
	const { blockContainerStyle } = props;
	const { formatMessage } = useIntl();

	const { app: {layout}, user: {userProfile: {email}} } = useSelector((state: Object): Object => state);

	const {
		fontSize,
	} = getStyles(layout);

	const testCrash = React.useCallback(() => {
		if (deployStore !== 'huawei') {
			// $FlowFixMe
			firebase.crashlytics().crash();// eslint-disable-line no-undef
		}
	}, []);

	const titleUserInfo = `${formatMessage(i18n.titleUserInfo)}:`;
	const labelLoggedUser = formatMessage(i18n.labelLoggedUser);

	return (
		<TitledInfoBlock
			title={titleUserInfo}
			label={labelLoggedUser}
			value={email}
			fontSize={fontSize}
			onPress={email === 'developer@telldus.com' ? testCrash : null}
			blockContainerStyle={blockContainerStyle}
		/>
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
		fontSize,
	};
};

export default (React.memo<Object>(UserInfoBlock): Object);

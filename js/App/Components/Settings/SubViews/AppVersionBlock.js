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
import DeviceInfo from 'react-native-device-info';

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

const AppVersionBlock = (props: Object): Object => {
	const { formatMessage } = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		fontSize,
	} = getStyles(layout);

	const version = DeviceInfo.getVersion();

	return (
		<TitledInfoBlock
			title={formatMessage(i18n.titleAppInfo)}
			label={formatMessage(i18n.version)}
			value={version}
			fontSize={fontSize}
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

export default (React.memo<Object>(AppVersionBlock): Object);

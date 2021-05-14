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

import React, {
	useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	TitledInfoBlock,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

const UpdatePasswordBlock = (props: Object): Object => {
	const { navigation } = props;

	const {layout} = useSelector((state: Object): Object => state.app);

	const { formatMessage } = useIntl();

	const {
		fontSize,
	} = getStyles(layout);

	const onPress = useCallback(() => {
		(() => {
			navigation.navigate('UpdatePasswordScreen');
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<TitledInfoBlock
			label={formatMessage(i18n.changePassword)}
			fontSize={fontSize}
			icon={'angle-right'}
			onPress={onPress}
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

export default (React.memo<Object>(UpdatePasswordBlock): Object);

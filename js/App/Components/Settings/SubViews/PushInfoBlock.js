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
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import {
	TitledInfoBlock,
	Text,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

import {
	deployStore,
} from '../../../../Config';

const PushInfoBlock = (props: Object): Object => {
	const { navigation, submitPushToken, isPushSubmitLoading } = props;
	const { formatMessage } = useIntl();

	const { user: { phonesList = {} }, app: { layout } } = useSelector((state: Object): Object => state);

	const {
		fontSize,
		buttonResubmit,
	} = getStyles(layout);

	const phones = Object.keys(phonesList).length;
	const labelPush = formatMessage(i18n.labelPushRegistered, {value: phones});

	const onPressPushSettings = useCallback(() => {
		(() => {
			navigation.navigate('PushSettings');
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isHuaweiBuild = deployStore === 'huawei';

	const submitButText = isPushSubmitLoading ? `${formatMessage(i18n.pushRegisters)}...` : formatMessage(i18n.pushReRegisterPush);

	return (
		<>
			<TitledInfoBlock
				title={formatMessage(i18n.titlePush)}
				label={labelPush}
				icon={'angle-right'}
				fontSize={fontSize}
				onPress={onPressPushSettings}
			/>
			{(!(phones > 0) && !isHuaweiBuild) && (
				<Text
					level={23}
					onPress={submitPushToken}
					style={buttonResubmit}>
					{submitButText}
				</Text>
			)}
		</>
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
		buttonResubmit: {
			fontSize,
			alignSelf: 'center',
			paddingVertical: 5,
			marginBottom: fontSize / 2,
		},
	};
};

export default (React.memo<Object>(PushInfoBlock): Object);

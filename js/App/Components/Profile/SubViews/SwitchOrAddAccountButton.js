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
	TouchableButton,
} from '../../../../BaseComponents';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

import {
	useSwitchOrAddAccountAction,
} from '../../../Hooks/App';

type Props = {
	disabled: boolean,
};

const SwitchOrAddAccountButton = (props: Props): Object => {
	const {
		disabled,
	} = props;
	const { formatMessage } = useIntl();

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		buttonStyle,
	} = getStyles(layout);

	const {
		performAddOrSwitch,
	} = useSwitchOrAddAccountAction();

	const onPress = React.useCallback(() => {
		performAddOrSwitch();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [performAddOrSwitch]);

	return (
		<TouchableButton
			disabled={disabled}
			style={buttonStyle}
			onPress={onPress}
			text={formatMessage(i18n.switchOrAddAccount)}/>
	);
};

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		buttonStyle: {
			marginTop: padding,
			width: deviceWidth * 0.9,
		},
	};
};

export default (React.memo<Object>(SwitchOrAddAccountButton): Object);

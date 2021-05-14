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

import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import {
	TouchableButton,
} from '../../../../BaseComponents';

import { unregisterPushToken, logoutFromTelldus } from '../../../Actions';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

const LogoutAllAccButton = React.memo<Object>((props: Object): Object => {
	const { toggleDialogueBox, buttonAccessibleProp = true, label, isLoggingOut } = props;
	const { formatMessage } = useIntl();

	const { user: { pushToken }, app: { layout } } = useSelector((state: Object): Object => state);

	const {
		buttonStyle,
	} = getStyles(layout);

	const dispatch = useDispatch();
	const [ loadingAndPushRegStatus, setLoadingAndPushRegStatus ] = useState({loading: false, pushRegStatus: true});
	function onConfirmLogout() {
		setLoadingAndPushRegStatus({loading: true, pushRegStatus: true});
		dispatch(unregisterPushToken(pushToken, true)).then(() => {
			setLoadingAndPushRegStatus({loading: false, pushRegStatus: false});
		}).catch(() => {
			setLoadingAndPushRegStatus({loading: false, pushRegStatus: false});
		});
	}
	const { loading, pushRegStatus } = loadingAndPushRegStatus;

	if (!loading && !pushRegStatus) {
		dispatch(logoutFromTelldus());
	}

	function logout() {
		toggleDialogueBox({
			show: true,
			showHeader: true,
			header: `${formatMessage(i18n.logout)}?`,
			text: formatMessage(i18n.contentLogoutConfirm),
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.logout),
			onPressPositive: onConfirmLogout,
			closeOnPressPositive: true,
		});
	}

	const labelButton = formatMessage(i18n.button);
	const labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	const labelLogOut = `${label} ${labelButton}. ${labelButtondefaultDescription}`;

	const logoutButText = loading ? formatMessage(i18n.loggingout) : label;

	const buttonAccessible = !loading && buttonAccessibleProp;

	return (
		<TouchableButton
			onPress={loading ? null : logout}
			text={logoutButText}
			postScript={loading ? '...' : null}
			accessibilityLabel={labelLogOut}
			accessible={buttonAccessible}
			style={buttonStyle}
			disabled={isLoggingOut || loading}
		/>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const padding = deviceWidth * paddingFactor;

	return {
		fontSize,
		buttonStyle: {
			marginTop: padding,
			width: width * 0.9,
		},
	};
};

export default (LogoutAllAccButton: Object);

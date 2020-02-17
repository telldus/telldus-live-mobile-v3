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

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

const LogoutButton = (props: Object): Object => {
	const {
		toggleDialogueBox,
		buttonAccessibleProp = true,
		onConfirmLogout: onConfirmLogoutP,
		showActionSheet,
		loading = false,
	} = props;
	const { formatMessage } = useIntl();

	const { app: { layout } } = useSelector((state: Object): Object => state);

	const {
		buttonStyle,
	} = getStyles(layout);

	function onConfirmLogout() {
		onConfirmLogoutP();
		showActionSheet();
	}

	function logout() {
		toggleDialogueBox({
			show: true,
			showHeader: true,
			notificationHeader: `${formatMessage(i18n.logout)}?`,
			text: formatMessage(i18n.contentLogoutConfirm),
			showPositive: true,
			showNegative: true,
			positiveText: formatMessage(i18n.logout).toUpperCase(),
			onPressPositive: onConfirmLogout,
			closeOnPressPositive: true,
			timeoutToCallPositive: 400,
		});
	}

	const labelButton = formatMessage(i18n.button);
	const labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	const labelLogOut = `${formatMessage(i18n.labelLogOut)} ${labelButton}. ${labelButtondefaultDescription}`;

	const logoutButText = loading ? formatMessage(i18n.loggingout) : formatMessage(i18n.labelLogOut);

	const buttonAccessible = !loading && buttonAccessibleProp;

	return (
		<TouchableButton
			onPress={loading ? null : logout}
			text={logoutButText}
			postScript={loading ? '...' : null}
			accessibilityLabel={labelLogOut}
			accessible={buttonAccessible}
			style={buttonStyle}
		/>
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
			width: width * 0.9,
		},
	};
};

export default LogoutButton;

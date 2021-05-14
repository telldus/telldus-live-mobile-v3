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

import React, { useCallback } from 'react';
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
		isLoggingOut = false,
		label,
		postScript,
	} = props;
	const { formatMessage } = useIntl();

	const { app: { layout } } = useSelector((state: Object): Object => state);

	const {
		buttonStyle,
	} = getStyles(layout);

	const logout = useCallback(() => {
		function onConfirmLogout() {
			onConfirmLogoutP();
		}

		(() => {
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
				timeoutToCallPositive: 400,
			});
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onConfirmLogoutP]);

	const labelButton = formatMessage(i18n.button);
	const labelButtondefaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
	const labelLogOut = `${label} ${labelButton}. ${labelButtondefaultDescription}`;

	const logoutButText = isLoggingOut ? formatMessage(i18n.loggingout) : label;

	const buttonAccessible = !isLoggingOut && buttonAccessibleProp;

	return (
		<TouchableButton
			onPress={isLoggingOut ? null : logout}
			text={logoutButText}
			postScript={isLoggingOut ? '...' : postScript}
			accessibilityLabel={labelLogOut}
			accessible={buttonAccessible}
			style={buttonStyle}
			textProps={{
				numberOfLines: 1,
			}}
			disabled={isLoggingOut}
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

export default (React.memo<Object>(LogoutButton): Object);

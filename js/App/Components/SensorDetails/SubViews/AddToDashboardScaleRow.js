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
 */

// @flow

'use strict';
import React, {
	memo,
	useCallback,
} from 'react';

import {
	SettingsRow,
} from '../../../../BaseComponents';

type Props = {
    label: string,
    value: boolean,
    appLayout: Object,
    intl: Object,
    contentCoverStyle: Object,
    switchStyle: Object,
    onValueChange: Function,
    scaleId: string,
};

const AddToDashboardScaleRow = memo<Object>((props: Props): Object => {

	const {
		label,
		value,
		appLayout,
		intl,
		contentCoverStyle,
		switchStyle,
		onValueChange,
		scaleId,
	} = props;

	const _onValueChange = useCallback((v: boolean) => {
		onValueChange(scaleId, v);
	}, [onValueChange, scaleId]);

	return (
		<SettingsRow
			style={contentCoverStyle}
			label={label}
			onValueChange={_onValueChange}
			value={value}
			appLayout={appLayout}
			intl={intl}
			switchStyle={switchStyle}
		/>
	);
});

export default (AddToDashboardScaleRow: Object);

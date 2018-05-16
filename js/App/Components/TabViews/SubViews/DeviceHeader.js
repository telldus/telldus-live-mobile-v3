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

import React from 'react';
import { View, Text } from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
	gateway: Object,
	appLayout: Object,
};

export default ({ gateway, appLayout }: Props ): Object => {
	let { height, width } = appLayout;
	let isPortrait = height > width;
	let deviceWidth = isPortrait ? width : height;

	let {
		maxSizeRowTextOne,
	} = Theme.Core;

	let nameFontSize = Math.floor(deviceWidth * 0.047);
	nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

	return (
		<View style={Theme.Styles.sectionHeader}>
			<Text style={[Theme.Styles.sectionHeaderText, { fontSize: nameFontSize }]}>
				{gateway}
			</Text>
		</View>
	);
};

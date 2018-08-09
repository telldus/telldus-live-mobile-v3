
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

import React, { PureComponent } from 'react';
import { defineMessages } from 'react-intl';

import {
	View,
	FormattedMessage,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

const messages = defineMessages({
	noHistoryHeader: {
		id: 'sensor.noHistoryHeader',
		defaultMessage: 'No history recorded yet',
	},
	noHistoryContent: {
		id: 'sensor.noHistoryContent',
		defaultMessage: 'History is enabled but no data has been collected yet. Please check back later.',
	},
});

type Props = {
    width: number,
};

export default class NoHistory extends PureComponent<Props, null> {
props: Props;

constructor(props: Props) {
	super();
}

render(): Object {
	const { width } = this.props;
	const {
		container,
		headerStyle,
		contentStyle,
	} = this.getStyles(width);

	return (
		<View style={container}>
			<FormattedMessage
				{...messages.noHistoryHeader}
				style={headerStyle}/>
			<FormattedMessage
				{...messages.noHistoryContent}
				style={contentStyle}/>
		</View>
	);
}

getStyles(width: number): Object {
	const { eulaContentColor, rowTextColor, fonts } = Theme.Core;
	const fontSizeH = width * 0.07;
	const fontSizeC = width * 0.045;
	return {
		container: {
			flex: 1,
			paddingTop: 30,
			paddingHorizontal: 25,
			alignItems: 'center',
		},
		headerStyle: {
			color: eulaContentColor,
			fontFamily: fonts.robotoRegular,
			fontSize: fontSizeH,
			marginBottom: 10,
			textAlign: 'center',
			paddingHorizontal: 5,
		},
		contentStyle: {
			color: rowTextColor,
			fontFamily: fonts.sfnsDisplay,
			fontSize: fontSizeC,
			textAlign: 'center',
		},
	};
}
}


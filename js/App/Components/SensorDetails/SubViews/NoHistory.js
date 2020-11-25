
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

import {
	View,
	FormattedMessage,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

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
		<View
			level={3}
			style={container}>
			<FormattedMessage
				level={4}
				{...i18n.noHistoryHeader}
				style={headerStyle}/>
			<FormattedMessage
				level={26}
				{...i18n.noHistoryContent}
				style={contentStyle}/>
		</View>
	);
}

getStyles(width: number): Object {
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
			fontSize: fontSizeH,
			marginBottom: 10,
			textAlign: 'center',
			paddingHorizontal: 5,
		},
		contentStyle: {
			fontSize: fontSizeC,
			textAlign: 'center',
		},
	};
}
}


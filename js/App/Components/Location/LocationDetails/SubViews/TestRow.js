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

import {
	View,
	Text,
	IconTelldus,
	Throbber,
} from '../../../../../BaseComponents';

import shouldUpdate from '../../../../Lib/shouldUpdate';

import Theme from '../../../../Theme';

type Props = {
	appLayout: Object,
    icon: string,
    h1: string,
	h2: string,
	index: number,
	status: string | null,
};

class TestRow extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return shouldUpdate(this.props, nextProps, [
		'h1',
		'h2',
		'icon',
		'status',
		'appLayout',
	]);
}

render(testData: Object): Object {
	const {
		h1,
		h2,
		icon,
		appLayout,
		index,
		status,
	} = this.props;
	const {
		testRowHCover,
		testRowCover,
		iconStyle,
		h1Style,
		h2Style,
		throbberStyle,
	} = this.getStyles(appLayout);

	return (
		<View key={index} style={[testRowCover, {
			marginTop: index !== 0 ? 10 : 0,
		}]}>
			{status === 'running' ?
				<Throbber
					throbberContainerStyle={throbberStyle}/>
				:
				<IconTelldus icon={icon} style={iconStyle}/>
			}
			<View key={index} style={testRowHCover}>
				<Text style={h1Style}>
					{h1}
				</Text>
				<Text style={h2Style}>
					{h2}
				</Text>
			</View>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { status } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { brandSecondary, rowTextColor, brandSuccess, sunsetColor } = Theme.Core;

	const iconSize = Math.floor(deviceWidth * 0.09);
	const h1Size = Math.floor(deviceWidth * 0.05);
	const h2Size = Math.floor(deviceWidth * 0.035);

	const iconColor = status === 'ok' ? brandSuccess :
		status === 'fail' ? sunsetColor : brandSecondary;

	return {
		testRowCover: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		testRowHCover: {
			flexDirection: 'column',
			marginLeft: 10,
		},
		iconStyle: {
			fontSize: iconSize,
			color: iconColor,
		},
		h1Style: {
			fontSize: h1Size,
			color: brandSecondary,
		},
		h2Style: {
			fontSize: h2Size,
			color: rowTextColor,
		},
		throbberStyle: {
			position: 'relative',
			fontSize: iconSize,
		},
	};
}
}

export default TestRow;

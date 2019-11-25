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

import View from './View';
import BlockIcon from './BlockIcon';
import RowWithTriangle from './RowWithTriangle';
import Theme from '../App/Theme';
import Text from './Text';

import {
	useRelativeIntl,
} from '../App/Hooks/App';

type Props = {
	children: any,
	roundIcon?: string,
	roundIconStyle?: Object | number | Array<any>,
	roundIconContainerStyle?: Object | number | Array<any>,
	time?: Date | number,
	timeFormat?: Object,
	timeStyle?: Object | number | Array<any>,
	containerStyle?: Object | number | Array<any>,
	rowContainerStyle?: Object | number | Array<any>,
	timeContainerStyle?: Object | number | Array<any>,
	rowStyle?: Object,
	isFirst?: boolean,
	triangleColor?: string,
	appLayout: Object,
	iconBackgroundMask?: boolean,
	iconBackgroundMaskStyle?: number | Object | Array<any>,
	rowWithTriangleContainerStyle?: number | Object | Array<any>,
	triangleContainerStyle?: number | Object | Array<any>,
	triangleStyle?: number | Object | Array<any>,
	gatewayTimezone?: string,
	appLayout: Object,
};

const ListRow = (props: Props): Object => {

	const {
		children,
		roundIcon,
		roundIconStyle,
		roundIconContainerStyle,
		time,
		timeStyle,
		timeContainerStyle,
		containerStyle,
		rowContainerStyle,
		rowStyle,
		triangleColor,
		timeFormat,
		iconBackgroundMask,
		iconBackgroundMaskStyle,
		rowWithTriangleContainerStyle,
		triangleStyle,
		triangleContainerStyle,
		gatewayTimezone,
		isFirst,
		appLayout,
	} = props;

	const style = _getStyle();

	let formattedTime;
	const {
		formatTime,
	} = useRelativeIntl(gatewayTimezone);
	if (time) {
		formattedTime = formatTime(time, {
			localeMatcher: 'best fit',
			formatMatcher: 'best fit',
			...timeFormat,
		});
	}

	return (
		<View style={[style.container, containerStyle]} accessible={false} importantForAccessibility={'no-hide-descendants'}>
			<BlockIcon
				icon={roundIcon}
				containerStyle={[style.roundIconContainer, roundIconContainerStyle]}
				style={roundIconStyle}
				backgroundMask={iconBackgroundMask}
				backgroundMaskStyle={iconBackgroundMaskStyle}
			/>
			{!!formattedTime && (
				<View style={timeContainerStyle}>
					<Text
						style={[style.time, timeStyle]}>
						{formattedTime}
					</Text>
				</View>

			)}
			<RowWithTriangle
				layout={'row'}
				triangleColor={triangleColor}
				containerStyle={rowContainerStyle}
				rowWithTriangleContainerStyle={rowWithTriangleContainerStyle}
				triangleStyle={triangleStyle}
				triangleContainerStyle={triangleContainerStyle}
				style={rowStyle}
			>
				{children}
			</RowWithTriangle>
		</View>
	);

	function _getStyle(): Object {
		let isPortrait = appLayout.height > appLayout.width;

		const deviceWidth = appLayout.width;
		const deviceHeight = appLayout.height;

		const roundIconWidth = isPortrait ? deviceWidth * 0.061333333 : deviceHeight * 0.061333333;

		const padding = isPortrait ? deviceWidth * 0.013333333 : deviceHeight * 0.013333333;
		const paddingFirst = isPortrait ? deviceWidth * 0.037333333 : deviceHeight * 0.037333333;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: isFirst ? paddingFirst : padding,
				paddingBottom: padding,
			},
			roundIconContainer: {
				backgroundColor: '#929292',
				aspectRatio: 1,
				width: roundIconWidth,
				borderRadius: roundIconWidth / 2,
			},
			time: {
				color: '#707070',
				fontSize: Math.floor(deviceWidth * 0.046666667),
				fontFamily: Theme.Core.fonts.robotoMedium,
				textAlign: 'center',
			},
		};
	}

};

ListRow.defaultProps = {
	isFirst: false,
	timeFormat: {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	},
};

export default ListRow;

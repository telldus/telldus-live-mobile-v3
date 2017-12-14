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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import View from './View';
import FormattedTime from './FormattedTime';
import BlockIcon from './BlockIcon';
import RowWithTriangle from './RowWithTriangle';
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';

type Props = {
	children: any,
	roundIcon?: string,
	roundIconStyle?: Object | number,
	roundIconContainerStyle?: Object | number,
	time?: Date | number,
	timeFormat?: Object,
	timeStyle?: Object | number,
	containerStyle?: Object | number,
	rowContainerStyle?: Object | number,
	rowStyle?: Object,
	isFirst?: boolean,
	triangleColor?: string,
};

type DefaultProps = {
	isFirst: boolean,
	timeFormat: {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	},
};

export default class ListRow extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.node.isRequired,
		roundIcon: PropTypes.string,
		roundIconStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		roundIconContainerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		time: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
		timeFormat: PropTypes.object,
		timeStyle: PropTypes.object,
		containerStyle: PropTypes.object,
		rowContainerStyle: PropTypes.object,
		rowStyle: PropTypes.object,
		isFirst: PropTypes.bool,
		triangleColor: PropTypes.string,
	};

	static defaultProps: DefaultProps = {
		isFirst: false,
		timeFormat: {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		},
	};

	render(): Object {
		const {
			children,
			roundIcon,
			roundIconStyle,
			roundIconContainerStyle,
			time,
			timeStyle,
			containerStyle,
			rowContainerStyle,
			rowStyle,
			triangleColor,
			timeFormat,
		} = this.props;

		const style = this._getStyle();

		return (
			<View style={[style.container, containerStyle]}>
				<BlockIcon
					icon={roundIcon}
					containerStyle={[style.roundIconContainer, roundIconContainerStyle]}
					style={roundIconStyle}
				/>
				{!!time && (
					<FormattedTime
						value={time}
						localeMatcher= "best fit"
						formatMatcher= "best fit"
						{...timeFormat}
						style={[style.time, timeStyle]} />

				)}
				<RowWithTriangle
					layout={'row'}
					triangleColor={triangleColor}
					containerStyle={rowContainerStyle}
					style={rowStyle}
				>
					{children}
				</RowWithTriangle>
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const roundIconWidth = deviceWidth * 0.061333333;

		const padding = deviceWidth * 0.013333333;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: this.props.isFirst ? deviceWidth * 0.037333333 : padding,
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
	};

}

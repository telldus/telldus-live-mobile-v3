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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import View from './View';
import FormattedTime from './FormattedTime';
import BlockIcon from './BlockIcon';
import RowWithTriangle from './RowWithTriangle';
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
	timeContainerStyle?: Object | number,
	rowStyle?: Object,
	isFirst?: boolean,
	triangleColor?: string,
	appLayout: Object,
};

type DefaultProps = {
	isFirst: boolean,
	timeFormat: {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	},
};

class ListRow extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.node.isRequired,
		roundIcon: PropTypes.string,
		roundIconStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		roundIconContainerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		time: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
		timeFormat: PropTypes.object,
		timeStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		timeContainerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		rowContainerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		rowStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
		isFirst: PropTypes.bool,
		triangleColor: PropTypes.string,
		appLayout: PropTypes.object,
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
			timeContainerStyle,
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
					<View style={timeContainerStyle}>
						<FormattedTime
							value={time}
							localeMatcher= "best fit"
							formatMatcher= "best fit"
							{...timeFormat}
							style={[style.time, timeStyle]} />
					</View>

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
		let { appLayout } = this.props;
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
				paddingTop: this.props.isFirst ? paddingFirst : padding,
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

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.App.layout,
	};
}

module.exports = connect(mapStateToProps, null)(ListRow);

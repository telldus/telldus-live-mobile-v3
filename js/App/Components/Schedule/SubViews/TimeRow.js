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

import React, { PropTypes } from 'react';
import { View } from 'react-native';
import { BlockIcon, IconTelldus } from 'BaseComponents';
import Row from './Row';
import Description from './Description';
import Theme from 'Theme';
import getDeviceWidth from '../../../Lib/getDeviceWidth';
import capitalize from '../../../Lib/capitalize';

type Time = {
	hour: number,
	minute: number,
};

type Props = {
	type: string,
	time: Time,
	offset?: number,
	randomInterval?: number,
	containerStyle?: Object,
};

export default class TimeRow extends View<null, Props, null> {

	static propTypes = {
		type: PropTypes.string.isRequired,
		time: PropTypes.objectOf(PropTypes.number).isRequired,
		offset: PropTypes.number,
		randomInterval: PropTypes.number,
		containerStyle: View.propTypes.style,
	};

	render() {
		const { type, time, offset, randomInterval, containerStyle } = this.props;
		const { blockIcon, textWrapper, title, iconRow, icon, description } = this._getStyle();

		const offsetIcon = offset ? 'offset' : null;
		const randomIcon = randomInterval ? 'random' : null;

		return (
			<Row layout="row" containerStyle={containerStyle}>
				<BlockIcon
					icon={type}
					size={blockIcon.size}
					color={blockIcon.color}
					bgColor="transparent"
					style={blockIcon.style}
				/>
				<View style={textWrapper}>
					<Description style={title}>
						{`${capitalize(type)} ${this._formatTime(time, type)}`}
					</Description>
					{!!offset && (
						<View style={iconRow}>
							<IconTelldus icon={offsetIcon} style={icon}/>
							<Description style={description}>
								{`Offset ${offset} min`}
							</Description>
						</View>
					)}
					{!!randomInterval && (
						<View style={iconRow}>
							<IconTelldus icon={randomIcon} style={icon}/>
							<Description style={description}>
								{`Random interval ${randomInterval} min`}
							</Description>
						</View>
					)}
				</View>
			</Row>
		);
	}

	_formatTime = (time: Time, type: string): string => {
		if (type !== 'time' && (time.hour === 0 && time.minute === 0)) {
			return '(––:––)';
		}

		const hour = this._formatTimeValue(time.hour);
		const minute = this._formatTimeValue(time.minute);

		return `(${hour}:${minute})`;
	};

	_formatTimeValue = (value: number): string => {
		return value > 10 ? value.toString() : `0${value}`;
	};

	_getStyle = (): Object => {
		const { offset, randomInterval } = this.props;
		const deviceWidth = getDeviceWidth();

		const size = deviceWidth * 0.196;

		return {
			blockIcon: {
				size,
				color: Theme.Core[`${this.props.type}Color`],
				style: {
					width: deviceWidth * 0.2156,
				},
			},
			textWrapper: {
				justifyContent: 'center',
				marginLeft: deviceWidth * 0.068,
			},
			title: {
				fontSize: deviceWidth * 0.064,
				marginBottom: (offset || randomInterval) ? deviceWidth * 0.016 : null,
			},
			iconRow: {
				alignItems: 'center',
				flexDirection: 'row',
			},
			icon: {
				marginRight: deviceWidth * 0.016,
			},
			description: {
				fontSize: deviceWidth * 0.036,
			},
		};
	};

}

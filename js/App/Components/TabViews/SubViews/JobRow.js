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
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { BlockIcon, IconTelldus, ListRow, View, Text, FormattedTime } from '../../../../BaseComponents';
import Theme from '../../../Theme';
import { ACTIONS, Description, TextRowWrapper, Title } from 'Schedule_SubViews';
import { capitalize, getSelectedDays, getWeekdays, getWeekends, getRelativeDimensions } from '../../../Lib';
import { DAYS } from '../../../../Constants';
import type { Schedule } from 'Reducers_Schedule';

type Props = {
	active: boolean,
	device: Object,
	method: number,
	methodValue: number,
	effectiveHour: string,
	effectiveMinute: string,
	offset: number,
	randomInterval: number,
	type: string,
	weekdays: number[],
	isFirst: boolean,
	editJob: (schedule: Schedule) => void,
	appLayout: Object,
};

class JobRow extends View<null, Props, null> {

	static propTypes = {
		id: PropTypes.number.isRequired,
		deviceId: PropTypes.number.isRequired,
		active: PropTypes.bool.isRequired,
		device: PropTypes.object.isRequired,
		method: PropTypes.number.isRequired,
		methodValue: PropTypes.number.isRequired,
		hour: PropTypes.number.isRequired,
		effectiveHour: PropTypes.string.isRequired,
		minute: PropTypes.number.isRequired,
		effectiveMinute: PropTypes.string.isRequired,
		offset: PropTypes.number.isRequired,
		randomInterval: PropTypes.number.isRequired,
		type: PropTypes.string.isRequired,
		weekdays: PropTypes.arrayOf(PropTypes.number).isRequired,
		isFirst: PropTypes.bool.isRequired,
		editJob: PropTypes.func.isRequired,
	};

	editJob = () => {
		const {
			editJob,
			id,
			deviceId,
			method,
			methodValue,
			type,
			hour,
			minute,
			offset,
			randomInterval,
			active,
			weekdays,
		} = this.props;

		const schedule: Schedule = {
			id,
			deviceId,
			method,
			methodValue,
			type,
			hour,
			minute,
			offset,
			randomInterval,
			active,
			weekdays,
		};

		editJob(schedule);
	};

	render(): React$Element<any> | null {
		if (!this.props.device) {
			return null;
		}

		const {
			type,
			effectiveHour,
			effectiveMinute,
			device,
			offset,
			randomInterval,
			active,
			isFirst,
			editJob,
			appLayout,
		} = this.props;

		const {
			container,
			textWrapper,
			title,
			description,
			iconOffset,
			iconRandom,
			methodIconContainer,
			roundIcon,
			time,
			rowContainer,
			roundIconContainer,
		} = this._getStyle(appLayout);

		const repeat = this._getRepeatDescription();
		let date = `01/01/2017 ${effectiveHour}:${effectiveMinute}`;
		let timestamp = Date.parse(date);

		return (
			<TouchableOpacity
				style={container}
				onPress={this.editJob}
				disabled={!editJob}
			>
				<ListRow
					roundIcon={type}
					roundIconStyle={roundIcon}
					roundIconContainerStyle={roundIconContainer}
					time={timestamp}
					timeFormat= {{
						hour: 'numeric',
						minute: 'numeric',
					}}
					timeStyle={time}
					rowContainerStyle={rowContainer}
					containerStyle={{ opacity: active ? 1 : 0.5 }}
					triangleColor={methodIconContainer.backgroundColor}
					isFirst={isFirst}
				>
					{this._renderActionIcon()}
					<TextRowWrapper style={textWrapper}>
						<Title numberOfLines={1} ellipsizeMode="tail" style={title}>
							{device.name}
						</Title>
						<Description numberOfLines={1} ellipsizeMode="tail" style={description}>
							{repeat}
							{type === 'time' && (
								<FormattedTime
									value={timestamp}
									hour="numeric"
									minute="numeric"
									style={description}
								/>)
							}
						</Description>
					</TextRowWrapper>
					{!!offset && (
						<IconTelldus
							icon="offset"
							style={iconOffset}
						/>
					)}
					{!!randomInterval && (
						<IconTelldus
							icon="random"
							style={iconRandom}
						/>
					)}
				</ListRow>
			</TouchableOpacity>
		);
	}

	_renderActionIcon = (): Object | null => {
		const action = ACTIONS.find((a: Object): boolean => a.method === this.props.method);
		const { methodIconContainer, methodIcon } = this._getStyle(this.props.appLayout);

		if (action) {
			if (action.name === 'Dim') {
				return (
					<View style={methodIconContainer}>
						<Text style={methodIcon}>
							{`${Math.round(this.props.methodValue / 255 * 100)}%`}
						</Text>
					</View>
				);
			}
			return (
				<BlockIcon
					icon={action.icon}
					bgColor={action.bgColor}
					containerStyle={methodIconContainer}
					style={methodIcon}
				/>
			);
		}

		return null;
	};

	_getRepeatDescription = (): string => {
		const { type, weekdays } = this.props;
		const selectedDays: string[] = getSelectedDays(weekdays);

		let repeatDays: string = '';

		if (selectedDays.length === DAYS.length) {
			repeatDays = 'Every day';
		} else if (_.isEqual(selectedDays, getWeekdays())) {
			repeatDays = 'Every weekdays';
		} else if (_.isEqual(selectedDays, getWeekends())) {
			repeatDays = 'Every weekends';
		} else {
			for (let day of selectedDays) {
				repeatDays += `${day.slice(0, 3).toLowerCase()}, `;
			}
			repeatDays = capitalize(repeatDays.slice(0, -2));
		}

		const repeatTime: string = (type === 'time') ? '' : type;

		return `${repeatDays} at ${repeatTime}`;
	};

	_getStyle = (appLayout: Object): Object => {
		const { fonts, borderRadiusRow } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		let backgroundColor;
		const action = ACTIONS.find((a: Object): boolean => a.method === this.props.method);
		if (action) {
			backgroundColor = action.bgColor;
		}

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: width * 0.03888888,
				width: width,
			},
			methodIconContainer: {
				backgroundColor,
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
				alignItems: 'center',
				justifyContent: 'center',
				width: width * 0.16,
			},
			methodIcon: {
				color: '#fff',
				fontSize: action && action.name === 'Dim' ? deviceWidth * 0.04 : deviceWidth * 0.056,
			},
			textWrapper: {
				flex: 1,
				paddingLeft: width * 0.032,
				paddingRight: width * 0.068,
				width: null,
			},
			title: {
				color: '#707070',
				fontSize: deviceWidth * 0.04,
				fontFamily: fonts.robotoRegular,
				marginBottom: width * 0.008,
			},
			description: {
				color: '#707070',
				fontSize: deviceWidth * 0.032,
				opacity: 1,
			},
			iconOffset: {
				position: 'absolute',
				right: width * 0.014666667,
				top: width * 0.016,
			},
			iconRandom: {
				position: 'absolute',
				right: width * 0.014666667,
				bottom: width * 0.016,
			},
			roundIcon: {
				color: '#fff',
				fontSize: deviceWidth * 0.044,
			},
			time: {
				width: width * 0.26,
				textAlign: 'center',
				fontSize: deviceWidth * 0.044,
			},
			rowContainer: {
				width: width * 0.58666666,
			},
			roundIconContainer: {
				marginLeft: isPortrait ? 0 : width * 0.01788,
			},
		};
	};

}

function mapStateToProps(state: Object): Object {
	return {
		appLayout: getRelativeDimensions(state.App.layout),
	};
}

export default connect(mapStateToProps, null)(JobRow);

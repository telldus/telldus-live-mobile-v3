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
import { defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import _ from 'lodash';
import Platform from 'Platform';

import {
	BlockIcon,
	IconTelldus,
	ListRow,
	View,
	Text,
	FormattedTime,
} from '../../../../BaseComponents';
import NowRow from './Jobs/NowRow';
import Theme from '../../../Theme';
import { ACTIONS, Description, TextRowWrapper, Title } from '../../Schedule/SubViews';
import {
	capitalize,
	getSelectedDays,
	getWeekdays,
	getWeekends,
	getRelativeDimensions,
	getTranslatableDays,
} from '../../../Lib';
import type { Schedule } from '../../../Reducers/Schedule';

import i18n from '../../../Translations/common';

const messages = defineMessages({
	phraseOne: {
		id: 'accessibilityLabel.scheduler.phraseOne',
		defaultMessage: 'Schedule for',
	},
	repeatDays: {
		id: 'scheduler.repeatDays',
		defaultMessage: 'Every day at {value}',
	},
	repeatWeekday: {
		id: 'scheduler.repeatWeekday',
		defaultMessage: 'Weekdays at {value}',
	},
	repeatWeekend: {
		id: 'scheduler.repeatWeekend',
		defaultMessage: 'Weekends at {value}',
	},
});


type Props = {
	active: boolean,
	device: Object,
	method: number,
	methodValue?: number,
	effectiveHour: string,
	effectiveMinute: string,
	offset: number,
	randomInterval: number,
	type: string,
	weekdays: number[],
	isFirst: boolean,
	editJob: (schedule: Schedule) => void,
	appLayout: Object,
	intl: intlShape,
	showNow: boolean,
};

class JobRow extends View<null, Props, null> {

	static propTypes = {
		id: PropTypes.number.isRequired,
		deviceId: PropTypes.number.isRequired,
		active: PropTypes.bool.isRequired,
		device: PropTypes.object.isRequired,
		method: PropTypes.number.isRequired,
		methodValue: PropTypes.number,
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
			intl,
			showNow,
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
			rowWithTriangleContainer,
			lineStyle,
			rowWithTriangleContainerNow,
		} = this._getStyle(appLayout);
		const opacity = active ? 1 : 0.5;

		const repeat = this._getRepeatDescription();
		const date = `01/01/2017 ${effectiveHour}:${effectiveMinute}`;
		const timestamp = Date.parse(date);

		const { actionIcon, actionLabel } = this._renderActionIcon();

		const { formatMessage } = intl;
		const deviceName = device.name ? device.name : formatMessage(i18n.noName);
		const labelDevice = `${formatMessage(i18n.labelDevice)} ${deviceName}`;
		const labelAction = `${formatMessage(i18n.labelAction)} ${actionLabel}`;
		const accessibilityLabel = `${formatMessage(messages.phraseOne)} ${effectiveHour}:${effectiveMinute}, ${labelDevice}, ${labelAction}, ${formatMessage(i18n.activateEdit)}`;

		return (
			<View>
				<TouchableOpacity
					style={container}
					onPress={this.editJob}
					disabled={!editJob}
					accessibilityLabel={accessibilityLabel}
				>
					<ListRow
						roundIcon={type}
						roundIconStyle={roundIcon}
						roundIconContainerStyle={[roundIconContainer, { backgroundColor: active ? '#929292' : '#BDBDBD'} ]}
						time={timestamp}
						timeFormat= {{
							hour: 'numeric',
							minute: 'numeric',
						}}
						timeStyle={time}
						timeContainerStyle={{ opacity }}
						rowContainerStyle={[rowContainer]}
						rowWithTriangleContainerStyle={[rowWithTriangleContainer, { opacity }]}
						triangleColor={methodIconContainer.backgroundColor}
						isFirst={isFirst}
					>
						{actionIcon}
						<TextRowWrapper style={textWrapper} appLayout={appLayout}>
							<Title numberOfLines={1} ellipsizeMode="tail" style={title} appLayout={appLayout}>
								{device.name}
							</Title>
							<Description numberOfLines={1} ellipsizeMode="tail" style={description} appLayout={appLayout}>
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
				{showNow && (
					<View
						style={container}
					>
						<NowRow
							roundIconContainerStyle={roundIconContainer}
							rowWithTriangleContainerStyle={rowWithTriangleContainerNow}
							textStyle={time}
							lineStyle={lineStyle}
						/>
					</View>
				)}
			</View>
		);
	}

	_renderActionIcon = (): Object => {
		const { intl, method, appLayout, methodValue } = this.props;
		const { formatMessage } = intl;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);
		const { methodIconContainer, methodIcon } = this._getStyle(appLayout);

		if (action) {
			if (action.name === 'Dim') {
				const roundVal = Math.round(methodValue / 255 * 100);
				const value = `${roundVal}%`;
				return (
					{
						actionIcon: <View style={methodIconContainer}>
							<Text style={methodIcon}>
								{value}
							</Text>
						</View>,
						actionLabel: `${formatMessage(action.actionLabel)} ${value}`,
					}
				);
			}
			return (
				{
					actionIcon: <BlockIcon
						icon={action.icon}
						bgColor={action.bgColor}
						containerStyle={methodIconContainer}
						style={methodIcon}
					/>,
					actionLabel: formatMessage(action.actionLabel),
				}
			);
		}

		return {};
	};

	_getRepeatDescription = (): string => {
		const { type, weekdays, intl } = this.props;
		const { formatMessage, formatDate } = intl;
		const selectedDays: string[] = getSelectedDays(weekdays, formatDate);
		const repeatTime: string = (type === 'time') ? '' : this.getRepeatTime(type);
		const DAYS = getTranslatableDays(formatDate);

		let repeatDays: string = '';
		if (selectedDays.length === DAYS.length) {
			repeatDays = formatMessage(messages.repeatDays, { value: repeatTime });
		} else if (_.isEqual(selectedDays, getWeekdays(formatDate))) {
			repeatDays = formatMessage(messages.repeatWeekday, { value: repeatTime });
		} else if (_.isEqual(selectedDays, getWeekends(formatDate))) {
			repeatDays = formatMessage(messages.repeatWeekend, { value: repeatTime });
		} else {
			for (let day of selectedDays) {
				repeatDays += `${day.slice(0, 3).toLowerCase()}, `;
			}
			repeatDays = capitalize(repeatDays.slice(0, -2));
		}

		return repeatDays;
	};

	getRepeatTime(type: string): string {
		let { formatMessage } = this.props.intl;
		if (type === 'sunrise') {
			return formatMessage(i18n.sunrise);
		} else if (type === 'sunset') {
			return formatMessage(i18n.sunset);
		}
		return formatMessage(i18n.time);
	}

	_getStyle = (appLayout: Object): Object => {
		let { fonts, borderRadiusRow } = Theme.Core;
		let { active, method, methodValue } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;
		let headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * 0.1111) + (height * 0.13) : 0;
		width = width - headerHeight;

		const timeWidth = width * 0.26;
		const rowWidth = width * 0.57;
		const rowWithTriangleWidth = width * 0.59;

		let backgroundColor;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);
		if (action) {
			let showDarkBG = false;
			if (action.name === 'Dim') {
				let roundVal = Math.round(methodValue / 255 * 100);
				showDarkBG = roundVal >= 50 && roundVal < 100;
			}
			backgroundColor = active ? (showDarkBG ? action.bgColorDark : action.bgColor) : '#bdbdbd';
		}

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: width * 0.03888888,
				width: width,
				backgroundColor: 'transparent',
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
				paddingRight: width * 0.032,
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
				width: timeWidth,
				textAlign: 'center',
				fontSize: deviceWidth * 0.044,
			},
			rowContainer: {
				width: rowWidth,
			},
			roundIconContainer: {
				marginLeft: isPortrait ? 0 : width * 0.01788,
			},
			rowWithTriangleContainer: {
				width: rowWithTriangleWidth,
				justifyContent: 'center',
			},
			lineStyle: {
				height: 1 + (deviceWidth * 0.005),
				width: '100%',
				backgroundColor: Theme.Core.brandPrimary,
			},
			rowWithTriangleContainerNow: {
				width: rowWithTriangleWidth + timeWidth,
				height: deviceWidth * 0.082,
				justifyContent: 'center',
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

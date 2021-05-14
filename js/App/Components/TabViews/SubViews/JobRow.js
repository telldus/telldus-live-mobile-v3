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
	TouchableOpacity,
	Platform,
} from 'react-native';
import { intlShape } from 'react-intl';
const isEqual = require('react-fast-compare');

import {
	BlockIcon,
	IconTelldus,
	ListRow,
	View,
	Text,
	TimezoneFormattedTime,
} from '../../../../BaseComponents';
import NowRow from './Jobs/NowRow';
import Theme from '../../../Theme';
import { ACTIONS, Description, TextRowWrapper, Title } from '../../Schedule/SubViews';
import {
	getDeviceActionIcon,
	getKnownModes,
	getRepeatDescription,
} from '../../../Lib';
import type { Schedule } from '../../../Reducers/Schedule';
import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import { methods } from '../../../../Constants';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	active: boolean,
	method: number,
	methodValue?: number | number,
	effectiveHour: string,
	effectiveMinute: string,
	offset: number,
	randomInterval: number,
	type: string,
	weekdays: number[],
	isFirst: boolean,
	appLayout: Object,
	showNow: boolean,
	expired: boolean,
	deviceType: string,
	deviceSupportedMethods: Object,
	gatewayTimezone: string,
	ScreenName: string,
	showName?: boolean,

	intl: intlShape,
	editJob: (schedule: Schedule) => void,
};

class JobRow extends View<null, Props, null> {

	static defaultProps = {
		showName: true,
	};

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { appLayout, intl, editJob, weekdays, currentScreen, ScreenName, ...others } = this.props;// eslint-disable-line
		const { appLayout: appLayoutN, intl: intlN, editJob: editJobN, weekdays: weekdaysN, currentScreen: currentScreenN, ScreenName: ScreenNameN, ...othersN } = nextProps;// eslint-disable-line
		if (currentScreenN === ScreenNameN) {
			// Force re-render once to gain/loose accessibility
			if (currentScreen !== ScreenName && nextProps.screenReaderEnabled) {
				return true;
			}
			const newLayout = nextProps.appLayout.width !== appLayout.width;
			if (newLayout) {
				return true;
			}

			if (weekdays.length !== weekdaysN.length) {
				return true;
			}

			const propsEqual = isEqual(others, othersN);
			if (!propsEqual) {
				return true;
			}
		}
		// Force re-render once to gain/loose accessibility
		if (currentScreenN !== ScreenNameN && currentScreen === ScreenName && nextProps.screenReaderEnabled) {
			return true;
		}
		return false;
	}

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
			retries,
			retryInterval,
			reps,
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
			retries,
			retryInterval,
			reps,
		};

		editJob(schedule);
	};

	render(): React$Element<any> | null {

		const {
			type,
			effectiveHour,
			effectiveMinute,
			deviceName: dName,
			offset,
			randomInterval,
			active,
			isFirst,
			editJob,
			appLayout,
			intl,
			showNow,
			expired,
			currentScreen,
			ScreenName,
			showName,
			colors,
		} = this.props;

		const {
			container,
			textWrapper,
			title,
			description,
			iconOffset,
			iconRandom,
			roundIcon,
			time,
			rowContainer,
			roundIconContainer,
			rowWithTriangleContainer,
			lineStyle,
			rowWithTriangleContainerNow,
		} = this._getStyle(appLayout);
		const color = !active ? '#BDBDBD' : (expired ? '#999999' : '#929292');

		const repeat = this._getRepeatDescription();
		const date = `01/01/2017 ${effectiveHour}:${effectiveMinute}`;
		const timestamp = Date.parse(date);

		const { actionIcon, actionLabel, triangleColor } = this._renderActionIcon();

		const { formatMessage } = intl;
		const deviceName = dName ? dName : formatMessage(i18n.noName);
		const labelDevice = `${formatMessage(i18n.labelDevice)} ${deviceName}`;
		const labelAction = `${formatMessage(i18n.labelAction)} ${actionLabel}`;

		const accessible = currentScreen === ScreenName;
		const accessibilityLabel = `${formatMessage(i18n.phraseOneSheduler)} ${effectiveHour}:${effectiveMinute}, ${labelDevice}, ${labelAction}, ${formatMessage(i18n.activateEdit)}`;

		return (
			<View importantForAccessibility={accessible ? 'no' : 'no-hide-descendants'}>
				<TouchableOpacity
					style={container}
					onPress={this.editJob}
					disabled={!editJob}
					accessible={accessible}
					importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
					accessibilityLabel={accessible ? accessibilityLabel : ''}
				>
					<ListRow
						roundIcon={!active ? 'pause' : type}
						roundIconStyle={roundIcon}
						roundIconContainerStyle={[roundIconContainer, { backgroundColor: color } ]}
						time={timestamp}
						timeFormat= {{
							hour: 'numeric',
							minute: 'numeric',
						}}
						timeStyle={time}
						rowContainerStyle={rowContainer}
						rowWithTriangleContainerStyle={rowWithTriangleContainer}
						triangleColor={triangleColor}
						showShadow={active}
						isFirst={isFirst}
						appLayout={appLayout}>
						{actionIcon}
						<View
							level={2}
							style={{ flex: 1 }}>
							<TextRowWrapper style={textWrapper} appLayout={appLayout}>
								{showName && <Title numberOfLines={1} ellipsizeMode="tail" style={title} appLayout={appLayout}>
									{deviceName}
								</Title>
								}
								<Description numberOfLines={1} ellipsizeMode="tail" style={description} appLayout={appLayout}>
									{repeat}{' '}
									{type === 'time' && (
										<TimezoneFormattedTime
											value={timestamp}
											formattingOptions={{
												hour: 'numeric',
												minute: 'numeric',
											}}
											style={description}
										/>)
									}
								</Description>
							</TextRowWrapper>
							{!!offset && (
								<IconTelldus
									level={25}
									icon="offset"
									style={iconOffset}
								/>
							)}
							{!!randomInterval && (
								<IconTelldus
									level={25}
									icon="random"
									style={iconRandom}
								/>
							)}
						</View>
					</ListRow>
				</TouchableOpacity>
				{!!showNow && (
					<View
						style={container}
					>
						<NowRow
							text={formatMessage(i18n.now)}
							roundIconContainerStyle={[
								roundIconContainer, {
									backgroundColor: colors.colorOffActiveBg,
								},
							]}
							rowWithTriangleContainerStyle={rowWithTriangleContainerNow}
							textStyle={time}
							lineStyle={lineStyle}
							appLayout={appLayout}
						/>
					</View>
				)}
			</View>
		);
	}

	_renderActionIcon = (): Object => {
		const {
			intl,
			method,
			appLayout,
			methodValue,
			expired,
			active,
			deviceSupportedMethods,
			deviceType,
			colors,
		} = this.props;
		const { formatMessage } = intl;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);

		if (action) {
			const {
				methodIconContainer,
				methodIcon,
				thermostatInfo,
				thermostateModeControlIcon,
				inactiveGray,
			} = this._getStyle(appLayout);
			const actionIcons = getDeviceActionIcon(deviceType, null, deviceSupportedMethods);
			const methodString = methods[action.method];
			let iconName = actionIcons[methodString];

			if (action.name === 'Dim') {
				const roundVal = Math.round(methodValue / 255 * 100);
				const value = `${roundVal}%`;
				return (
					{
						triangleColor: methodIconContainer.backgroundColor,
						actionIcon: <View style={methodIconContainer}>
							<Text style={methodIcon}>
								{value}
							</Text>
						</View>,
						actionLabel: `${typeof action.actionLabel === 'string' ? action.actionLabel : formatMessage(action.actionLabel)} ${value}`,
					}
				);
			}
			if (action.name === 'Thermostat') {
				const {
					mode = '',
					temperature,
					scale,
					changeMode,
				} = JSON.parse(methodValue);
				const modesInfo = getKnownModes(formatMessage);

				// $FlowFixMe
				let Icon, label;
				modesInfo.map((info: Object) => {
					if (info.mode.trim() === mode.trim()) {
						Icon = info.IconActive;
						label = info.label;
					}
				});

				const {
					fontSize,
					color,
				} = thermostateModeControlIcon;

				const showModeIcon = !!Icon;

				return (
					{
						triangleColor: methodIconContainer.backgroundColor,
						actionIcon: <View style={methodIconContainer}>
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
								{showModeIcon && (
									// $FlowFixMe
									<Icon
										height={fontSize}
										width={fontSize}
										style={{
											color: color,
										}}/>
								)}
								{!!changeMode &&
									(
										<IconTelldus icon={'play'} style={thermostateModeControlIcon}/>
									)
								}
							</View>
							<>
								{!!label && <Text style={thermostatInfo}>
									{label.toUpperCase()}
								</Text>
								}
								{(typeof temperature !== 'undefined' && temperature !== null && temperature !== '')
							&& <Text style={thermostatInfo}>
								{temperature}{scale ? '°F' : '°C'}
							</Text>
								}
							</>
						</View>,
						actionLabel: `${typeof action.actionLabel === 'string' ? action.actionLabel : formatMessage(action.actionLabel)} ${mode} ${temperature}`,
					}
				);
			}
			if (action.name === 'Rgb') {
				const color = methodValue.toLowerCase() === '#ffffff' ? colors.inAppBrandSecondary : methodValue;
				return (
					{
						triangleColor: !active ? inactiveGray : expired ? '#999999' : color,
						actionIcon: <BlockIcon
							icon={iconName ? iconName : action.icon}
							containerStyle={[
								methodIconContainer,
								{
									backgroundColor: !active ? inactiveGray : expired ? '#999999' : color,
								},
							]}
							style={methodIcon}
						/>,
						actionLabel: typeof action.actionLabel === 'string' ? action.actionLabel : formatMessage(action.actionLabel),
					}
				);
			}
			return (
				{
					triangleColor: methodIconContainer.backgroundColor,
					actionIcon: <BlockIcon
						icon={iconName ? iconName : action.icon}
						containerStyle={[
							methodIconContainer,
							{
								backgroundColor: !active ? inactiveGray : expired ? '#999999' : colors[action.bgColor],
							}]}
						style={methodIcon}
					/>,
					actionLabel: typeof action.actionLabel === 'string' ? action.actionLabel : formatMessage(action.actionLabel),
				}
			);
		}

		return {};
	};

	_getRepeatDescription = (): string => {
		const { type, weekdays, intl } = this.props;
		return getRepeatDescription({
			type, weekdays, intl,
		});
	};

	_getStyle = (appLayout: Object): Object => {
		let {
			borderRadiusRow,
			inactiveGray,
		} = Theme.Core;
		let {
			active,
			method,
			methodValue,
			expired,
			colors,
		} = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceWidth = isPortrait ? width : height;

		const {
			textTwo,
			colorOffActiveBg,
		} = colors;

		const {
			fontSizeFactorFour,
		} = Theme.Core;
		const { land } = Theme.Core.headerHeightFactor;
		let headerHeight = (Platform.OS === 'android' && !isPortrait) ? (width * land) + (height * 0.13) : 0;
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
			backgroundColor = !active ? inactiveGray : (expired ? '#999999' : (showDarkBG ? colors[action.bgColorDark] : colors[action.bgColor]));
		}

		return {
			inactiveGray,
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
				fontSize: action && action.name === 'Dim' ? deviceWidth * fontSizeFactorFour : deviceWidth * 0.056,
			},
			thermostateModeControlIcon: {
				color: '#fff',
				fontSize: deviceWidth * fontSizeFactorFour,
			},
			thermostatInfo: {
				color: '#fff',
				fontSize: deviceWidth * 0.028,
				textAlign: 'center',
			},
			textWrapper: {
				flex: 1,
				paddingLeft: width * 0.032,
				paddingRight: width * 0.032,
				width: null,
			},
			title: {
				color: !active ? inactiveGray : textTwo,
				fontSize: deviceWidth * fontSizeFactorFour,
				marginBottom: width * 0.008,
			},
			description: {
				color: !active ? inactiveGray : textTwo,
				fontSize: deviceWidth * 0.032,
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
				color: !active ? inactiveGray : textTwo,
			},
			rowContainer: {
				width: rowWidth,
				minHeight: deviceWidth * 0.1,
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
				backgroundColor: colorOffActiveBg,
			},
			rowWithTriangleContainerNow: {
				width: rowWithTriangleWidth + timeWidth,
				height: deviceWidth * 0.082,
				justifyContent: 'center',
			},
		};
	};

}

export default (withTheme(JobRow): Object);

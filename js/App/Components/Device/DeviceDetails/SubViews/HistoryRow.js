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
import { StyleSheet, TouchableOpacity } from 'react-native';
let dayjs = require('dayjs');

import { FormattedMessage, Text, View, ListRow, IconTelldus } from '../../../../../BaseComponents';
import {
	getDeviceStateMethod,
	getDeviceActionIcon,
	getMainColorRGB,
	toSliderValue,
	getKnownModes,
} from '../../../../Lib';

import {
	withTheme,
	PropsThemedComponent,
} from '../../../HOC/withTheme';

import i18n from '../../../../Translations/common';

import Theme from '../../../../Theme';

type Props = PropsThemedComponent & {
	item: Object,
	onOriginPress: Function,
	isFirst: boolean,
	appLayout: Object,
	section: string,
	intl: Object,
	isLast: boolean,
	isModalOpen: boolean,
	currentScreen: string,
	deviceType: string,
	gatewayTimezone: string,
};


class HistoryRow extends React.PureComponent<Props, null> {
	props: Props;

	labelAction: string;
	labelStatus: string;
	labelOff: string;
	labelOn: string;
	labelBell: string;
	labelDim: string;
	labelUp: string;
	labelDown: string;
	labelStop: string;
	labelSuccess: string;
	labelFailed: string;
	labelDate: string;
	labelOrigin: string;

	onOriginPress: () => void;

	BGPrimaryActions: Array<number>;

	constructor(props: Props) {
		super(props);
		this.onOriginPress = this.onOriginPress.bind(this);

		let { formatMessage } = props.intl;
		this.labelAction = formatMessage(i18n.labelAction);
		this.labelStatus = formatMessage(i18n.status);

		this.labelOff = formatMessage(i18n.turnOff);
		this.labelOn = formatMessage(i18n.turnOn);
		this.labelBell = formatMessage(i18n.bell);
		this.labelDim = formatMessage(i18n.dim);
		this.labelUp = formatMessage(i18n.up);
		this.labelDown = formatMessage(i18n.down);
		this.labelStop = formatMessage(i18n.stop);

		this.labelSuccess = formatMessage(i18n.success);
		this.labelFailed = formatMessage(i18n.failed);

		this.labelDate = formatMessage(i18n.date);
		this.labelOrigin = formatMessage(i18n.origin);

		this.BGPrimaryActions = [2, 512];
	}

	onOriginPress() {
		this.props.onOriginPress(this.props.item);
	}

	getIcon(deviceState: string): string | null {
		switch (deviceState) {
			case 'TURNON':
				return 'on';
			case 'TURNOFF':
				return 'off';
			case 'UP':
				return 'up';
			case 'BELL':
				return 'bell';
			case 'DOWN':
				return 'down';
			case 'STOP':
				return 'stop';
			case 'LEARN':
				return 'learn';
			case 'RGB':
				return 'palette';
			default:
				return '';
		}

	}

	getPercentage(value: number): number {
		return Math.round(value * 100.0 / 255);
	}

	getLabelAction(status: string, value: number): string {
		switch (status) {
			case 'TURNOFF':
				return this.labelOff;
			case 'TURNON':
				return this.labelOn;
			case 'BELL':
				return this.labelBell;
			case 'UP':
				return this.labelUp;
			case 'DOWN':
				return this.labelDown;
			case 'STOP':
				return this.labelStop;
			case 'DIM':
				let dimmerValue = toSliderValue(value);
				return `${this.labelDim} ${dimmerValue}%`;
			default:
				return '';
		}
	}

	accessibilityLabel(deviceState: string): string {
		let { item, section } = this.props;
		let { stateValue, successStatus } = item;

		let action = this.getLabelAction(deviceState, stateValue);
		let actionInfo = `${this.labelAction}, ${action}`;

		let status = successStatus !== 0 ? this.labelFailed : this.labelSuccess;
		let statusInfo = `${this.labelStatus}, ${status}`;

		let date = section;
		let dateInfo = `${this.labelDate} ${date}`;
		let time = item.ts * 1000;
		time = dayjs(time).format('HH:mm:ss');

		let accessibilityLabel = `${actionInfo}. ${statusInfo}. ${dateInfo}, ${time}`;

		return accessibilityLabel;
	}

	getColorSet = (item: Object, deviceState: string): Object => {
		const {
			colorOnActiveBg,
			colorOffActiveBg,
			colorOffActiveIcon,
			colorOnActiveIcon,
		} = this.props.colors;

		return deviceState === 'RGB' ? {
			bGColor: getMainColorRGB(item.stateValue),
			iconColor: colorOnActiveIcon,
		} :
			this.BGPrimaryActions.indexOf(item.state) !== -1 || (deviceState === 'DIM' && item.stateValue === 0)
				? {
					bGColor: colorOffActiveBg,
					iconColor: colorOffActiveIcon,
				 } : {
					bGColor: colorOnActiveBg,
					iconColor: colorOnActiveIcon,
				 };
	}

	render(): Object {

		let {
			intl,
			isModalOpen,
			currentScreen,
			deviceType,
			appLayout,
			gatewayTimezone,
			item,
			colors,
		} = this.props;
		const {
			successStatus,
		} = item;

		let {
			locationCover,
			containerStyle,
			roundIconStyle,
			rowContainerStyle,
			timeStyle,
			timeContainerStyle,
			statusView,
			originTextStyle,
			roundIconContainerStyle,
			statusIconSize,
			statusValueText,
			iconBackgroundMaskStyle,
			rowWithTriangleContainer,
			stateValSecStyle,
		} = this.getStyle();

		let time = new Date(item.ts * 1000);
		let deviceState = getDeviceStateMethod(item.state);

		const icons = getDeviceActionIcon(deviceType, deviceState, {});
		let icon = icons[deviceState];
		if (!icon) {
			icon = this.getIcon(deviceState);
		}
		if (deviceState === 'RGB') {
			icon = 'palette';
		}

		let originText = '', originInfo = '';
		let origin = item.origin;
		if (origin === 'Scheduler') {
			originText = <FormattedMessage {...i18n.scheduler} style={originTextStyle}/>;
			originInfo = `${this.labelOrigin}, ${intl.formatMessage(i18n.scheduler)}`;
		} else if (origin === 'Incoming signal') {
			originText = <FormattedMessage {...i18n.incommingSignal} style={originTextStyle}/>;
			originInfo = `${this.labelOrigin}, ${intl.formatMessage(i18n.incommingSignal)}`;
		} else if (origin === 'Unknown') {
			originText = <FormattedMessage {...i18n.unknown} style={originTextStyle}/>;
			originInfo = `${this.labelOrigin}, ${intl.formatMessage(i18n.unknown)}`;
		} else if (origin.substring(0, 5) === 'Group') {
			originText = <Text style={originTextStyle}><FormattedMessage {...i18n.group} style={originTextStyle}/> {origin.substring(6, (origin.length))}</Text>;
			originInfo = `${this.labelOrigin}, ${intl.formatMessage(i18n.group)}`;
		} else if (origin.substring(0, 5) === 'Event') {
			originText = <Text style={originTextStyle}><FormattedMessage {...i18n.event} style={originTextStyle}/> {origin.substring(6, (origin.length))}</Text>;
			originInfo = `${this.labelOrigin}, ${intl.formatMessage(i18n.event)}`;
		} else {
			originText = origin;
			originInfo = `${this.labelOrigin}, ${origin}`;
		}

		let {
			bGColor,
			iconColor,
		} = this.getColorSet(item, deviceState);
		let roundIcon = successStatus !== 0 ? 'info' : '';
		let Icon, currentModeLabel = '', stateValSec;
		if (deviceState === 'THERMOSTAT') {
			let thermoStateValue = {};
			let sv = item.stateValue.replace(/'/g, '"');
			try {
				thermoStateValue = JSON.parse(sv);
			} catch (e) {
				// Ignore
			}
			const {
				mode,
				temperature,
				changeMode,
			} = thermoStateValue;
			stateValSec = temperature;

			const knownModes = getKnownModes(intl.formatMessage);

			if (mode && changeMode && typeof temperature !== 'undefined') {
				originText = intl.formatMessage(i18n.modeAndTemp);
				originInfo = intl.formatMessage(i18n.modeAndTemp);
			} else if (mode && changeMode) {
				originText = intl.formatMessage(i18n.modeOnly);
				originInfo = intl.formatMessage(i18n.modeOnly);
			} else {
				originText = intl.formatMessage(i18n.tempOnly);
				originInfo = intl.formatMessage(i18n.tempOnly);
			}

			if (mode && changeMode) {
				knownModes.map((km: Object) => {
					if (mode === km.mode) {
						Icon = km.IconActive;
						currentModeLabel = km.label;
					}
				});
			}

			if (mode && mode === 'off') {
				bGColor = colors.colorOffActiveBg;
				iconColor = colors.colorOffActiveIcon;
				icon = 'off';
			}
			if (successStatus === 6) {
				roundIcon = 'time';
				roundIconStyle = {
					...roundIconStyle,
					color: colors.inAppBrandSecondary,
				};
			}
		}

		let accessibilityLabel = this.accessibilityLabel(deviceState);
		accessibilityLabel = `${accessibilityLabel}. ${currentModeLabel}, ${originInfo}`;
		let accessible = !isModalOpen && currentScreen === 'History';

		return (
			<TouchableOpacity style={styles.rowItemsContainer}
				accessible={accessible}
				importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
				accessibilityLabel={accessible ? accessibilityLabel : ''}
				onPress={this.onOriginPress}>
				<ListRow
					roundIcon={roundIcon}
					roundIconStyle={roundIconStyle}
					roundIconContainerStyle={roundIconContainerStyle}
					iconBackgroundMask={true}
					iconBackgroundMaskStyle={iconBackgroundMaskStyle}
					time={time}
					timeStyle={timeStyle}
					timeContainerStyle={timeContainerStyle}
					containerStyle={containerStyle}
					rowContainerStyle={rowContainerStyle}
					triangleColor={bGColor}
					rowWithTriangleContainerStyle={rowWithTriangleContainer}
					isFirst={this.props.isFirst}
					appLayout={appLayout}
					gatewayTimezone={gatewayTimezone}
				>

					{(deviceState === 'DIM' && item.stateValue === 0) ?
						<View style={[statusView, { backgroundColor: colors.colorOffActiveBg }]}>
							<IconTelldus icon={'off'} size={statusIconSize} color={colors.colorOffActiveIcon} />
						</View>
						:
						<View style={[statusView, { backgroundColor: bGColor }]}>
							{deviceState === 'DIM' ?
								<Text style={statusValueText}>{this.getPercentage(item.stateValue)}%</Text>
								:
								<>
									{Icon ?
										<Icon
											height={statusIconSize * 1.2}
											width={statusIconSize * 1.2}
										/>
										:
										<>
											{!!icon && <IconTelldus icon={icon} size={statusIconSize} color={iconColor} />}
										</>
									}
									{typeof stateValSec !== 'undefined' &&
								<Text style={stateValSecStyle}>{intl.formatNumber(stateValSec, {
									minimumFractionDigits: 1,
								})}°C</Text>
									}
								</>
							}
						</View>
					}
					<View style={locationCover}>
						<Text
							level={25}
							style={originTextStyle} numberOfLines={1}>{originText}</Text>
					</View>
				</ListRow>
			</TouchableOpacity>
		);
	}

	getStyle(): Object {
		const {
			appLayout,
			isLast,
			isFirst,
			item,
			colors,
		} = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			textTwo,
		} = colors;
		const {
			fontSizeFactorFive,
			paddingFactor,
			fontSizeFactorFour,
			fontSizeFactorOne,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		return {
			locationCover: {
				width: width * 0.40,
				height: isPortrait ? height * 0.07 : width * 0.07,
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 5,
				borderTopRightRadius: 3,
				borderBottomRightRadius: 3,
				flexWrap: 'wrap',
			},
			statusView: {
				width: width * 0.13,
				height: isPortrait ? height * 0.07 : width * 0.07,
				justifyContent: 'center',
				alignItems: 'center',
				borderTopLeftRadius: 3,
				borderBottomLeftRadius: 3,
			},
			roundIconStyle: {
				fontSize: deviceWidth * 0.0667777777,
				color: '#d32f2f',
			},
			rowContainerStyle: {
				width: isPortrait ? width * 0.55 : width * 0.68,
			},
			rowWithTriangleContainer: {
				width: isPortrait ? width * 0.57 : width * 0.70,
				justifyContent: 'center',
			},
			containerStyle: {
				paddingHorizontal: deviceWidth * fontSizeFactorFour,
				marginTop: isFirst ? padding : padding / 2,
				marginBottom: isLast ? padding : 0,
				paddingTop: 0,
				paddingBottom: 0,
			},
			timeStyle: {
				fontSize: deviceWidth * fontSizeFactorOne,
				color: textTwo,
			},
			timeContainerStyle: {
				width: isPortrait ? width * 0.30 : width * 0.20,
				zIndex: 1,
			},
			originTextStyle: {
				fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			},
			roundIconContainerStyle: {
				backgroundColor: item.successStatus !== 0 ? 'transparent' : '#929292',
				width: deviceWidth * 0.0667777777,
				height: deviceWidth * 0.0667777777,
				borderRadius: deviceWidth * 0.03338888885,
			},
			iconBackgroundMaskStyle: {
				backgroundColor: item.successStatus !== 0 ? '#fff' : '#929292',
				width: deviceWidth * fontSizeFactorFive,
				height: deviceWidth * fontSizeFactorFive,
				borderRadius: deviceWidth * 0.025,
				position: 'absolute',
			},
			statusIconSize: Math.floor(deviceWidth * fontSizeFactorOne),
			statusValueText: {
				color: '#ffffff',
				fontSize: Math.floor(deviceWidth * fontSizeFactorOne),
			},
			stateValSecStyle: {
				color: '#ffffff',
				fontSize: Math.floor(deviceWidth * 0.031),
			},
		};
	}
}

const styles = StyleSheet.create({
	rowItemsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
});

module.exports = (withTheme(HistoryRow): Object);

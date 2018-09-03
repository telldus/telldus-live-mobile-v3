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
import { connect } from 'react-redux';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import { FormattedMessage, Text, View, ListRow, IconTelldus } from '../../../../BaseComponents';
import { getDeviceStateMethod } from '../../../Lib';
import i18n from '../../../Translations/common';
import {
	toSliderValue,
} from '../../../Lib';

type Props = {
	item: Object,
	onOriginPress: Function,
	isFirst: boolean,
	appLayout: Object,
	section: string,
	intl: Object,
	isModalOpen: boolean,
	currentScreen: string,
};

type State = {
};

class HistoryRow extends React.PureComponent<Props, State> {
	props: Props;
	state: State;

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

	constructor(props: Props) {
		super(props);
		this.state = {
		};
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
		time = moment(time).format('HH:mm:ss');

		let accessibilityLabel = `${actionInfo}. ${statusInfo}. ${dateInfo}, ${time}`;

		return accessibilityLabel;
	}

	render(): Object {

		let { appLayout, intl, isModalOpen, currentScreen } = this.props;

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
		} = this.getStyle(appLayout);

		let time = new Date(this.props.item.ts * 1000);
		let deviceState = getDeviceStateMethod(this.props.item.state);
		let icon = this.getIcon(deviceState);
		let originText = '', originInfo = '';
		let origin = this.props.item.origin;
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

		let accessibilityLabel = this.accessibilityLabel(deviceState);
		accessibilityLabel = `${accessibilityLabel}. ${originInfo}`;
		let accessible = !isModalOpen && currentScreen === 'History';

		let triangleColor = this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ? '#A59F9A' : '#F06F0C';
		let roundIcon = this.props.item.successStatus !== 0 ? 'info' : '';

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
					triangleColor={triangleColor}
					rowWithTriangleContainerStyle={rowWithTriangleContainer}
					isFirst={this.props.isFirst}
				>

					{this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ?
						<View style={[statusView, { backgroundColor: '#1b365d' }]}>
							<IconTelldus icon="off" size={statusIconSize} color="#ffffff" />
						</View>
						:
						<View style={[statusView, { backgroundColor: '#F06F0C' }]}>
							{deviceState === 'DIM' ?
								<Text style={statusValueText}>{this.getPercentage(this.props.item.stateValue)}%</Text>
								:
								<IconTelldus icon={icon} size={statusIconSize} color="#ffffff" />
							}
						</View>
					}
					<View style={locationCover}>
						<Text style={originTextStyle} numberOfLines={1}>{originText}</Text>
					</View>
				</ListRow>
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;

		return {
			locationCover: {
				width: width * 0.40,
				height: isPortrait ? height * 0.07 : width * 0.07,
				justifyContent: 'center',
				backgroundColor: '#fff',
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
				fontSize: isPortrait ? width * 0.0667777777 : height * 0.0667777777,
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
				paddingHorizontal: isPortrait ? width * 0.04 : height * 0.04,
			},
			timeStyle: {
				fontSize: isPortrait ? width * 0.047 : height * 0.047,
			},
			timeContainerStyle: {
				width: isPortrait ? width * 0.30 : width * 0.20,
				zIndex: 1,
			},
			originTextStyle: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			roundIconContainerStyle: {
				backgroundColor: this.props.item.successStatus !== 0 ? 'transparent' : '#929292',
				width: isPortrait ? width * 0.0667777777 : height * 0.0667777777,
				height: isPortrait ? width * 0.0667777777 : height * 0.0667777777,
				borderRadius: isPortrait ? width * 0.03338888885 : height * 0.03338888885,
			},
			iconBackgroundMaskStyle: {
				backgroundColor: this.props.item.successStatus !== 0 ? '#fff' : '#929292',
				width: isPortrait ? width * 0.05 : height * 0.05,
				height: isPortrait ? width * 0.05 : height * 0.05,
				borderRadius: isPortrait ? width * 0.025 : height * 0.025,
				position: 'absolute',
			},
			statusIconSize: isPortrait ? Math.floor(width * 0.047) : Math.floor(height * 0.047),
			statusValueText: {
				color: '#ffffff',
				fontSize: isPortrait ? Math.floor(width * 0.047) : Math.floor(height * 0.047),
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

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
		isModalOpen: store.modal.openModal,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onOriginPress: (data: Object) => {
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data,
				},
			});
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryRow);

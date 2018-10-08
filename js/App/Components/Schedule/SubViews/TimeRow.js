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
import { ActivityIndicator } from 'react-native';

import { BlockIcon, IconTelldus, Row, View } from '../../../../BaseComponents';
import Description from './Description';
import Theme from '../../../Theme';
import { getSuntime, getHoursAndMinutes } from '../../../Lib';
import type { Schedule } from '../../../Reducers/Schedule';
import i18n from '../../../Translations/common';

type Time = {
	hour: number,
	minute: number,
};

type Props = {
	schedule: Schedule,
	device: Object,
	containerStyle?: Object,
	onPress?: Function,
	appLayout: Object,
	intl: Object,
	labelPostScript?: string,
};

type State = {
	time: Time,
	loading: boolean,
};

export default class TimeRow extends View<null, Props, State> {

	static propTypes = {
		schedule: PropTypes.object.isRequired,
		device: PropTypes.object.isRequired,
		containerStyle: PropTypes.object,
		onPress: PropTypes.func,
	};

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { schedule } = props;
		const { hour, minute, type } = schedule;
		const { time } = state;
		if (hour !== time.hour || minute !== time.minute) {
			if (type !== 'time') {
				return {
					loading: true,
				};
			}
			return {
				time: {
					hour,
					minute,
				},
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);

		const { hour, minute } = props.schedule;

		this.state = {
			time: {
				hour,
				minute,
			},
			loading: false,
		};
	}

	componentDidMount() {
		const { schedule, device } = this.props;

		if (schedule.type !== 'time') {
			this.setState({ loading: true });
			this._getSuntime(device.clientId, schedule.type);
		}
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { loading } = this.state;
		const { schedule, device } = this.props;
		const { type } = schedule;
		if (loading && schedule.type !== 'time') {
			this._getSuntime(device.clientId, type);
		}
	}

	render(): React$Element<any> {
		if (this.state.loading) {
			return (
				<Row
					layout="row"
					style={{
						alignItems: 'center',
						justifyContent: 'center',
					}}
					containerStyle={[this._getStyle(this.props.appLayout).container, this.props.containerStyle]}
				>
					<ActivityIndicator size="large"/>
				</Row>
			);
		}

		const { schedule, containerStyle, onPress, appLayout, intl } = this.props;
		const { offset, randomInterval, type } = schedule;

		const {
			container,
			blockIcon,
			textWrapper,
			title,
			iconRow,
			icon,
			description,
			timeStyle,
		} = this._getStyle(appLayout);
		const label = this.getLabel(type);

		const offsetIcon = offset ? 'offset' : null;
		const randomIcon = randomInterval ? 'random' : null;

		const labelInterval = randomInterval ? intl.formatMessage(i18n.descriptionInterval, {value: getHoursAndMinutes(randomInterval)}) : null;
		const labelOffset = offset ? intl.formatMessage(i18n.descriptionOffset, {value: getHoursAndMinutes(offset)}) : null;
		const time = this._formatTime();

		const accessibilityLabel = this._getAccessibilityLabel(label, time, labelInterval, labelOffset);

		return (
			<Row layout="row" containerStyle={[container, containerStyle]} onPress={onPress}
				importantForAccessibility={'yes'}
				accessibilityLabel={accessibilityLabel}>
				<View style={{alignItems: 'center', justifyContent: 'center'}}>
					<BlockIcon
						icon={type}
						size={blockIcon.size}
						color={blockIcon.color}
						bgColor="transparent"
						style={blockIcon.style}
					/>
					<Description style={timeStyle} appLayout={appLayout}>
						{`${time}`}
					</Description>
				</View>
				<View style={textWrapper}>
					<Description style={title} appLayout={appLayout}>
						{`${label}`}
					</Description>
					{!!offset && (
						<View style={iconRow}>
							<IconTelldus icon={offsetIcon} style={icon}/>
							<Description style={description} appLayout={appLayout}>
								{labelOffset}
							</Description>
						</View>
					)}
					{!!randomInterval && (
						<View style={iconRow}>
							<IconTelldus icon={randomIcon} style={icon}/>
							<Description style={description} appLayout={appLayout}>
								{labelInterval}
							</Description>
						</View>
					)}
				</View>
			</Row>
		);
	}

	_getAccessibilityLabel(label: string, time: string, interval: string | null, offset: string | null): string {
		const { labelPostScript = '' } = this.props;
		const labelInterval = interval ? `, ${interval}` : '';
		const labelOffset = offset ? `, ${offset}` : '';
		return `${label} ${time} ${labelInterval} ${labelOffset}, ${labelPostScript}`;
	}

	// $FlowFixMe
	_getSuntime = async (clientId: number, type: string): void => {
		const { hour, minute } = this.state.time;

		const time: Time = await getSuntime(clientId, type);

		if ((time: Time)) {
			if (time.hour !== hour && time.minute !== minute) {
				this.setState({
					time,
					loading: false,
				});
			} else {
				this.setState({
					loading: false,
				});
			}
		} else {
			this.setState({
				loading: false,
			});
		}
	};

	_formatTime = (): string => {
		const { time } = this.state;

		const hour = this._formatTimeValue(time.hour);
		const minute = this._formatTimeValue(time.minute);

		return `${hour}:${minute}`;
	};

	_formatTimeValue = (value: number): string => {
		return value < 10 ? `0${value}` : value.toString();
	};

	getLabel(type: string): string {
		let { formatMessage } = this.props.intl;
		if (type === 'sunrise') {
			return formatMessage(i18n.sunrise);
		} else if (type === 'sunset') {
			return formatMessage(i18n.sunset);
		}
		return formatMessage(i18n.time);
	}

	_getStyle = (appLayout: Object): Object => {
		const { offset, randomInterval, type } = this.props.schedule;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const size = deviceWidth * 0.136;

		return {
			container: {
				height: deviceWidth * 0.281333333,
				paddingHorizontal: deviceWidth * 0.068,
			},
			blockIcon: {
				size,
				color: Theme.Core[`${type}Color`],
				style: {
					width: deviceWidth * 0.1556,
					textAlign: 'center',
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
			timeStyle: {
				fontSize: deviceWidth * 0.036,
			},
		};
	};

}

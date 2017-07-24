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
import { NavigationActions } from 'react-navigation';
import { FloatingButton, View } from 'BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import getDeviceWidth from '../../Lib/getDeviceWidth';
import DeviceRow from './SubViews/DeviceRow';
import ActionRow from './SubViews/ActionRow';
import DaysRow from './SubViews/DaysRow';
import TimeRow from './SubViews/TimeRow';
import getSuntime from '../../Lib/getSuntime';
import _ from 'lodash';
import getSelectedDays from '../../Lib/getSelectedDays';
import { ScrollView } from 'react-native';

type Time = {
	hour: number,
	minute: number,
};

interface Props extends ScheduleProps {
	paddingRight: number,
	devices: Object,
}

type State = {
	time: Time,
};

export default class Summary extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		paddingRight: PropTypes.number,
		schedule: PropTypes.object,
		devices: PropTypes.object,
	};

	constructor(props: Props) {
		super(props);

		this.h1 = '5. Summary';
		this.h2 = 'Please confirm the schedule';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		const { hour, minute } = props.schedule;

		this.state = {
			time: {
				hour,
				minute,
			},
		};
	}

	componentWillMount() {
		this.device = this._getDeviceById(this.props.schedule.deviceId);
	}

	componentDidMount() {
		const { onDidMount, schedule } = this.props;

		const { h1, h2, infoButton } = this;
		onDidMount(h1, h2, infoButton);

		if (schedule.type !== 'time') {
			this._getSuntime(this.device.clientId, schedule.type);
		}
	}

	saveSchedule = () => {
		this.props.navigation.dispatch(NavigationActions.reset({
			index: 0,
			actions: [
				NavigationActions.navigate({
					routeName: 'Device',
					params: {
						reset: true,
					},
				}),
			],
		}));
	};

	render() {
		const { schedule, paddingRight } = this.props;
		const { method, methodValue, type, offset, randomInterval, weekdays } = schedule;
		const { row, timeRow, daysRow, iconSize } = this._getStyle();
		const selectedDays = getSelectedDays(weekdays);

		return (
			<View>
				<ScrollView>
					<DeviceRow row={this.device} containerStyle={row}/>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						containerStyle={row}
					/>
					<TimeRow
						type={type}
						time={this.state.time}
						offset={offset}
						randomInterval={randomInterval}
						containerStyle={[row, timeRow]}
					/>
					<DaysRow selectedDays={selectedDays} containerStyle={daysRow}/>
				</ScrollView>
				<FloatingButton
					onPress={this.saveSchedule}
					imageSource={require('./img/check.png')}
					iconSize={iconSize}
					paddingRight={paddingRight}
				/>
			</View>
		);
	}

	// $FlowFixMe
	_getSuntime = async (clientId: number, type: string): void => {
		const time: Time = await getSuntime(clientId, type);

		if ((time: Time) && !_.isEqual(this.state.time, time)) {
			this.setState({ time });
		}
	};

	_getDeviceById = (deviceId: number): Object => {
		// TODO: use device description
		return Object.assign({}, this.props.devices.byId[deviceId], { description: 'Fibaro Plug 2' });
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			row: {
				marginBottom: deviceWidth * 0.025333333,
			},
			timeRow: {
				height: deviceWidth * 0.281333333,
				paddingHorizontal: deviceWidth * 0.068,
			},
			daysRow: {
				height: null,
				marginBottom: 0,
			},
			iconSize: deviceWidth * 0.050666667,
		};
	};

}

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
import { getDeviceWidth, getSelectedDays } from 'Lib';
import { ActionRow, DaysRow, DeviceRow, TimeRow } from 'Schedule_SubViews';
import { ScrollView } from 'react-native';

interface Props extends ScheduleProps {
	paddingRight: number,
	devices: Object,
}

type State = {
	isLoading: boolean,
};

export default class Summary extends View<null, Props, State> {

	state: State;

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

		this.state = {
			isLoading: false,
		};

		this.h1 = '5. Summary';
		this.h2 = 'Please confirm the schedule';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};
	}

	componentWillMount() {
		this.device = this._getDeviceById(this.props.schedule.deviceId);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	saveSchedule = () => {
		this.setState({
			isLoading: true,
		});
		let options = this.props.actions.getScheduleOptions(this.props.schedule);
		this.props.actions.saveSchedule(options).then((response: Object) => {
			this.setState({
				isLoading: false,
			});
			if (response.id) {
				this.resetNavigation();
				this.props.actions.getJobs();
			} else if (response.message) {
				this.props.actions.showModal(response.message);
			}
		});
	};

	resetNavigation = () => {
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
	}

	render(): React$Element<any> {
		const { schedule, paddingRight } = this.props;
		const { method, methodValue, weekdays } = schedule;
		const { row, iconSize } = this._getStyle();
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
						schedule={schedule}
						device={this.device}
						containerStyle={row}
					/>
					<DaysRow selectedDays={selectedDays}/>
				</ScrollView>
				<FloatingButton
					onPress={this.saveSchedule}
					imageSource={this.state.isLoading ? false : require('./img/check.png')}
					iconSize={iconSize}
					paddingRight={paddingRight}
					showThrobber={this.state.isLoading}
				/>
			</View>
		);
	}

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
			iconSize: deviceWidth * 0.050666667,
		};
	};

}

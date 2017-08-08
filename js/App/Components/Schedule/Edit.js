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
import { ScrollView, View } from 'react-native';
import { ScheduleProps } from './ScheduleScreen';
import { getDeviceWidth, getSelectedDays } from 'Lib';
import { ActionRow, DaysRow, ScheduleSwitch, TimeRow } from 'Schedule_SubViews';

interface Props extends ScheduleProps {
	devices: Object,
}

export default class Edit extends View<null, Props, null> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		devices: PropTypes.object,
		loading: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		this.device = this._getDeviceById(this.props.schedule.deviceId);

		this.h1 = `Edit ${this.device.name}`;
		this.h2 = 'Click the details you want to edit';
	}

	componentDidMount() {
		this.props.onDidMount(this.h1, this.h2);
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
	}

	editAction = () => {
		this._navigate('Action');
	};

	setScheduleActiveState = (active: boolean) => {
		this.props.actions.setActiveState(active);
	};

	render() {
		const { active, method, methodValue, weekdays } = this.props.schedule;
		const { scrollView, container, row } = this._getStyle();
		const selectedDays = getSelectedDays(weekdays);

		return (
			<ScrollView style={scrollView}>
				<ScheduleSwitch value={active} onValueChange={this.setScheduleActiveState}/>
				<View style={container}>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						onPress={this.editAction}
						containerStyle={row}
					/>
					<TimeRow
						schedule={this.props.schedule}
						device={this.device}
						containerStyle={row}
					/>
					<DaysRow selectedDays={selectedDays}/>
				</View>
			</ScrollView>
		);
	}

	_navigate = (routeName: string) => {
		this.props.navigation.navigate(routeName, { editMode: true });
	};

	_getDeviceById = (deviceId: number): Object => {
		return this.props.devices.byId[deviceId];
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		const offsetSmall = deviceWidth * 0.026666667;
		const offsetMiddle = deviceWidth * 0.033333333;
		const offsetLarge = deviceWidth * 0.04;

		return {
			scrollView: {
				flex: 1,
			},
			container: {
				paddingHorizontal: offsetMiddle,
			},
			row: {
				marginBottom: offsetSmall,
			},
		};
	};

}

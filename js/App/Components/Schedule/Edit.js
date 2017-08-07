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
import { ScrollView, Text, View } from 'react-native';
import { ScheduleProps } from './ScheduleScreen';

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

	componentWillMount() {
		this.device = this._getDeviceById(this.props.schedule.deviceId);
		this._shouldRender();
	}

	shouldComponentUpdate(nextProps: Props) {
		const { deviceId } = nextProps.schedule;

		if (deviceId !== this.props.schedule.deviceId) {
			this.device = this._getDeviceById(deviceId);
			this._shouldRender();
		}
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
	}

	render() {
		return (
			<ScrollView>
				<Text>Schedule active</Text>
			</ScrollView>
		);
	}

	_getDeviceById = (deviceId: number): Object => {
		return this.props.devices.byId[deviceId];
	};

	_shouldRender = () => {
		if (!this.device) {
			this.props.loading(true);
		} else {
			const { loading, onDidMount } = this.props;

			this.h1 = `Edit ${this.device.name}`;
			this.h2 = 'Click the details you want to edit';

			onDidMount(this.h1, this.h2);
			loading(false);
		}
	};

}

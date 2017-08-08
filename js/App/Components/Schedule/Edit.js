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
import { ScrollView, Switch, Text, View } from 'react-native';
import { ScheduleProps } from './ScheduleScreen';
import { getDeviceWidth, getSuntime } from 'Lib';
import Theme from 'Theme';
import { ActionRow, TimeRow } from 'Schedule_SubViews';
import _ from 'lodash';

type Time = {
	hour: number,
	minute: number,
};

interface Props extends ScheduleProps {
	devices: Object,
}

type State = {
	active: boolean,
	time: Time,
};

export default class Edit extends View<null, Props, State> {

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

		this.state = {
			active: props.schedule.active,
			time: {
				hour: 0,
				minute: 0,
			},
		};
	}

	componentWillMount() {
		this.props.loading(true);
	}

	componentDidMount() {
		this._shouldRender(this.props.schedule.deviceId);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !(_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state));
	}

	componentWillUpdate(nextProps: Props) {
		this._shouldRender(nextProps.schedule.deviceId);
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
	}

	render() {
		const { method, methodValue, type, offset, randomInterval } = this.props.schedule;
		const { active, time } = this.state;
		const { scrollView, activeRow, activeText, container, row, timeRow } = this._getStyle();

		return (
			<ScrollView style={scrollView}>
				<View style={activeRow}>
					<Text style={activeText}>
						Schedule active
					</Text>
					<Switch value={active} onValueChange={this._toggleScheduleState}/>
				</View>
				<View style={container}>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						containerStyle={row}
					/>
					<TimeRow
						type={type}
						time={time}
						offset={offset}
						randomInterval={randomInterval}
						containerStyle={[row, timeRow]}
					/>
				</View>
			</ScrollView>
		);
	}

	_toggleScheduleState = (active: boolean) => {
		this.setState({ active });
	};

	_getDeviceById = (deviceId: number): Object => {
		return this.props.devices.byId[deviceId];
	};

	_shouldRender = (deviceId: number) => {
		this.device = this._getDeviceById(deviceId);

		if (this.device) {
			this._onDidMount();
		}
	};

	_onDidMount = () => {
		const { loading, onDidMount, schedule } = this.props;

		this.h1 = `Edit ${this.device.name}`;
		this.h2 = 'Click the details you want to edit';

		if (schedule.type !== 'time') {
			this._getSuntime(this.device.clientId, schedule.type);
		} else {
			const time: Time = {
				hour: schedule.hour,
				minute: schedule.minute,
			};
			this.setState({ time });
		}

		onDidMount(this.h1, this.h2);
		loading(false);
	};

	// $FlowFixMe
	_getSuntime = async (clientId: number, type: string): void => {
		const time: Time = await getSuntime(clientId, type);

		if ((time: Time) && !_.isEqual(this.state.time, time)) {
			this.setState({ time });
		}
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
			activeRow: {
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				backgroundColor: '#fff',
				borderTopWidth: 1,
				borderBottomWidth: 1,
				borderColor: '#c8c7cc',
				paddingHorizontal: offsetMiddle,
				paddingVertical: deviceWidth * 0.02,
				marginVertical: offsetLarge,
				width: '100%',
			},
			activeText: {
				color: '#5c5c5c',
				fontSize: deviceWidth * 0.037333333,
				fontFamily: Theme.Core.fonts.robotoRegular,
			},
			container: {
				paddingHorizontal: offsetMiddle,
			},
			row: {
				marginBottom: offsetSmall,
			},
			timeRow: {
				height: deviceWidth * 0.281333333,
				paddingHorizontal: deviceWidth * 0.068,
			},
		};
	};

}

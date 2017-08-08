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
import { getDeviceWidth } from 'Lib';
import Theme from 'Theme';
import { ActionRow } from 'Schedule_SubViews';

interface Props extends ScheduleProps {
	devices: Object,
}

type State = {
	active: boolean,
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
		};
	}

	componentWillMount() {
		this.device = this._getDeviceById(this.props.schedule.deviceId);
		this._shouldRender();
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const { deviceId } = nextProps.schedule;

		if (deviceId !== this.props.schedule.deviceId) {
			this.device = this._getDeviceById(deviceId);
			return this._shouldRender();
		}

		return nextState.active !== this.state.active;
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
	}

	render() {
		const { method, methodValue } = this.props.schedule;
		const { scrollView, activeRow, activeText, container, row } = this._getStyle();

		return (
			<ScrollView style={scrollView}>
				<View style={activeRow}>
					<Text style={activeText}>
						Schedule active
					</Text>
					<Switch value={this.state.active} onValueChange={this._toggleScheduleState}/>
				</View>
				<View style={container}>
					<ActionRow
						method={method}
						showValue={true}
						methodValue={methodValue}
						containerStyle={row}
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

	_shouldRender = (): boolean => {
		if (!this.device) {
			this.props.loading(true);
			return false;
		}

		const { loading, onDidMount } = this.props;

		this.h1 = `Edit ${this.device.name}`;
		this.h2 = 'Click the details you want to edit';

		onDidMount(this.h1, this.h2);
		loading(false);
		return true;
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
		};
	};

}

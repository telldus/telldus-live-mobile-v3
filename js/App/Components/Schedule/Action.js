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
import { List, ListDataSource, View } from '../../../BaseComponents';
import type { ScheduleProps } from './ScheduleScreen';
import { ActionRow } from 'Schedule_SubViews';
import getDeviceType from '../../Lib/getDeviceType';

type State = {
	dataSource: Object,
};

export default class Action extends View<null, ScheduleProps, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		devices: PropTypes.object,
		isEditMode: PropTypes.func,
	};

	constructor(props: ScheduleProps) {
		super(props);

		this.h1 = '2. Action';
		this.h2 = 'Choose an action to execute';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		let deviceType = this.getType(props.schedule.deviceId), methods = [];
		if (deviceType === 'TOGGLE') {
			methods = [1, 2];
		}
		if (deviceType === 'DIMMER') {
			methods = [1, 2, 16];
		}
		if (deviceType === 'NAVIGATIONAL') {
			methods = [128, 256, 512];
		}
		if (deviceType === 'BELL') {
			methods = [4];
		}

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1: Object, r2: Object): boolean => r1 !== r2,
			}).cloneWithRows(methods),
		};
	}

	getType(deviceId: number): mixed {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Action';
	}

	selectAction = (action: number) => {
		const { actions, navigation, isEditMode } = this.props;

		actions.selectAction(action);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate('Time');
		}
	};

	navigateToDim = () => {
		const { navigation, isEditMode } = this.props;

		if (isEditMode()) {
			navigation.navigate('ActionDim',
				{
					actionKey: navigation.state.key,
					editMode: true,
				},
			);
		} else {
			navigation.navigate('ActionDim');
		}
	};

	render(): React$Element<List> {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this._renderRow}
			/>
		);
	}

	_renderRow = (method: number): Object => {
		const { appLayout } = this.props;
		return <ActionRow method={method} onPress={this._handlePress} appLayout={appLayout}/>;
	};

	_handlePress = (row: Object): void => {
		if (row.name === 'Dim') {
			return this.navigateToDim();
		}
		this.selectAction(row.method);
	};

}

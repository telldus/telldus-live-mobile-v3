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
import { FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { View } from '../../../BaseComponents';
import type { ScheduleProps } from './ScheduleScreen';
import { ActionRow } from './SubViews';
import getDeviceType from '../../Lib/getDeviceType';
import { getDeviceActionIcon } from '../../Lib/DeviceUtils';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

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
		const { isEditMode, intl, schedule } = this.props;
		const { formatMessage } = intl;
		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);

		let { type } = this.getDeviceInfo(schedule.deviceId), methods = [];

		if (type === 'TOGGLE') {
			methods = [1, 2];
		}
		if (type === 'DIMMER') {
			methods = [1, 2, 16];
		}
		if (type === 'NAVIGATIONAL') {
			methods = [128, 256, 512];
		}
		if (type === 'BELL') {
			methods = [4];
		}
		if (type === 'RGB') {
			methods = [1, 2, 16, 1024];
		}
		if (type === 'THERMOSTAT') {
			methods = [2048];
		}

		this.state = {
			dataSource: methods,
		};
	}

	getDeviceInfo(deviceId: number): Object {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return {};
		}

		const { supportedMethods = {}, deviceType } = filteredItem;
		return { type: getDeviceType(supportedMethods), deviceType, supportedMethods };
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Action';
	}

	selectAction: Function = (action: number) => {
		const { actions, navigation, isEditMode, route } = this.props;

		actions.selectAction(action);

		if (isEditMode()) {
			navigation.goBack();
		} else {
			navigation.navigate({
				name: 'Time',
				key: 'Time',
				params: route.params,
			});
		}
	};

	navigateToDim: Function = () => {
		const { navigation, isEditMode, route } = this.props;

		if (isEditMode()) {
			navigation.navigate({
				name: 'ActionDim',
				key: 'ActionDim',
				params: {
					...route.params,
					actionKey: 'Action',
					editMode: true,
				},
			});
		} else {
			navigation.navigate({
				name: 'ActionDim',
				key: 'ActionDim',
				params: route.params,
			});
		}
	};
	navigateToRgb: Function = () => {
		const { navigation, isEditMode, route } = this.props;

		if (isEditMode()) {
			navigation.navigate({
				name: 'ActionRGB',
				key: 'ActionRGB',
				params: {
					...route.params,
					actionKey: 'Action',
					editMode: true,
				},
			});
		} else {
			navigation.navigate({
				name: 'ActionRGB',
				key: 'ActionRGB',
				params: route.params,
			});
		}
	};

	navigateToThermostat: Function = () => {
		const { navigation, isEditMode, route } = this.props;

		if (isEditMode()) {
			navigation.navigate({
				name: 'ActionThermostat',
				key: 'ActionThermostat',
				params: {
					...route.params,
					actionKey: 'Action',
					editMode: true,
				},
			});
		} else {
			navigation.navigate({
				name: 'ActionThermostat',
				key: 'ActionThermostat',
				params: route.params,
			});
		}
	};

	getPadding(): number {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	_keyExtractor(item: Object, index: number): string {
		return index.toString();
	}

	render(): Object {
		const padding = this.getPadding();
		return (
			<FlatList
				data={this.state.dataSource}
				renderItem={this._renderRow}
				keyExtractor={this._keyExtractor}
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: padding,
				}}
			/>
		);
	}

	_renderRow = (row: Object): Object => {
		const { appLayout, intl, schedule } = this.props;
		const { item } = row;
		const padding = this.getPadding();
		const { deviceType, supportedMethods } = this.getDeviceInfo(schedule.deviceId);
		const actionIcons = getDeviceActionIcon(deviceType, null, supportedMethods);

		return <ActionRow
			method={item}
			actionIcons={actionIcons}
			onPress={this._handlePress}
			appLayout={appLayout}
			intl={intl}
			labelPostScript={intl.formatMessage(i18n.defaultDescriptionButton)}
			containerStyle={{
				marginVertical: undefined,
				marginBottom: padding / 2,
			}}/>;
	};

	_handlePress = (row: Object): void => {

		if (row.name === 'Dim') {
			return this.navigateToDim();
		}
		if (row.name === 'Rgb') {
			return this.navigateToRgb();
		}
		if (row.name === 'Thermostat') {
			return this.navigateToThermostat();
		}
		this.selectAction(row.method);
	};

}

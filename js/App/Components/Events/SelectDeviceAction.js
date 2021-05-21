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

import React, {
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import {
	CommonDevicesList,
} from './SubViews';

import {
	eventSetDeviceAction,
} from '../../Actions/Event';

type Props = {
	navigation: Object,
	onDidMount: Function,
	route: Object,
	isEditMode: Function,
};

const SelectDeviceAction: Object = React.memo<Object>((props: Props): Object => {
	const {
		navigation,
		onDidMount,
		route,
		isEditMode,
	} = props;
	const {
		params = {},
	} = route;

	useEffect(() => {
		onDidMount('Add device action', 'Turn on or off an device when this event executes'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dispatch = useDispatch();
	const {
		id,
		actionRepeats,
		actionDelay,
		actionDelayPolicy,
	} = useSelector((state: Object): Object => state.event) || {};
	const onPressNext = useCallback(({selectedDevices}: Object = {}) => {
		if (isEditMode()) {
			navigation.navigate('EditEvent', {
				...params,
			});
		} else {
			navigation.goBack();
		}
	}, [isEditMode, navigation, params]);

	const onSelectionChange = useCallback(({selectedDevices}: Object = {}) => {
		let data = [];
		Object.keys(selectedDevices).forEach((deviceId: string) => {
			const {
				method,
				stateValues = {},
			} = selectedDevices[deviceId] || {};
			const value = stateValues[method] || '';
			data.push({
				id: '',
				eventId: id,
				deviceId,
				method,
				type: 'device',
				local: true,
				value,
				repeats: actionRepeats,
				delay: actionDelay,
				delayPolicy: actionDelayPolicy,
			});
		});
		dispatch(eventSetDeviceAction(data));
	}, [actionDelay, actionDelayPolicy, actionRepeats, dispatch, id]);


	const {
		action = [],
	} = useSelector((state: Object): Object => state.event);
	const selectedDevicesInitial = useMemo((): Object => {
		return action.reduce((acc: Object, t: Object): Object => {
			const { deviceId, method, value } = t;
			return {
				...acc,
				[deviceId]: {
					deviceId,
					method,
					stateValues: {
						method: [value],
					},
				},
			};
		}, {});
	}, [action]);

	return (
		<CommonDevicesList
			navigation={navigation}
			onPressNext={onPressNext}
			route={route}
			selectedDevicesInitial={selectedDevicesInitial}
			onSelectionChange={onSelectionChange}
		/>
	);
});

export default SelectDeviceAction;

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

'use strict';

import isArray from 'lodash/isArray';
import type { Action } from 'Actions/Types';

type State = {
	devices: Array<Number>,
    sensors: Array<Object>
};

const initialState: State = {
    devices: [],
    sensors: [],
};

export default function dashboardReducer(state: State = initialState, action : Action): State {
    if (action.type === 'ADD_TO_DASHBOARD') {
        if (action.kind === 'sensor') {
            if (state.sensors.filter((item) => item.id === action.id).length > 0) {
                return state;
            }

            return {
                ...state,
                sensors: [
                    ...state.sensors,
                    {
                        'id':action.id
                    }
                ]
            };
        } else if (action.kind === 'device') {
            if (state.devices.indexOf(action.id) >= 0) { return state; }

            return {
                ...state,
                devices: [...state.devices, action.id],
            };
        }
	} else if (action.type === 'REMOVE_FROM_DASHBOARD') {
        if (action.kind === 'sensor') {
            return {
                ...state,
                sensors: state.sensors.filter((item) => item.id !== action.id)
            };
        } else if (action.kind === 'device') {
            return {
                ...state,
                devices: state.devices.filter(id => id !== action.id)
            };
        }
    } else if (action.type === 'CHANGE_SENSOR_DISPLAY_TYPE') {
        return {
            ...state,
            sensors:
                state.sensors.map(item => {
                    if (item.id === action.id) {
                        item.displayType = action.displayType;
                    }
                    return item;
                })
        };
    }

    return state;
}

export function parseDashboardForListView({ devices, sensors, dashboard }) {
	const items = [];
    dashboard = dashboard || {};
	if (isArray(devices) && dashboard.devices) {
		let devicesInDashboard = devices.filter(item => dashboard.devices.indexOf(item.id) >= 0);
		devicesInDashboard.map((item) => {
			let dashboardItem = {
				objectType: 'device',
				childObject: item,
			};
			items.push(dashboardItem);
		});
	}

	if (isArray(sensors) && dashboard.sensors) {
		let sensorsInDashboard = sensors.filter(item => dashboard.sensors.indexOf(item.id) >= 0);
		sensorsInDashboard.map((item) => {
			let dashboardItem = {
				objectType: 'sensor',
				childObject: item,
			};
			items.push(dashboardItem);
		});
	}
	return items;
}

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

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';

import { hasTokenExpired } from '../Lib/LocalControl';
import Theme from '../Theme';
import {
	methods,
} from '../../Constants';
import {
	getTempDay,
} from './scheduleUtils';

import i18n from '../Translations/common';

function prepareSectionRow(paramOne: Array<any> | Object, gateways: Array<any> | Object): Array<any> {
	let modifiedData = paramOne.map((item: Object, index: number): Object => {
		let gateway = gateways[item.clientId];
		if (gateway) {
			const { localKey, online, websocketOnline } = gateway;
			const {
				address,
				key,
				ttl,
				supportLocal,
			} = localKey;
			const tokenExpired = hasTokenExpired(ttl);
			const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);
			return { ...item, isOnline: online, websocketOnline, supportLocalControl };
		}
		return { ...item, isOnline: false, websocketOnline: false, supportLocalControl: false };
	});
	let result = groupBy(modifiedData, (items: Object): Array<any> => {
		let gateway = gateways[items.clientId];
		return gateway && gateway.id;
	});
	result = reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			data: next,
			header: index,
		});
		return acc;
	}, []);
	return orderBy(result, [(item: Object): any => {
		const { name = '' } = gateways[item.header] || {};
		return name.toLowerCase();
	}], ['asc']);
}

function parseDevicesForListView(devices: Object = {}, gateways: Object = {}, {
	arriving = {},
	selectedDevices = {},
	showPreFilledOnTop,
}: Object = {}): Object {
	let devicesList = [];
	const GeoFenceDevicesHeaderRow = {
		header: Theme.Core.GeoFenceDevicesHeaderKey,
		headerText: i18n.devices,
		data: [],
	};
	devicesList.push(GeoFenceDevicesHeaderRow);
	let isGatwaysEmpty = isEmpty(gateways);
	let isDevicesEmpty = isEmpty(devices);
	if (!isGatwaysEmpty && !isDevicesEmpty) {
		const {
			devices: arrivingDevices,
		} = arriving;
		let preFilledDevices = {}, otherDevices = {};
		Object.keys(devices).forEach((did: string) => {
			if (showPreFilledOnTop && arrivingDevices[did] && selectedDevices[did]) {
				preFilledDevices[did] = devices[did];
			} else {
				otherDevices[did] = devices[did];
			}
		});
		let _preFilledDevices = orderBy(preFilledDevices, [(device: Object): any => {
			let { name = '' } = device;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		_preFilledDevices = _preFilledDevices.filter((item: Object): boolean => {
			const { supportedMethods = {}} = item;
			return Object.keys(supportedMethods).length > 0;
		});
		let _otherDevices = orderBy(otherDevices, [(device: Object): any => {
			let { name = '' } = device;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		_otherDevices = _otherDevices.filter((item: Object): boolean => {
			const { supportedMethods = {}} = item;
			return Object.keys(supportedMethods).length > 0;
		});
		devicesList.push(...prepareSectionRow([..._preFilledDevices, ..._otherDevices], gateways));
	}
	return devicesList;
}

function parseEventsForListView(events: Object, {
	arriving,
	selectedEvents,
	showPreFilledOnTop,
}: Object): Array<Object> {
	let eventsList = [], data = [];
	let isEventsEmpty = isEmpty(events);
	if (!isEventsEmpty) {
		let preFilledEvents = {}, otherEvents = {};
		const {
			events: arrivingEvents,
		} = arriving;
		events.forEach(({id: eid}: Object, i: number) => {
			if (showPreFilledOnTop && arrivingEvents[eid] && selectedEvents[eid]) {
				preFilledEvents[eid] = events[i];
			} else {
				otherEvents[eid] = events[i];
			}
		});
		let _preFilledEvents = orderBy(preFilledEvents, [(ev: Object): any => {
			let { description = '' } = ev;
			description = typeof description !== 'string' ? '' : description;
			return description.toLowerCase();
		}], ['asc']);
		let _otherEvents = orderBy(otherEvents, [(ev: Object): any => {
			let { description = '' } = ev;
			description = typeof description !== 'string' ? '' : description;
			return description.toLowerCase();
		}], ['asc']);
		data = [..._preFilledEvents, ..._otherEvents];
	}
	const GeoFenceEventsHeaderRow = {
		header: Theme.Core.GeoFenceEventsHeaderKey,
		headerText: i18n.events,
		data,
	};
	eventsList.push(GeoFenceEventsHeaderRow);
	return eventsList;
}

function parseJobsForListView(jobs: Object, gateways: Object, devices: Object, {
	arriving,
	selectedSchedules,
	showPreFilledOnTop,
}: Object): Array<Object> {
	let jobsList = [], data = [];
	let isJobsEmpty = isEmpty(jobs);
	if (!isJobsEmpty) {
		let preFilledJobs = [], otherJobs = [];
		const {
			schedules: arrivingJobs,
		} = arriving;
		jobs.forEach(({id: jobId}: Object, i: number) => {
			const job = jobs[i];
			const device = devices[job.deviceId];
			if (!device) {
				return;
			}
			const gateway = gateways[device.clientId];
			if (!gateway) {
				return;
			}
			let tempDay = getTempDay(job, gateway);
			if (!tempDay) {
				return;
			}
			const effectiveHour = tempDay.format('HH');
			const effectiveMinute = tempDay.format('mm');
			if (showPreFilledOnTop && arrivingJobs[jobId] && selectedSchedules[jobId]) {
				preFilledJobs.push({
					...job,
					effectiveHour,
					effectiveMinute,
				});
			} else {
				otherJobs.push({
					...job,
					effectiveHour,
					effectiveMinute,
				});
			}
		});
		data = [...preFilledJobs, ...otherJobs];
	}
	const GeoFenceJobsHeaderRow = {
		header: Theme.Core.GeoFenceJobsHeaderKey,
		headerText: i18n.schedules,
		data,
	};
	jobsList.push(GeoFenceJobsHeaderRow);
	return jobsList;
}

function deg2rad(deg: number): number {
	return deg * (Math.PI / 180);
}
const GeoFenceUtils = {
	isActive(fromHr: number, fromMin: number, toHr: number, toMin: number): boolean {
		let tNow = new Date();
		const hr = tNow.getHours();
		const min = tNow.getMinutes();

		if ((fromHr * 60 + fromMin) > (hr * 60 + min)) {
			return false;
		}
		if ((toHr * 60 + toMin) < (hr * 60 + min)) {
			return false;
		}

		return true;
	},
	getRadiusFromRegion(region: Object): number {
		return 111.41284 * Math.cos(deg2rad(region.latitude)) * region.longitudeDelta * 0.45;
	},
	getLngDeltaFromRadius(latitude: number, longitude: number, radius: number): number {
		return radius / (111.41284 * Math.cos(deg2rad(latitude)) * 0.45);
	},
	getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
		let R = 6371; // Radius of the earth in km
		let dLat = deg2rad(lat2 - lat1); // deg2rad below
		let dLon = deg2rad(lon2 - lon1);
		let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
		let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		let d = R * c; // Distance in km
		return d;
	},
	prepareDataForListGeoFenceActions(devices: Object, gateways: Object, events: Object, jobs: Object, {
		showJobs,
		showDevices,
		showEvents,
		arriving,
		selectedDevices,
		selectedSchedules,
		selectedEvents,
		showPreFilledOnTop,
	}: Object): Array<Object> {
		let listData = [];
		listData.push(...parseDevicesForListView(showDevices ? devices : {}, gateways, {
			arriving,
			selectedDevices,
			showPreFilledOnTop,
		}));
		listData.push(...parseEventsForListView(showEvents ? events : {}, {
			arriving,
			selectedEvents,
			showPreFilledOnTop,
		}));
		listData.push(...parseJobsForListView(showJobs ? jobs : {}, gateways, devices, {
			arriving,
			selectedSchedules,
			showPreFilledOnTop,
		}));
		return listData;
	},
	prepareDevicesWithNewStateValues(devices: Object, selectedDevices: Object = {}): Object {
		const updatedDevices = {};
		Object.keys(selectedDevices).forEach((dId: string) => {
			const { deviceId, stateValues, method } = selectedDevices[dId];
			if (devices[deviceId]) {
				const { stateValues: stateValuesP, ...others } = devices[deviceId] || {};
				let newStateValues = {...stateValuesP} || {};
				if (stateValues) {
					Object.keys(stateValues).forEach((k: string) => {
						const methodS = methods[k];
						if (methodS === 'THERMOSTAT') {
							const { setpoint, mode } = stateValues[k];
							const { setpoint: sp = {} } = newStateValues[methodS];
							let newSetpoint = {
								...sp,
								...setpoint,
							};
							newStateValues[methodS] = {
								setpoint: newSetpoint,
								mode,
							};

						} else {
							newStateValues[methodS] = stateValues[k];
						}
					});
				}
				updatedDevices[deviceId] = {
					...others,
					stateValues: newStateValues,
					isInState: methods[method],
				};
			}
		});
		return {
			...devices,
			...updatedDevices,
		};
	},
	prepareInitialActionFromDeviceState: (device: Object): Object => {
		const {
			stateValues = {},
			isInState,
			value,
			supportedMethods = {},
		} = device;

		const {
			RGB,
			THERMOSTAT,
		} = supportedMethods;

		let action = {};

		// Must explicitly select an action
		if (THERMOSTAT || RGB) {
			return action;
		}

		let method = null;
		for (let i = 0; i < Object.keys(methods).length; i++) {
			const key = Object.keys(methods)[i];
			if (methods[key] === isInState) {
				method = key;
			}
		}

		if (!method) {
			return action;
		}

		action = {
			method,
		};

		if (!stateValues || Object.keys(stateValues).length === 0) {
			if (!value) {
				return action;
			}

			action = {
				...action,
				stateValues: {
					[method]: value,
				},
			};
			return action;
		}

		const currentStateValue = stateValues[isInState];

		if (!currentStateValue) {
			return action;
		}

		action = {
			...action,
			stateValues: {
				[method]: currentStateValue,
			},
		};

		return action;
	},
	prepareActionsInitialState: (
		currentScreen: 'ArrivingActions' | 'LeavingActions',
		arrivingActions: Object = {}, leavingActions: Object = {},
		action: 'devices' | 'events' | 'schedules',
		isEdit: boolean,
	): Object => {
		if (currentScreen === 'ArrivingActions') {
			return arrivingActions[action] || {};
		} else if (currentScreen === 'LeavingActions' && isEdit) {
			return leavingActions[action] || {};
		} else if (action === 'devices') {
			const arrivingDActions = arrivingActions.devices || {};
			let _leavingDActions = leavingActions.devices || {};
			Object.keys(arrivingDActions).forEach((did: string) => {
				const {
					method,
					...others
				} = arrivingDActions[did] || {};
				if (parseInt(method, 10) === 1) {
					_leavingDActions = {
						..._leavingDActions,
						[did]: {
							...others,
							method: 2,
						},
					};
				} else if (parseInt(method, 10) === 2) {
					_leavingDActions = {
						..._leavingDActions,
						[did]: {
							...others,
							method: 1,
						},
					};
				}
			});
			return _leavingDActions;
		}
		const _arrivingActions = arrivingActions[action] || {};
		let _leavingActions = leavingActions[action] || {};
		Object.keys(_arrivingActions).forEach((id: string) => {
			const {
				active,
				...others
			} = _arrivingActions[id];
			_leavingActions = {
				..._leavingActions,
				[id]: {
					...others,
					active: !active,
				},
			};
		});
		return _leavingActions;
	},
};



export default GeoFenceUtils;

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
 *
 */

// @flow

'use strict';

import type { ThunkAction } from './Types';
import { actions } from 'live-shared-data';
const {Devices: {getDevices}} = actions;
const {Sensors: {getSensors}} = actions;
const {Jobs: {getJobs}} = actions;
const {Websockets: {authenticateSession, connectToGateways}} = actions;

function getAppData(): ThunkAction {
	return (dispatch, getState) => {
		dispatch(authenticateSession());
		dispatch(connectToGateways());

		dispatch(getDevices());
		dispatch(getSensors());
		dispatch(getJobs());
	};
}

module.exports = {
	getAppData,
};

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
 * @providesModule Actions_Dimmer
 */

// @flow

'use strict';

import type { Action, ThunkAction } from './types';

import LiveApi from 'LiveApi';

import { format } from 'url';

export const showDimmerPopup = (name: string, value: number): Action => ({
  type: 'SHOW_DIMMER_POPUP',
  name,
  value,
});

export const hideDimmerPopup = (): Action => ({
  type: 'HIDE_DIMMER_POPUP',
});

export const setDimmerValue = (id: number, value: number): ThunkAction => (dispatch) => {
  dispatch({
    type: 'SET_DIMMER_VALUE',
    payload: {
      deviceId: id,
      value,
    },
  });
};

export const updateDimmerValue = (id: number, level: number): ThunkAction => dispatch => {
  const url = format({
    pathname: '/device/dim',
    query: {
      id,
      level,
    },
  });
  const payload = {
    url,
    requestParams: {
      method: 'GET',
    },
  };
  return LiveApi(payload).then(response => dispatch({
    type: 'DEVICE_DIM',
    deviceId: id,
    payload: {
      ...payload,
      ...response,
    },
  }));
};

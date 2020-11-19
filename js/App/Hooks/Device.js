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

import {
	useCallback,
	useEffect,
} from 'react';
const isEqual = require('react-fast-compare');
import {
	useDispatch,
} from 'react-redux';

import {
	usePreviousValue,
} from './App';
import {
	getDeviceManufacturerInfo,
} from '../Actions';

const useManufacturerInfo = (manufacturerAttributes: Object, callback: (Object) => void) => {

	const dispatch = useDispatch();

	const prevManufacturerAttributes = usePreviousValue(manufacturerAttributes);
	const isManAttrsEqual = isEqual(prevManufacturerAttributes, manufacturerAttributes);

	const ManufacturerInfo = useCallback(async (): Object => {
		const {
			manufacturerId,
			productId,
			productTypeId,
		} = manufacturerAttributes;
		let _manufacturerInfo = {};
		if (typeof manufacturerAttributes.manufacturerId !== 'undefined') {
			try {
				_manufacturerInfo = await dispatch(getDeviceManufacturerInfo(manufacturerId, productTypeId, productId));
			} catch (e) {
				_manufacturerInfo = {};
			}
		}
		return _manufacturerInfo;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isManAttrsEqual]);

	useEffect(() => {
		(async () => {
			const manufacturerInfo = await ManufacturerInfo();
			callback(manufacturerInfo);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isManAttrsEqual, callback]);
};

module.exports = {
	useManufacturerInfo,
};

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
	memo,
	useMemo,
	useCallback,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';

import AddToDashboardScaleRow from './AddToDashboardScaleRow';

import {
	addToDashboardBatch,
} from '../../../Actions/Dashboard';
import {
	getSensorInfo,
	getSensorScalesOnDb,
	SENSOR_KEY,
} from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
    data: Object,
    appLayout: Object,
    intl: Object,
    sensorId: string,
	hasPreviousDB: boolean,
};

const AddToDashboardScale = memo<Object>((props: Props): Object => {

	const {
		data,
		appLayout,
		intl,
		sensorId,
		hasPreviousDB,
	} = props;
	const {
		formatMessage,
	} = intl;

	const {
		userId,
	} = useSelector((state: Object): Object => state.user);
	const {
		defaultSettings = {},
	} = useSelector((state: Object): Object => state.app);
	const {
		sensorsById = {},
	} = useSelector((state: Object): Object => state.dashboard);
	const { activeDashboardId } = defaultSettings || {};
	const userDbsAndSensorsById = sensorsById[userId] || {};
	const sensorsByIdInCurrentDb = userDbsAndSensorsById[activeDashboardId] || {};
	const sensorInCurrentDb = sensorsByIdInCurrentDb[sensorId];
	const sensorData = getSensorScalesOnDb(sensorInCurrentDb) || data;

	const dispatch = useDispatch();
	const onValueChange = useCallback((id: string, value: boolean) => {
		if (hasPreviousDB) {
			return;
		}
		const sd = Object.keys(sensorData);
		if (sd.length === 1 && !value) {
			return;
		}
		let selectedScales = {};
		sd.forEach((ss: string) => {
			selectedScales = {
				...selectedScales,
				[ss]: true,
			};
		});
		dispatch(addToDashboardBatch(SENSOR_KEY, {
			[sensorId]: {
				selectedScales: {
					...selectedScales,
					[id]: value,
				},
			},
		}));
	}, [dispatch, sensorData, sensorId, hasPreviousDB]);

	const {
		contentCoverStyle,
		switchStyle,
	} = getStyle({
		appLayout,
	});

	const Scales = useMemo((): Array<Object> => {
		let _Scales = [];
		for (let key in data) {
			const values = data[key];
			const { value, scale, name } = values;
			const { label } = getSensorInfo(name, scale, value, true, formatMessage);
			_Scales.push(<AddToDashboardScaleRow
				key={key}
				scaleId={key}
				contentCoverStyle={contentCoverStyle}
				label={label}
				onValueChange={onValueChange}
				value={!!sensorData[key]}
				appLayout={appLayout}
				intl={intl}
				switchStyle={switchStyle}
			/>);
		}
		return _Scales;
	}, [appLayout, contentCoverStyle, data, formatMessage, intl, onValueChange, sensorData, switchStyle]);

	return Scales;
});

const getStyle = ({
	appLayout,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		contentCoverStyle: {
			marginHorizontal: padding,
		},
		switchStyle: {
			transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
		},
	};
};

export default (AddToDashboardScale: Object);

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
	useMemo,
} from 'react';
import moment from 'moment';

import {
	View,
} from '../../../../../BaseComponents';
import DashboardShadowTile from '../DashboardShadowTile';
import LastUpdatedInfo from '../Sensor/LastUpdatedInfo';

import Theme from '../../../../Theme';

type Props = {
    item: Object,
    tileWidth: number,
    intl: Object,
    style?: Object,
};

const MetWeatherDbTile = (props: Props): Object => {
	const {
		item,
		tileWidth,
		intl,
		style,
	} = props;

	const {
		meta,
	} = item;

	const lastUpdated = moment(meta.updated_at).unix();
	const minutesAgo = Math.round(((Date.now() / 1000) - lastUpdated) / 60);

	const info = useMemo((): Object => {
		const seconds = Math.trunc((new Date().getTime() / 1000) - parseFloat(lastUpdated));

		return (
			<LastUpdatedInfo
				value={-seconds}
				numeric="auto"
				updateIntervalInSeconds={60}
				timestamp={lastUpdated}
				textStyle={{
					textAlign: 'center',
					textAlignVertical: 'center',
					fontSize: Math.floor(tileWidth / 12),
					opacity: minutesAgo < 1440 ? 1 : 0.5,
					color: minutesAgo < 1440 ? Theme.Core.rowTextColor : '#990000',
				}} />
		);
	}, [lastUpdated, minutesAgo, tileWidth]);

	return (
		<DashboardShadowTile
			item={item}
			isEnabled={true}
			name={item.name}
			info={info}
			icon={'sensor'}
			iconStyle={{
				color: '#fff',
				fontSize: Math.floor(tileWidth / 6.5),
				borderRadius: Math.floor(tileWidth / 8),
				textAlign: 'center',
				alignSelf: 'center',
			}}
			iconContainerStyle={{
				backgroundColor: Theme.Core.brandPrimary,
				width: Math.floor(tileWidth / 4),
				height: Math.floor(tileWidth / 4),
				borderRadius: Math.floor(tileWidth / 8),
				alignItems: 'center',
				justifyContent: 'center',
			}}
			type={'sensor'}
			tileWidth={tileWidth}
			accessibilityLabel={''}
			formatMessage={intl.formatMessage}
			style={[
				style, {
					width: tileWidth,
					height: tileWidth,
				},
			]}>
			<View/>
		</DashboardShadowTile>
	);
};

export default MetWeatherDbTile;

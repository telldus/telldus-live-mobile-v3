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
	memo,
	useCallback,
} from 'react';
let dayjs = require('dayjs');
import {
	useDispatch,
	useSelector,
} from 'react-redux';

import DashboardShadowTile from '../DashboardShadowTile';
import LastUpdatedInfo from '../Sensor/LastUpdatedInfo';
import TypeBlockDB from '../Sensor/TypeBlockDB';
import GenericSensor from '../Sensor/GenericSensor';

import {
	checkIfLarge,
	MET_ID,
	getSensorInfo,
} from '../../../../Lib';
import {
	updateAllMetWeatherDbTiles,
} from '../../../../Actions/ThirdParties';
import {
	useAppTheme,
} from '../../../../Hooks/Theme';

import Theme from '../../../../Theme';

type Props = {
    item: Object,
    tileWidth: number,
    intl: Object,
	style?: Object,
	onPress: Function,
};

const MetWeatherDbTile = memo<Object>((props: Props): Object => {
	const {
		item,
		tileWidth,
		intl,
		style,
		onPress,
	} = props;
	const {
		meta,
		data,
		name,
		id,
	} = item;

	const dispatch = useDispatch();

	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const {
		dBTileDisplayMode,
	} = defaultSettings;
	const isBroard = dBTileDisplayMode !== 'compact';

	const {
		iconStyle,
		valueUnitCoverStyle,
		valueStyle,
		unitStyle,
		labelStyle,
		sensorValueCoverStyle,
		sensorValueCover,
		dotCoverStyle,
		dotStyle,
	} = getStyles({
		item,
		tileWidth,
		isBroard,
	});

	const {
		colors,
		selectedThemeSet,
	} = useAppTheme();

	const lastUpdated = dayjs(meta.updated_at).unix();
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

	const {slideList} = useMemo((): Object => {
		let _slideList = {};

		data.forEach((d: Object) => {
			const {
				property,
				value,
				unit,
				label,
				name: _name,
			} = d;

			const isLarge = (value !== null && typeof value !== 'undefined') ? checkIfLarge(value.toString()) : true;
			const {
				icon,
				formatOptions = {},
			} = getSensorInfo(_name, -1, value, isLarge);

			let sharedProps = {
				key: property,
				unit,
				label,
				icon: icon || 'sensor',
				isLarge: false,
				name: _name,
				value,
				iconStyle,
				valueUnitCoverStyle,
				valueStyle,
				unitStyle,
				labelStyle,
				sensorValueCoverStyle,
				formatOptions: formatOptions,
				isDB: true,
				dBTileDisplayMode,
			};
			_slideList[property] = <GenericSensor {...sharedProps}/>;
		});

		return {slideList: _slideList};
	}, [dBTileDisplayMode, data, iconStyle, labelStyle, sensorValueCoverStyle, unitStyle, valueStyle, valueUnitCoverStyle]);

	const onPressTile = useCallback(() => {
		dispatch(updateAllMetWeatherDbTiles());
		onPress(id, MET_ID);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, onPress]);

	let background = Object.keys(slideList).length === 0 ? colors.sensorValueBGColor : 'transparent';

	const backgroundColor = selectedThemeSet.key === 2 ? 'transparent' : colors.itemIconBGColor;

	return (
		<DashboardShadowTile
			item={item}
			isEnabled={true}
			name={name}
			info={info}
			icon={'sensor'}
			iconStyle={{
				color: colors.baseColor,
				fontSize: Math.floor(tileWidth / 6.5),
				borderRadius: Math.floor(tileWidth / 8),
				textAlign: 'center',
				alignSelf: 'center',
			}}
			iconContainerStyle={{
				backgroundColor,
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
					height: (isBroard ? tileWidth : (tileWidth * 0.52)),
				},
			]}>
			<TypeBlockDB
				sensors={slideList}
				onPress={onPressTile}
				id={item.id}
				lastUpdated={lastUpdated}
				tileWidth={tileWidth}
				extraData={{
					background,
					isBroard,
				}}
				style={{
					flexDirection: 'row',
					borderBottomLeftRadius: 2,
					borderBottomRightRadius: 2,
					justifyContent: 'flex-start',
					alignItems: 'center',
					width: tileWidth,
					height: tileWidth * (isBroard ? 0.4 : 0.3),
					backgroundColor: background,
				}}
				valueCoverStyle={sensorValueCover}
				dotCoverStyle={dotCoverStyle}
				dotStyle={dotStyle}/>
		</DashboardShadowTile>
	);
});

const getStyles = ({
	tileWidth,
	item,
	isBroard,
}: Object): Object => {
	const { data = []} = item;

	const dotSize = tileWidth * 0.045;

	return {
		iconStyle: {
			fontSize: tileWidth * (isBroard ? 0.28 : 0.2),
		},
		valueUnitCoverStyle: {
			height: tileWidth * 0.16,
		},
		valueStyle: {
			fontSize: tileWidth * 0.14,
			height: tileWidth * 0.175,
		},
		unitStyle: {
			fontSize: tileWidth * 0.09,
		},
		labelStyle: {
			fontSize: tileWidth * 0.09,
			height: tileWidth * 0.12,
			textAlignVertical: 'center',
		},
		sensorValueCoverStyle: {
			marginBottom: (data.length <= 1 || !isBroard) ? 0 : tileWidth * 0.1,
		},
		sensorValueCover: {
			height: '100%',
			width: tileWidth,
			alignItems: 'flex-start',
			justifyContent: 'center',
		},
		dotCoverStyle: {
			position: 'absolute',
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			bottom: 3,
		},
		dotStyle: {
			width: dotSize,
			height: dotSize,
			borderRadius: dotSize / 2,
			marginLeft: 2 + (dotSize * 0.2),
		},
	};
};

export default (MetWeatherDbTile: Object);

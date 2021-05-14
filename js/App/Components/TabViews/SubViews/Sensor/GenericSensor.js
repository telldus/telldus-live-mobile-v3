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
} from 'react';
import {
	useSelector,
} from 'react-redux';

import { FormattedNumber, Text, View, IconTelldus } from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

type sensorProps = {
	name: string,
	value: string,
	unit?: string,
	icon: string,
	label: string,
	isLarge: boolean,
	formatOptions?: Object,
	coverStyle?: Object,
	iconStyle?: Object,
	valueStyle?: Object,
	unitStyle?: Object,
	labelStyle?: Object,
	valueUnitCoverStyle?: Object,
	sensorValueCoverStyle?: Object,
	isDB?: boolean,
};

const GenericSensor = memo<Object>(({
	name, value, unit, icon, label, isLarge, formatOptions,
	coverStyle, valueUnitCoverStyle, sensorValueCoverStyle,
	iconStyle, valueStyle, unitStyle, labelStyle,
	isDB = false,
}: sensorProps): Object => {

	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	const { dBTileDisplayMode } = defaultSettings;
	const isBroard = dBTileDisplayMode !== 'compact' || !isDB;

	const { sensorValue, sensorValueText, sensorValueLabelText } = Theme.Styles;

	const labelLength = label.length;

	return (
		<View style={[sensorValue, coverStyle]}>
			{!isLarge && labelLength < 14 && (
				<IconTelldus icon={icon} style={{
					color: '#fff',
					...iconStyle}}/>
			)}
			<View style={[Theme.Styles.sensorValueCover, sensorValueCoverStyle]}>
				{
					name === 'wdir' ?
						<Text style={[sensorValueText, valueStyle]}>
							{value}
						</Text>
						:
						<View style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
							{typeof value !== 'undefined' ? <FormattedNumber
								value={value}
								{...formatOptions}
								suffix={unit}
								style={[sensorValueText, valueStyle]}
								suffixStyle={[sensorValueLabelText, unitStyle]}/>
								:
								<Text style={[sensorValueText, valueStyle]}/>
							}
						</View>
				}
				{isBroard && (
					<Text style={[{color: '#ffffff'}, labelStyle]}>
						{label}
					</Text>
				)}
			</View>
		</View>
	);
});

export default (GenericSensor: Object);

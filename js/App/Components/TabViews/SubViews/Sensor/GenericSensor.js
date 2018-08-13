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

import React from 'react';

import { FormattedNumber, Text, View, IconTelldus } from '../../../../../BaseComponents';

import Theme from '../../../../Theme';

type sensorProps = {
	name: string,
	value: string,
	unit?: string,
	icon: string,
	label?: string,
	isLarge: boolean,
	formatOptions?: Object,
	coverStyle?: Object,
	iconStyle?: Object,
	valueStyle?: Object,
	unitStyle?: Object,
	labelStyle?: Object,
};

const GenericSensor = ({ name, value, unit, icon, label, isLarge, formatOptions, coverStyle, iconStyle, valueStyle, unitStyle, labelStyle }: sensorProps): Object => {
	const { sensorValue, sensorValueText, sensorValueLabelText } = Theme.Styles;

	return (
		<View style={[sensorValue, coverStyle]}>
			{!isLarge && (
				<IconTelldus icon={icon} style={{
					fontSize: 40,
					color: '#fff',
					marginTop: 5,
					...iconStyle}}/>
			)}
			<View style={Theme.Styles.sensorValueCover}>
				{
					name === 'wdir' ?
						<Text style={[sensorValueText, valueStyle]}>
							{value}
						</Text>
						:
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Text>
								<Text style={[sensorValueText, valueStyle]}>
									<FormattedNumber value={value} {...formatOptions}/>
								</Text>
								{/** {'\n\n'}
							  *	A workaround to add space between the two Texts which are children of the same parent Text node.
							  */}
								<Text style={{fontSize: 8, color: 'transparent'}} allowFontScaling={false}>
								!
								</Text>
								<Text style={[sensorValueLabelText, unitStyle]}>
									{unit}
								</Text>
							</Text>
						</View>
				}
				<Text style={[{color: '#ffffff'}, labelStyle]}>
					{label}
				</Text>
			</View>
		</View>
	);
};

export default GenericSensor;

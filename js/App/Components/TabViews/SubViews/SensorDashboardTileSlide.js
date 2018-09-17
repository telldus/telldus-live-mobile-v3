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
import { Text, View, IconTelldus } from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
	tileWidth: number,
	data: Object,
	isGatewayActive: boolean,
};

class SensorDashboardTileSlide extends View {
	props: Props;

	render(): Object {
		let { data, tileWidth, isGatewayActive } = this.props;
		let containerStyle = isGatewayActive ? {backgroundColor: Theme.Core.brandPrimary} : {backgroundColor: Theme.Core.offlineColor};

		return (
			<View style={[Theme.Styles.sensorTileItem, containerStyle]}>
				{!data.isLarge && (<View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
					<IconTelldus icon={data.icon} color="#fff" style={{
						fontSize: tileWidth * 0.3,
						color: '#fff',
					}}/>
				</View>
				)}
				<View style={{ flex: 5, justifyContent: 'center', alignItems: 'flex-start', marginLeft: data.isLarge ? tileWidth * 0.1 : 0 }}>
					<View style={{flexDirection: 'row', alignItems: 'baseline'}}>
						<Text>
							<Text style={{
								color: '#fff',
								fontSize: Math.floor(tileWidth / 8),
							}}>
								{!!data.text && data.text}
								{!!data.text2 && data.text2}
								{!!data.text3 && data.text3}
							</Text>
							<Text style={{
								color: '#fff',
								fontSize: Math.floor(tileWidth / 14),
							}}>
								{data.unit}
							</Text>
						</Text>
					</View>
					<Text style={{
						color: '#fff',
						fontSize: Math.floor(tileWidth / 12.5),
					}}>
						{data.label}
					</Text>
				</View>
			</View>
		);
	}
}

module.exports = SensorDashboardTileSlide;

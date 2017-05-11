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

'use strict';

import React from 'react';
import { View } from 'BaseComponents';

module.exports = class DashboardShadowTile extends View {
	render() {
		return (
			<View
				style={[this.props.style, {
					borderRadius: 7,
					shadowColor: '#000000',
					shadowOffset: {width: 0, height: 0},
					shadowRadius: 3,
					shadowOpacity: 1.0,
					elevation: 10,
				}]}>
                <View style={{
	flex: 1,
	flexDirection: 'column',
	borderRadius: 7,
	overflow: 'hidden',
}}>
                    {this.props.children}
                </View>
            </View>
		);
	}
};

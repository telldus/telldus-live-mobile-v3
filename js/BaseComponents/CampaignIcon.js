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
import { useSelector } from 'react-redux';

import View from './View';
import IconTelldus from './IconTelldus';

const CampaignIcon = (props: Object): Object => {
	const {
		style,
		size,
		level,
	} = props;

	const { hasVisitedCampaign } = useSelector((state: Object): Object => state.user);

	const badgeSize = size * 0.4;

	const _level = level || 22;

	return (
		<View>
			<IconTelldus
				icon="campaign"
				size={size}
				style={style}
				level={_level}/>
			{!hasVisitedCampaign && <View
				level={9}
				style={{
					position: 'absolute',
					height: badgeSize,
					width: badgeSize,
					borderRadius: badgeSize / 2,
					top: 1,
					right: 0,
				}}/>
			}
		</View>
	);
};

export default (React.memo<Object>(CampaignIcon): Object);

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

import React, { Component } from 'react';
import { connect } from 'react-redux';

import View from './View';
import IconTelldus from './IconTelldus';

import { Core } from '../App/Theme';

type Props = {
	style: Array<any> | number | Object,
	size: number,
	hasVisitedCampaign: boolean,
};

class CampaignIcon extends Component<Props, null> {
	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const {
			style,
			size,
			hasVisitedCampaign,
		} = this.props;

		const badgeSize = size * 0.4;

		return (
			<View>
				<IconTelldus
					icon="campaign"
					size={size}
					style={style}
					color={'#fff'}/>
				{!hasVisitedCampaign && <View style={{
					position: 'absolute',
					backgroundColor: Core.badgeBg,
					height: badgeSize,
					width: badgeSize,
					borderRadius: badgeSize / 2,
					top: 1,
					right: 0,
				}}/>
				}
			</View>
		);
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		hasVisitedCampaign,
	} = state.user;

	return {
		hasVisitedCampaign,
	};
}

export default connect(mapStateToProps, null)(CampaignIcon);

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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { View, Image } from '../../../../BaseComponents';
import DeviceLocationDetail from '../../DeviceDetails/SubViews/DeviceLocationDetail';

import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import Status from './Gateway/Status';

import { getRelativeDimensions } from '../../../Lib';
import Theme from '../../../Theme';

type Props = {
    location: Object,
	appLayout: Object,
	intl: Object,
	navigation: Object,
};

type State = {
};

class GatewayRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

	onPressGateway: () => void;

	constructor(props: Props) {
		super(props);

		this.onPressGateway = this.onPressGateway.bind(this);
	}

	onPressGateway() {
		let { location } = this.props;
		this.props.navigation.push('LocationDetails', {location});
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, localKey: Object): Object {
		return (
			<Status online={online} websocketOnline={websocketOnline} intl={this.props.intl} localKey={localKey}/>
		);
	}


	render(): Object {
		let { location, appLayout } = this.props;
		let { name, type, online, websocketOnline, localKey } = location;

		let info = this.getLocationStatus(online, websocketOnline, localKey);

		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};

		let styles = this.getStyles(appLayout);

		return (
			<View style={styles.rowItemsCover}>
				<Image source={require('../../TabViews/img/right-arrow-key.png')} tintColor="#A59F9A90" style={styles.arrow}/>
				<DeviceLocationDetail {...locationData}
					style={styles.locationDetails}
					onPress={this.onPressGateway}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const rowWidth = width - (padding * 2);
		const rowHeight = deviceWidth * 0.27;

		return {
			rowItemsCover: {
				flexDirection: 'column',
				alignItems: 'center',
			},
			locationDetails: {
				width: rowWidth,
				height: rowHeight,
				marginVertical: padding / 4,
			},
			arrow: {
				position: 'absolute',
				zIndex: 1,
				tintColor: '#A59F9A90',
				right: padding * 2,
				top: '40%',
				height: rowHeight * 0.25,
				width: rowHeight * 0.2,
			},
		};
	}
}

function mapStateToProps(state: Object, props: Object): Object {
	return {
		appLayout: getRelativeDimensions(state.App.layout),
	};
}

export default connect(mapStateToProps, null)(GatewayRow);

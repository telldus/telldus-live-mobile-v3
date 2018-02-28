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

type Props = {
    location: Object,
    stackNavigator: Object,
    appLayout: Object,
};

type State = {
};

class GatewayRow extends PureComponent<Props, State> {
props: Props;
state: State;

onPressGateway: () => void;

constructor(props) {
	super();

	this.onPressGateway = this.onPressGateway.bind(this);
}

onPressGateway() {
	let { location } = this.props;
	this.props.stackNavigator.navigate('LocationDetails', {location, renderRootHeader: true});
}

render(): Object {
	let { location, appLayout } = this.props;
	let { name, type } = location;
	let { height, width } = appLayout;
	let isPortrait = height > width;
	let rowHeight = isPortrait ? height * 0.14 : width * 0.14;

	let locationImageUrl = getLocationImageUrl(type);
	let locationData = {
		image: locationImageUrl,
		H1: name,
		H2: type,
	};

	let styles = this.getStyles(appLayout);

	return (
		<View style={styles.rowItemsCover}>
			<Image source={require('../../TabViews/img/right-arrow-key.png')} tintColor="#A59F9A90" style={styles.arrow}/>
			<DeviceLocationDetail {...locationData}
				style={{
					width: (appLayout.width - 20),
					height: rowHeight,
					marginVertical: 5,
				}}
				onPress={this.onPressGateway}/>
		</View>
	);
}

getStyles(appLayout: Object) :Object {
	return {
		rowItemsCover: {
			flexDirection: 'column',
			alignItems: 'center',
		},
		arrow: {
			position: 'absolute',
			zIndex: 1,
			tintColor: '#A59F9A90',
			right: 25,
			top: '40%',
			height: 28,
			width: 12,
		},
	};
}
}

function mapStateToProps(state, props) {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(GatewayRow);

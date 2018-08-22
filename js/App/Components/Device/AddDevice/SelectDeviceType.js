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
 *
 */

// @flow

'use strict';

import React from 'react';

import {
	View,
} from '../../../../BaseComponents';
import {
	DeviceTypeBlock,
} from './SubViews';

import Theme from '../../../Theme';

const availableTypes = {
	'zwave': [
		{
			h1: 'Z-Wave',
			h2: 'All Z-Wave devices',
			module: 'zwave',
			action: 'addNodeToNetwork',
		},
		{
			h1: 'Z-Wave Secure',
			h2: 'Z-Wave devices for secure inclusion',
			module: 'zwave',
			action: 'addSecureNodeToNetwork',
		},
	],
};

type Props = {
	appLayout: Object,

	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

type State = {
};

class SelectDeviceType extends View<Props, State> {
props: Props;
state: State;

onChooseType: (Object) => void;
constructor(props: Props) {
	super(props);

	this.onChooseType = this.onChooseType.bind(this);
}
componentDidMount() {
	const { onDidMount } = this.props;
	onDidMount('2. Device Type', 'Select the type of your device');
}

onChooseType({module, action}: Object) {
	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		module,
		action,
	});
	navigation.navigate('IncludeDevice', {
		gateway,
	});
}

getDeviceTypes(): Array<any> {
	const { navigation } = this.props, types = [];
	const gateway = navigation.getParam('gateway', {});
	const { transports } = gateway;
	const transportsAsArray = transports.split(',');
	transportsAsArray.map((ts: string) => {
		if (availableTypes[ts]) {
			types.push(...availableTypes[ts]);
		}
	});
	return types;
}

getDeviceTypesToRender(types: Array<any>, appLayout: Object): Array<Object> {
	return types.map((type: Object, i: number): Object => {
		return (
			<DeviceTypeBlock
				key={i}
				{...type}
				appLayout={appLayout}
				onPress={this.onChooseType}
			/>
		);
	});
}
render(): Object {
	const { appLayout } = this.props;
	const types = this.getDeviceTypes();
	const typesToRender = this.getDeviceTypesToRender(types, appLayout);

	const {
		container,
	} = this.getStyles();

	return (
		<View style={container}>
			{typesToRender}
		</View>
	);
}
getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const padding = deviceWidth * Theme.Core.paddingFactor;

	return {
		container: {
			paddingTop: padding,
			paddingBottom: padding / 2,
		},
	};
}
}

export default SelectDeviceType;

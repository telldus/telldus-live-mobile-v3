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
import { ScrollView } from 'react-native';

import {
	View,
} from '../../../../BaseComponents';
import {
	DeviceTypeBlock,
} from './SubViews';
import { getAvailableDeviceTypesAndInfo } from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	currentScreen: string,
	route: Object,

	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
	intl: Object,
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
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelDeviceType), formatMessage(i18n.AddZDTypeHeaderTwo));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'SelectDeviceType';
}

onChooseType({module, action, secure}: Object) {
	const { navigation, route } = this.props;
	const {
		gateway = {},
	} = route.params || {};

	if (module === 'zwave') {
		navigation.navigate('IncludeDevice', {
			gateway,
			module,
			action,
			secure,
			parent: 'devices_tab',
		});
	} else if (module === 'rf433') {
		navigation.navigate('SelectModel433', {
			gateway,
			module,
			action,
			secure,
			shortcutToTelldus: true,
		});
	}
}

getDeviceTypes(): Array<any> {
	const { route, intl } = this.props;
	const { formatMessage, formatNumber } = intl;
	const {
		gateway = {},
	} = route.params || {};
	const { transports = '' } = gateway;
	const transportsAsArray = transports.split(',');

	let types = {};
	const availableDeviceTypes = getAvailableDeviceTypesAndInfo(formatMessage, formatNumber, true);
	transportsAsArray.map((ts: string = '') => {
		const availableTypes = availableDeviceTypes[ts.trim()];
		if (availableTypes) {
			types = {
				...types,
				...availableTypes.reduce((acc: Object, item: Object): Object => {
					acc[item.uuid] = item;
					return acc;
				}, {}),
			};
		}
	});
	let finalTypes = [];
	Object.keys(types).forEach((i: Object) => {
		if (types[i].type !== 'sensor') {
			finalTypes.push({
				...types[i],
			});
		}
	});
	return finalTypes;
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
		contentContainerStyle,
	} = this.getStyles();

	return (
		<ScrollView style={container} contentContainerStyle={contentContainerStyle}>
			{typesToRender}
		</ScrollView>
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
			flex: 1,
			paddingTop: padding,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingBottom: padding * 2,
		},
	};
}
}

export default (SelectDeviceType: Object);

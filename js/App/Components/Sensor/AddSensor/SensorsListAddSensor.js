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
import { FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
	View,
	Text,
} from '../../../../BaseComponents';

import {
	getNoNameSensors,
} from '../../../Lib/SensorUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	rows: Array<Object>,
	currentScreen: string,

    navigation: Object,
    appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
	actions: Object,
	intl: Object,
};

type State = {
    isRefreshing: boolean,
};

class SensorsListAddSensor extends View<Props, State> {
props: Props;
state: State;

renderRow: (Object) => Object;
onRefresh: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		isRefreshing: false,
	};
	this.renderRow = this.renderRow.bind(this);
	this.onRefresh = this.onRefresh.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelSelectSensor), formatMessage(i18n.labelSelectSensorToAdd));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'InitialScreenAddSensor';
}

keyExtractor(item: Object): string {
	return item.id.toString();
}

onRefresh() {
	const { actions } = this.props;
	this.setState({
		isRefreshing: true,
	});
	actions.getGateways().then(() => {
		this.setState({
			isRefreshing: false,
		});
	}).catch(() => {
		this.setState({
			isRefreshing: false,
		});
	});
}

getPadding(): number {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	return deviceWidth * Theme.Core.paddingFactor;
}

onSelectSensor = (gateway: Object) => {
	const { navigation } = this.props;
	navigation.navigate('SetSensorName', {
		gateway,
	});
}

renderRow(item: Object): Object {

	return (
		<TouchableOpacity onPress={this.onSelectSensor}>
			<View>
				<Text>
				Sensors Row
				</Text>
			</View>
		</TouchableOpacity>
	);
}

render(): Object {
	const padding = this.getPadding();
	const { rows } = this.props;

	return (
		<FlatList
			data={rows}
			renderItem={this.renderRow}
			onRefresh={this.onRefresh}
			refreshing={this.state.isRefreshing}
			keyExtractor={this.keyExtractor}
			contentContainerStyle={{
				marginVertical: padding - (padding / 4),
			}}
		/>
	);
}
}

const parse433SensorsForListView = (sensors: Object, gatewayId: string): Array<Object> => {
	return getNoNameSensors(sensors, gatewayId);
};

const getRows433Sensors = createSelector(
	[
		({ sensors }: Object): Object => sensors,
		({ gateway }: Object): Object => gateway.id,
	],
	(sensors: Object, gatewayId: string): Array<any> => parse433SensorsForListView(sensors, gatewayId)
);

function mapStateToProps(state: Object, ownProps: Object): Object {

	const gateway = ownProps.navigation.getParam('gateway', {});

	return {
		rows: getRows433Sensors({...state, gateway}),
	};
}

export default connect(mapStateToProps, null)(SensorsListAddSensor);

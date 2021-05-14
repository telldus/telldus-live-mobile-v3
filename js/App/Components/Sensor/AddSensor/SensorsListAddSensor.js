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
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
	View,
	InfoBlock,
	ThemedRefreshControl,
} from '../../../../BaseComponents';
import {
	SensorRow,
} from './SubViews';

import {
	getNoNameSensors,
} from '../../../Lib/SensorUtils';
import capitalize from '../../../Lib/capitalize';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	rows: Array<Object>,
	currentScreen: string,
	route: Object,

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
	onDidMount(capitalize(formatMessage(i18n.labelSelectSensor)), formatMessage(i18n.labelSelectSensorToAdd));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'SensorsListAddSensor';
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

onSelectSensor = (sensor: Object) => {
	const { navigation, route } = this.props;
	const prevParams = route.params || {};
	navigation.navigate('SetSensorName', {
		sensor,
		...prevParams,
	});
}

renderRow(item: Object): Object {
	return (
		<SensorRow
			onSelectSensor={this.onSelectSensor}
			appLayout={this.props.appLayout}
			item={item.item}/>
	);
}

render(): Object {
	const padding = this.getPadding();
	const { rows, intl, appLayout } = this.props;

	const {
		emptyCover,
		infoContainer,
	} = this.getStyles(appLayout);

	if (rows.length === 0) {
		return (
			<View style={emptyCover}>
				<InfoBlock
					infoContainer={infoContainer}
					appLayout={appLayout}
					text={intl.formatMessage(i18n.noSensorsFound)}/>
			</View>
		);
	}
	return (
		<FlatList
			data={rows}
			renderItem={this.renderRow}
			refreshControl={
				<ThemedRefreshControl
					onRefresh={this.onRefresh}
					refreshing={this.state.isRefreshing}
				/>
			}
			keyExtractor={this.keyExtractor}
			contentContainerStyle={{
				paddingVertical: padding,
			}}
		/>
	);
}

getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		emptyCover: {
			flex: 1,
			margin: padding,
			alignItems: 'center',
			justifyContent: 'flex-start',
		},
		infoContainer: {
			flex: 0,
			width: '100%',
		},
	};
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

	const { gateway = {}} = ownProps.route.params || {};

	return {
		rows: getRows433Sensors({...state, gateway}),
	};
}

export default (connect(mapStateToProps, null)(SensorsListAddSensor): Object);

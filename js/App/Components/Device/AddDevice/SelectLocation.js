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
} from '../../../../BaseComponents';
import { GatewayRow } from '../../TabViews/SubViews';

import { parseGatewaysForListView } from '../../../Reducers/Gateways';

import Theme from '../../../Theme';

type Props = {
    rows: Array<Object>,

    navigation: Object,
    appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
	actions: Object,
	intl: Object,
};

type State = {
    isRefreshing: boolean,
};

class SelectLocation extends View<Props, State> {
props: Props;
state: State;

renderRow: (Object) => Object;
onRefresh: () => void;
onChooseLocation: (Object) => void;
constructor(props: Props) {
	super(props);

	this.state = {
		isRefreshing: false,
	};
	this.renderRow = this.renderRow.bind(this);
	this.onRefresh = this.onRefresh.bind(this);
	this.onChooseLocation = this.onChooseLocation.bind(this);
}
componentDidMount() {
	const { onDidMount } = this.props;
	onDidMount('Select Location', 'Select Location for your device');
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

onChooseLocation(gateway: Object) {
	const { navigation } = this.props;
	navigation.navigate('SelectDeviceType', {
		gateway,
	});
}

renderRow(item: Object): Object {
	const { navigation, intl } = this.props;
	return (
		<GatewayRow
			location={item.item}
			navigation={navigation}
			intl={intl}
			onPress={this.onChooseLocation}/>
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

const getRows = createSelector(
	[
		({ gateways }: Object): Object => gateways,
	],
	(gateways: Object): Array<any> => parseGatewaysForListView(gateways)
);

function mapStateToProps(state: Object, ownProps: Object): Object {

	return {
		rows: getRows(state),
	};
}

export default connect(mapStateToProps, null)(SelectLocation);

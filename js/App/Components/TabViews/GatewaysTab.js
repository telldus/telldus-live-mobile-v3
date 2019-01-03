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
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { View } from '../../../BaseComponents';
import { GatewayRow } from './SubViews';
import { getGateways, addNewGateway } from '../../Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import { getTabBarIcon } from '../../Lib';
import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	rows: Array<Object>,
	screenProps: Object,
	navigation: Object,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
};

type State = {
	isRefreshing: boolean,
};

type renderRowProps = {
	name: string,
	online: boolean,
	websocketOnline: boolean,
	appLayout: Object,
};

class GatewaysTab extends View {

	props: Props;
	state: State;

	renderRow: (renderRowProps) => Object;
	onRefresh: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(i18n.gateways),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'gateways'),
	});

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.screenProps.intl;

		this.state = {
			isRefreshing: false,
		};

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps.screenProps;
		return currentScreen === 'Gateways';
	}

	onRefresh() {
		this.props.dispatch(getGateways());
	}

	renderRow(item: Object): Object {
		const { navigation, screenProps } = this.props;
		const { intl } = screenProps;
		return (
			<GatewayRow location={item.item} navigation={navigation} intl={intl}/>
		);
	}

	keyExtractor(item: Object): string {
		return item.id.toString();
	}

	getPadding(): number {
		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	render(): Object {
		const padding = this.getPadding();
		const { rows } = this.props;

		return (
			<View style={{flex: 1}}>
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
			</View>
		);
	}
}

const getRows = createSelector(
	[
		({ gateways }: Object): Object => gateways,
	],
	(gateways: Object): Array<any> => parseGatewaysForListView(gateways)
);

function mapStateToProps(state: Object, props: Object): Object {
	return {
		rows: getRows(state),
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		addNewLocation: (): any => {
			return dispatch(addNewGateway());
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(GatewaysTab);

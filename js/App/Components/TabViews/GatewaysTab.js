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
import { defineMessages } from 'react-intl';
import isEqual from 'lodash/isEqual';

import { View, FloatingButton } from '../../../BaseComponents';
import { GatewayRow } from './SubViews';
import { getGateways, addNewGateway, showToast } from '../../Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import { getRelativeDimensions, getTabBarIcon } from '../../Lib';
import Theme from '../../Theme';

import i18n from '../../Translations/common';
const messages = defineMessages({
	gateways: {
		id: 'pages.gateways',
		defaultMessage: 'Gateways',
		description: 'The gateways tab',
	},
});

type Props = {
	rows: Array<Object>,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
	screenProps: Object,
	appLayout: Object,
	navigation: Object,
};

type State = {
	dataSource: Array<Object>,
	settings: boolean,
	isLoading: boolean,
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
	addLocation: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(messages.gateways),
		tabBarIcon: ({ focused, tintColor }: Object): Object => getTabBarIcon(focused, tintColor, 'gateways'),
	});

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const isRowsEqual = isEqual(state.dataSource, props.rows);
		if (!isRowsEqual) {
			return {
				dataSource: props.rows,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.screenProps.intl;

		this.state = {
			dataSource: this.props.rows,
			settings: false,
			isLoading: false,
			isRefreshing: false,
		};

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.addLocation = this.addLocation.bind(this);
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

	addLocation() {
		this.setState({
			isLoading: true,
		});
		this.props.addNewLocation()
			.then((response: Object) => {
				this.props.navigation.push('AddLocation', {clients: response.client});
				this.setState({
					isLoading: false,
				});
			}).catch((error: Object) => {
				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
				this.setState({
					isLoading: false,
				});
				this.props.dispatch(showToast(message));
			});
	}

	getPadding(): number {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	render(): Object {
		const padding = this.getPadding();
		return (
			<View style={{flex: 1}}>
				<FlatList
					data={this.state.dataSource}
					renderItem={this.renderRow}
					onRefresh={this.onRefresh}
					refreshing={this.state.isRefreshing}
					keyExtractor={this.keyExtractor}
					contentContainerStyle={{
						marginVertical: padding - (padding / 4),
					}}
				/>
				<FloatingButton
					onPress={this.addLocation}
					imageSource={this.state.isLoading ? false : require('../TabViews/img/iconPlus.png')}
					showThrobber={this.state.isLoading}/>
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
		appLayout: getRelativeDimensions(state.App.layout),
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

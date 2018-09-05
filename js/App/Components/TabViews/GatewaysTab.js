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

import { View, FloatingButton } from '../../../BaseComponents';
import { GatewayRow } from './SubViews';
import { getGateways, addNewGateway, showToast } from '../../Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import { getTabBarIcon } from '../../Lib';
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
	screenProps: Object,
	navigation: Object,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
};

type State = {
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

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.screenProps.intl;

		this.state = {
			isLoading: false,
			isRefreshing: false,
		};

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.addLocation = this.addLocation.bind(this);
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

	addLocation() {
		this.setState({
			isLoading: true,
		});
		this.props.addNewLocation()
			.then((response: Object) => {
				this.props.navigation.navigate({
					routeName: 'AddLocation',
					key: 'AddLocation',
					params: { clients: response.client },
				});
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
				<FloatingButton
					onPress={this.addLocation}
					imageSource={this.state.isLoading ? false : {uri: 'icon_plus'}}
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

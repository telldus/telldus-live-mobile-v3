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
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';

import { List, ListDataSource, View, StyleSheet, FloatingButton, Image } from '../../../BaseComponents';
import DeviceLocationDetail from './../DeviceDetails/SubViews/DeviceLocationDetail';
import { getGateways, addNewGateway } from '../../Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import getTabBarIcon from '../../Lib/getTabBarIcon';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';

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
	appLayout: Object,
	addNewLocation: () => Promise<any>,
	screenProps: Object,
};

type State = {
	dataSource: Object,
	settings: boolean,
	isLoading: boolean,
};

type renderRowProps = {
	name: string,
	online: boolean,
	websocketOnline: boolean,
};

class GatewaysTab extends View {

	props: Props;
	state: State;

	renderRow: (renderRowProps) => Object;
	onRefresh: () => void;
	addLocation: () => void;

	static navigationOptions = ({navigation, screenProps}) => ({
		title: screenProps.intl.formatMessage(messages.gateways),
		tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(focused, tintColor, 'gateways'),
	});

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.screenProps.intl;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
			}).cloneWithRows(this.props.rows),
			settings: false,
			isLoading: false,
		};

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.addLocation = this.addLocation.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.rows),
		});
	}

	rowHasChanged(r1, r2) {
		return r1 !== r2;
	}

	onRefresh() {
		this.props.dispatch(getGateways());
	}

	renderRow({ name, type, online, websocketOnline }) {
		let { appLayout } = this.props;
		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
		};
		return (
			<View style={styles.rowItemsCover}>
				<Image source={require('../TabViews/img/right-arrow-key.png')} tintColor="#A59F9A90" style={styles.arrow}/>
				<DeviceLocationDetail {...locationData} style={{ width: (appLayout.width - 20), marginVertical: 5 }}/>
			</View>
		);
	}

	addLocation() {
		this.setState({
			isLoading: true,
		});
		this.props.addNewLocation()
			.then(response => {
				this.props.screenProps.stackNavigator.navigate('AddLocation', {clients: response.client, renderRootHeader: true});
				this.setState({
					isLoading: false,
				});
			}).catch(error => {
				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
				this.setState({
					isLoading: false,
				});
				this.props.dispatch({
					type: 'GLOBAL_ERROR_SHOW',
					payload: {
						source: 'Add_Location',
						customMessage: message,
					},
				});
			});
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					onRefresh={this.onRefresh}
					style={{paddingTop: 10}}
				/>
				<FloatingButton
					onPress={this.addLocation}
					imageSource={this.state.isLoading ? false : require('../TabViews/img/iconPlus.png')}
					showThrobber={this.state.isLoading}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	rowItemsCover: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	arrow: {
		position: 'absolute',
		zIndex: 1,
		tintColor: '#A59F9A90',
		right: 25,
		top: '45%',
	},
});

const getRows = createSelector(
	[
		({ gateways }) => gateways,
	],
	(gateways) => parseGatewaysForListView(gateways)
);

function mapStateToProps(state, props) {
	return {
		rows: getRows(state),
		appLayout: state.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		addNewLocation: () => {
			return dispatch(addNewGateway());
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(GatewaysTab);

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
import { isIphoneX } from 'react-native-iphone-x-helper';

import { List, ListDataSource, View, StyleSheet, FloatingButton, Text } from 'BaseComponents';
import DeviceLocationDetail from './../DeviceDetails/SubViews/DeviceLocationDetail';
import { getGateways, addNewGateway } from 'Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import getTabBarIcon from '../../Lib/getTabBarIcon';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';

import i18n from '../../Translations/common';

import Theme from 'Theme';

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
	online: string;
	offline: string;
	noLiveUpdates: string;

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

		this.online = formatMessage(i18n.online);
		this.offline = formatMessage(i18n.offline);
		this.noLiveUpdates = formatMessage(i18n.noLiveUpdates);

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

	getLocationStatus(online, websocketOnline) {
		let { locationOffline, locationOnline, locationNoLiveUpdates } = Theme.Core;
		if (!online) {
			return (
				<View style={styles.statusInfoCover}>
					<View style={[styles.statusInfo, { backgroundColor: locationOffline}]}/>
					<Text style={styles.statusText}>
						{this.offline}
					</Text>
				</View>
			);
		} else if (!websocketOnline) {
			return (
				<View style={styles.statusInfoCover}>
					<View style={[styles.statusInfo, { backgroundColor: locationNoLiveUpdates}]}/>
					<Text style={styles.statusText}>
						{this.noLiveUpdates}
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.statusInfoCover}>
				<View style={[styles.statusInfo, { backgroundColor: locationOnline}]}/>
				<Text style={styles.statusText}>
					{this.online}
				</Text>
			</View>
		);
	}

	renderRow(location) {
		let { name, type, online, websocketOnline } = location;
		let { appLayout } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let rowWidth = isIphoneX() ? (isPortrait ? width - 20 : width - 125 ) : width - 20;
		let rowHeight = isPortrait ? height * 0.13 : width * 0.13;

		let info = this.getLocationStatus(online, websocketOnline);

		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};
		return (
			<View style={styles.rowItemsCover}>
				<DeviceLocationDetail {...locationData} style={{ height: rowHeight, width: rowWidth, marginVertical: 5 }}/>
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
		let { appLayout } = this.props;
		return (
			<View style={{flex: 1}}>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					onRefresh={this.onRefresh}
					style={{paddingTop: 10}}
					key={appLayout.width}
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
		flex: 1,
		alignItems: 'center',
	},
	statusInfoCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	statusInfo: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginTop: 3,
		marginRight: 5,
	},
	statusText: {
		fontSize: 13,
		textAlignVertical: 'center',
		color: '#A59F9A',
		marginTop: 2,
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

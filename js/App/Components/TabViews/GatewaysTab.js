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
import { Dimensions, TouchableWithoutFeedback } from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

import { List, ListDataSource, View, StyleSheet } from 'BaseComponents';
import DeviceLocationDetail from './../DeviceDetails/SubViews/DeviceLocationDetail';
import { getGateways } from 'Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import getTabBarIcon from '../../Lib/getTabBarIcon';
import getLocationImageUrl from '../../Lib/getLocationImageUrl';

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
};

type State = {
	dataSource: Object,
	settings: false,
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

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
			}).cloneWithRows(this.props.rows),
			settings: false,
		};

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
		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
		};
		return (
			<View style={styles.rowItemsCover}>
				<DeviceLocationDetail {...locationData}/>
			</View>
		);
	}

	addLocation() {
	}

	render() {
		return (
			<View style={{marginTop: 10}}>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					onRefresh={this.onRefresh}
				/>
				<TouchableWithoutFeedback onPress={this.addLocation}>
					<View style={[styles.addButtonCover, styles.shadow]} />
				</TouchableWithoutFeedback>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	rowItemsCover: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: 5,
	},
	addButtonCover: {
		position: 'absolute',
		backgroundColor: Theme.Core.brandSecondary,
		height: 60,
		width: 60,
		borderRadius: 60,
		top: deviceHeight * 0.6,
		left: deviceWidth * 0.78,
	},
	shadow: {
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 60,
		shadowOpacity: 1.0,
		elevation: 15,
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
	};
}

module.exports = connect(mapStateToProps)(GatewaysTab);

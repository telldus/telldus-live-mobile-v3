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

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import { View, ListDataSource, List } from 'BaseComponents';
import Theme from 'Theme';
import Row from './Row';

type Props = {
	navigation: Object,
	actions: Object,
	width: Number,
	devices: Object,
	onDidMount: (string, string, ?Object) => void,
	reset: () => void,
};

type State = {
	dataSource: Object,
};

class Device extends View {

	props: Props;
	state: State;

	onRefresh: () => void;
	renderRow: (Object) => Object;
	selectDevice: (Object) => void;

	constructor(props) {
		super(props);

		this.deviceWidth = Dimensions.get('window').width;

		this.h1 = '1. Device';
		this.h2 = 'Choose a device';

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(this.props.devices.byId),
		};
	}

	componentDidMount() {
		const { actions, onDidMount, navigation, reset } = this.props;

		if (navigation.state.params && navigation.state.params.reset) {
			return reset();
		}

		const { h1, h2 } = this;
		actions.getDevices();
		onDidMount(h1, h2);
	}

	onRefresh = () => {
		this.props.actions.getDevices();
	};

	selectDevice = device => {
		const { actions, navigation } = this.props;
		actions.selectDevice(device.id);
		navigation.navigate('Action');
	};

	renderRow = row => {
		const preparedRow = Object.assign({}, row,
			{
				description: 'Fibaro Plug 2',
				icon: 'device-alt',
			}
		);

		return (
			<Row
				row={preparedRow}
				textColor={Theme.Core.brandSecondary}
				bgColor={Theme.Core.brandPrimary}
				select={this.selectDevice}
				width={this.props.width}
				marginBottom={this.deviceWidth * 0.006666667}
				iconSize={56}
			/>
		);
	};

	render() {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this.renderRow}
				onRefresh={this.onRefresh}
			/>
		);
	}
}

Device.propTypes = {
	navigation: PropTypes.object,
	actions: PropTypes.object,
	width: PropTypes.number,
	onDidMount: PropTypes.func,
	reset: PropTypes.func,
};

const mapStateToProps = ({ devices }) => (
	{
		devices,
	}
);

module.exports = connect(mapStateToProps)(Device);

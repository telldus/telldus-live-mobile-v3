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
import { View, ListDataSource, List } from 'BaseComponents';
import { getDevices } from 'Actions_Devices';
import { selectDevice } from 'Actions_AddSchedule';
import Theme from 'Theme';
import Row from './Row';

type Props = {
	goNext: () => void,
	padding: Number,
	devices: Object,
	getDevices: Function,
	selectDevice: Function,
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

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(this.props.devices.byId),
		};
	}

	componentDidMount() {
		this.props.getDevices();
	}

	onRefresh = () => {
		this.props.getDevices();
	};

	selectDevice = device => {
		this.props.selectDevice(device);
		this.props.goNext();
	};

	renderRow = row => {
		const preparedRow = Object.assign({}, row,
			{
				description: 'Fibaro Plug 2',
				imageSource: require('./img/device-alt.png'),
				textColor: Theme.Core.brandSecondary,
				bgColor: Theme.Core.brandPrimary,
			}
		);

		return (
			<Row
				row={preparedRow}
				select={this.selectDevice}
				padding={this.props.padding}
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
	goNext: React.PropTypes.func,
	padding: React.PropTypes.number,
	getDevices: React.PropTypes.func,
	selectDevice: React.PropTypes.func,
};

const mapStateToProps = ({ devices }) => (
	{
		devices,
	}
);

const mapDispatchToProps = dispatch => (
	{
		getDevices: () => dispatch(getDevices()),
		selectDevice: device => dispatch(selectDevice(device)),
	}
);

module.exports = connect(mapStateToProps, mapDispatchToProps)(Device);

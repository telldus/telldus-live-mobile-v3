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
import { View, ListDataSource, List, Text } from 'BaseComponents';
import { selectAction } from 'Actions_AddSchedule';
import Row from './Row';

// TODO: remove temp data
const actions = [
	{
		name: 'On',
		description: 'Turns the device on',
	},
	{
		name: 'Off',
		description: 'Turns the device off',
	},
];

type Props = {
	goNext: () => void,
	padding: Number,
	selectAction: Function,
};

type State = {
	dataSource: Object,
};

class Action extends View {

	props: Props;
	state: State;

	constructor(props) {
		super(props);

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(actions),
		};
	}

	onRefresh = () => {
		//console.log('refresh');
	};

	selectAction = action => {
		this.props.selectAction(action);
		this.props.goNext();
	};

	renderRow = row => {
		const color = (row.name === 'On') ? '#43a047' : '#e53935';

		const preparedRow = Object.assign({}, row,
			{
				imageSource: require('./img/power.png'),
				textColor: color,
				bgColor: color,
			}
		);

		return (
			<Row
				row={preparedRow}
				select={this.selectAction}
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

Action.propTypes = {
	goNext: React.PropTypes.func,
	padding: React.PropTypes.number,
	selectAction: React.PropTypes.func,
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = dispatch => ({
	selectAction: action => dispatch(selectAction(action)),
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Action);

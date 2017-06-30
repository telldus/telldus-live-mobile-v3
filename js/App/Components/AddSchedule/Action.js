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
import { Dimensions } from 'react-native';
import { View, ListDataSource, List, Text } from 'BaseComponents';
import Row from './SubViews/Row';
import Theme from 'Theme';

const actions = [
	{
		name: 'On',
		description: 'Turns the device on',
		bgColor: Theme.Core.brandSecondary,
		textColor: Theme.Core.brandSecondary,
		icon: 'on',
	},
	{
		name: 'Off',
		description: 'Turns the device off',
		bgColor: '#999',
		textColor: '#999',
		icon: 'off',
	},
	{
		name: 'Dim',
		description: 'Dims the device',
		bgColor: 'rgba(226, 105, 1, 0.80)',
		textColor: Theme.Core.brandSecondary,
		icon: 'dim',
	},
];

type Props = {
	navigation: Object,
	actions: Object,
	width: Number,
	onDidMount: (string, string, ?Object) => void,
};

type State = {
	dataSource: Object,
};

class Action extends View {

	props: Props;
	state: State;

	selectAction: (Object) => void;
	renderRow: (Object) => Object;

	constructor(props) {
		super(props);

		this.deviceWidth = Dimensions.get('window').width;

		this.h1 = '2. Action';
		this.h2 = 'Choose an action to execute';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
			}).cloneWithRows(actions),
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	selectAction = action => {
		const { actions, navigation } = this.props;
		actions.selectAction(action.method);
		navigation.navigate('Time');
	};

	renderRow = row => (
		<Row
			row={row}
			select={this.selectAction}
			width={this.props.width}
			bgColor={row.bgColor}
			textColor={row.textColor}
			iconSize={this.deviceWidth * 0.092}
		/>
	);

	render() {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this.renderRow}
			/>
		);
	}
}

Action.propTypes = {
	navigation: PropTypes.object,
	actions: PropTypes.object,
	width: PropTypes.number,
	onDidMount: PropTypes.func,
};

module.exports = Action;
